import { Given, Then, Before, After } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import v8toIstanbul from 'v8-to-istanbul';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

declare module '@cucumber/cucumber' {
  interface World {
    browser: Browser;
    page: Page;
  }
}

Before(async function () {
  this.browser = await chromium.launch();
  this.page = await this.browser.newPage();
  await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
});

After(async function () {
  const entries = await this.page.coverage.stopJSCoverage();
  const allCoverage: Record<string, unknown> = {};

  for (const entry of entries) {
    if (!entry.source) continue;

    // webpack dev mode wraps each module in eval() with a webpack-internal:// sourceURL.
    // Only process project source files (not node_modules).
    const isWebpackModule = entry.url.startsWith('webpack-internal:///');
    const isNextChunk = entry.url.includes('/_next/');
    if (!isWebpackModule && !isNextChunk) continue;
    if (entry.url.includes('node_modules')) continue;

    try {
      // Decode inline source map (data URL) if present
      let sourceMap: object | undefined;
      const sourceMapMatch = entry.source.match(/\/\/[#@] sourceMappingURL=(.+)$/m);
      if (sourceMapMatch) {
        const sourceMapUrl = sourceMapMatch[1].trim();
        if (sourceMapUrl.startsWith('data:')) {
          // Inline base64-encoded source map
          const base64 = sourceMapUrl.split(',')[1];
          if (base64) sourceMap = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        } else {
          try {
            const resolvedUrl = new URL(sourceMapUrl, entry.url).href;
            const res = await fetch(resolvedUrl);
            if (res.ok) sourceMap = await res.json();
          } catch {
            // No external source map available
          }
        }
      }

      const sources = sourceMap
        ? { source: entry.source, sourceMap: { sourcemap: sourceMap } }
        : { source: entry.source };

      const converter = v8toIstanbul(entry.url, 0, sources);
      await converter.load();
      converter.applyCoverage(entry.functions);
      Object.assign(allCoverage, converter.toIstanbul());
    } catch {
      // Skip entries that cannot be converted
    }
  }

  // Normalize coverage keys: resolve mangled paths back to real filesystem paths.
  // v8-to-istanbul produces different path formats depending on the build mode:
  //   Turbopack prod: .../turbopack:/[project]/project-name/src/app/page.tsx
  //   Webpack prod:   .../chunks/app/_N_E/src/app/page.tsx
  //   Webpack dev:    webpack-internal:///(app-pages-browser)/./src/app/page.tsx
  const projectRoot = process.cwd();
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(allCoverage)) {
    let newKey = key;

    // Turbopack production: extract path after [project]/project-name/
    const turbopackMatch = key.match(/\[project\]\/[^/]+\/(.+)$/);
    if (turbopackMatch) {
      newKey = path.resolve(projectRoot, turbopackMatch[1]);
    }
    // Webpack production: extract path after _N_E/
    else if (key.includes('/_N_E/')) {
      const webpackProdMatch = key.match(/_N_E\/(.+)$/);
      if (webpackProdMatch) newKey = path.resolve(projectRoot, webpackProdMatch[1]);
    }
    // Webpack dev: extract path after (app-pages-browser)/./
    else if (key.includes('webpack-internal:///')) {
      const webpackMatch = key.match(/\(app-pages-browser\)\/\.\/(.+)$/);
      if (webpackMatch) newKey = path.resolve(projectRoot, webpackMatch[1]);
    }

    // Update the path inside the coverage data object too
    const entry = value as { path?: string };
    if (entry.path) entry.path = newKey;
    normalized[newKey] = entry;
  }

  if (Object.keys(normalized).length > 0) {
    const outputDir = path.resolve('.nyc_output');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, `${randomUUID()}.json`),
      JSON.stringify(normalized)
    );
  }

  await this.browser?.close();
});

Given('I navigate to the home page', async function () {
  await this.page.goto('http://localhost:3000');
});

Then('I should see the page heading', async function () {
  await this.page.waitForSelector('h1', { timeout: 5000 });
});

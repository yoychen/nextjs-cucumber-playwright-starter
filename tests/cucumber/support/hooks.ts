import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import MCR from "monocart-coverage-reports";

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

declare module "@cucumber/cucumber" {
  interface World {
    context: BrowserContext;
    page: Page;
  }
}

let browser: Browser;

const mcr = MCR({
  outputDir: "./reports/coverage",
  reports: ["v8", "console-details", "html", "lcovonly", "cobertura"],
  entryFilter: (entry) => {
    // Dev: source-mapped webpack-internal entries for our src/ code
    if (entry.url.startsWith("webpack-internal://")) {
      return entry.url.includes("/./src/");
    }
    // Production: app chunks with hashed names (e.g. page-570d20f13482a506.js)
    // Dev chunks have no hash (page.js) — skip them since webpack-internal covers the source
    return /\/_next\/static\/chunks\/app\/.+-[a-f0-9]+\.js$/.test(entry.url);
  },
  sourceFilter: (sourcePath: string) => {
    // Only keep source files under src/, exclude any node_modules
    return sourcePath.includes("src/") && !sourcePath.includes("node_modules");
  },
  sourcePath: (filePath: string) => {
    // Strip _N_E/ prefix from production source map paths
    return filePath.replace(/^_N_E\//, "");
  },
});

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: process.env.HEADED !== "true",
  });
});

Before(async function () {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();
  await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
});

After(async function () {
  const coverageList = await this.page.coverage.stopJSCoverage();
  await mcr.add(coverageList);
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
  await mcr.generate();
});

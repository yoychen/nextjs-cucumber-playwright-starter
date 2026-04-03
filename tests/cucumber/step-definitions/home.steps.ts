import { Given, Then, Before, After, AfterAll } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import MCR from 'monocart-coverage-reports';

declare module '@cucumber/cucumber' {
  interface World {
    browser: Browser;
    page: Page;
  }
}

const mcr = MCR({
  outputDir: './reports/coverage',
  reports: ['v8', 'console-details', 'html', 'lcovonly'],
  sourceFilter: (sourcePath: string) => {
    return sourcePath.includes('src/app/') && !sourcePath.includes('node_modules');
  },
});

Before(async function () {
  this.browser = await chromium.launch();
  this.page = await this.browser.newPage();
  await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
});

After(async function () {
  const coverageList = await this.page.coverage.stopJSCoverage();
  await mcr.add(coverageList);
  await this.browser?.close();
});

AfterAll(async function () {
  await mcr.generate();
});

Given('I navigate to the home page', async function () {
  await this.page.goto('http://localhost:3000');
});

Then('I should see the page heading', async function () {
  await this.page.waitForSelector('h1', { timeout: 5000 });
});

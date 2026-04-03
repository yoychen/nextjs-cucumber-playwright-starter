import { Given, Then } from '@cucumber/cucumber';

Given('I navigate to the home page', async function () {
  await this.page.goto('http://localhost:3000');
});

Then('I should see the page heading', async function () {
  await this.page.waitForSelector('h1', { timeout: 5000 });
});

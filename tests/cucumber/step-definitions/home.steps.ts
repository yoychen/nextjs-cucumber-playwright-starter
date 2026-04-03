import { Given, Then } from "@cucumber/cucumber";
import { BASE_URL } from "../support/hooks";

Given("I navigate to the home page", async function () {
  await this.page.goto(BASE_URL);
});

Then("I should see the page heading", async function () {
  await this.page.waitForSelector("h1", { timeout: 5000 });
});

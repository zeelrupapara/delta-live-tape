import { expect, test } from "@playwright/test";

test.describe("Delta Live Tape — smoke", () => {
  test("header renders with SWTS branding and live/offline dot", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("app-header")).toBeVisible();
    await expect(page.getByTestId("app-header")).toContainText("SWTS");
    await expect(page.getByTestId("conn-dot")).toBeVisible();
  });

  test("BTCUSD shows the Bitcoin Heartbeat title", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("symbol-BTCUSD").click();
    await expect(page.getByTestId("chart-title")).toHaveText("Bitcoin Heartbeat");
  });

  test("ETHUSD does not use the Bitcoin Heartbeat title", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("symbol-ETHUSD").click();
    await expect(page.getByTestId("chart-title")).not.toHaveText("Bitcoin Heartbeat");
  });

  test("spread tooltip contains the magic phrase", async ({ page }) => {
    await page.goto("/");
    const tooltip = page.getByTestId("spread-tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Spread");
    // The hint text lives inside the .tip span and is shown on hover.
    await expect(tooltip.locator(".tip")).toHaveText("May the spread be tight");
  });

  test("core panels are mounted", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("metrics")).toBeVisible();
    await expect(page.getByTestId("orderbook")).toBeVisible();
    await expect(page.getByTestId("tape")).toBeVisible();
    await expect(page.getByTestId("chart")).toBeVisible();
  });
});

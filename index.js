const express = require("express"); const puppeteer = require("puppeteer"); const config = require("./util/config"); const { gameMonitor } = require("./game/gameMonitor"); const BettingStrategy = require("./game/strategies");
const app = express();
app.get("/", (req, res) => { res.send("Aviator Bot Running"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Express server running"); });
async function initializeBrowser() { const browser = await puppeteer.launch({ headless: true, args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ] });
const page = await browser.newPage(); page.setDefaultNavigationTimeout(60000);
return { browser, page }; }
async function navigateInitialPages(page) { await page.goto(config?.NAVIGATION?.BASE_URL || "https://example.com�");
const selectors = config?.SELECTORS?.INITIAL || {};
for (const [name, selector] of Object.entries(selectors)) { try { await page.waitForSelector(selector, { timeout: 60000 }); await page.click(selector); console.log("Clicked " + name); await page.waitForTimeout(1000); } catch (error) { console.error("Failed to click " + name + ": " + error.message); } } }
async function main() { try { console.log("Starting Aviator Bot...");
const strategyConfig =
  config?.BETTING_STRATEGIES?.MODERATE || {
    initialBet: 10,
    maxBet: 100,
    minBet: 1,
    targetMultiplier: 1.5,
    stopLoss: 50,
    takeProfit: 100,
    martingaleMultiplier: 2
  };

const { browser, page } = await initializeBrowser();

console.log("Browser initialized");

await navigateInitialPages(page);

console.log("Launching game monitor");

gameMonitor(page, strategyConfig);

console.log("Bot ready");
} catch (error) { console.error("Bot initialization error:", error.message); } }
process.on("unhandledRejection", (reason) => { console.error("Unhandled Rejection:", reason); });
process.on("uncaughtException", (error) => { console.error("Uncaught Exception:", error); });
main();

const express = require("express"); const puppeteer = require("puppeteer"); const config = require("./util/config"); const GameMonitor = require("./game/gameMonitor"); const BettingStrategy = require("./game/strategies");
const app = express();
app.get("/", (req, res) => { res.send("Aviator Bot Running"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Express server running"); });
async function initializeBrowser() { const browser = await puppeteer.launch({ headless: true, args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ] });
const page = await browser.newPage(); page.setDefaultNavigationTimeout(config.NAVIGATION.TIMEOUT);
return { browser, page }; }
async function navigateInitialPages(page) { await page.goto(config.NAVIGATION.BASE_URL);
for (const [name, selector] of Object.entries(config.SELECTORS.INITIAL)) { try { await page.waitForSelector(selector, { timeout: config.NAVIGATION.TIMEOUT }); await page.click(selector); console.log("Clicked " + name); await page.waitForTimeout(1000); } catch (error) { console.error("Failed to click " + name + ": " + error.message); throw error; } } }
async function handleNewTab(target, browser, strategyConfig) { if (target.type() === "page") { const newPage = await target.page();
if (newPage) {
  try {
    await newPage.waitForNavigation({ timeout: config.NAVIGATION.TIMEOUT });

    const gameMonitor = new GameMonitor(newPage, config);

    if (strategyConfig) {
      gameMonitor.strategy = new BettingStrategy(strategyConfig);
    }

    newPage.on("error", error => {
      console.error("Page error: " + error.message);
    });

    newPage.on("pageerror", error => {
      console.error("Page error: " + error.message);
    });

    gameMonitor.startMonitoring();

  } catch (error) {
    console.error("Error in new tab: " + error.message);
    await newPage.close();
  }
}
} }
async function main() { try { console.log("Starting Aviator Bot...");
const strategyConfig = config.BETTING_STRATEGIES.MODERATE;

const { browser, page } = await initializeBrowser();

await navigateInitialPages(page);

browser.on("targetcreated", (target) =>
  handleNewTab(target, browser, strategyConfig)
);
} catch (error) { console.error("Bot initialization error: " + error.message); process.exit(1); } }
process.on("unhandledRejection", (reason) => { console.error("Unhandled Rejection:", reason); });
process.on("uncaughtException", (error) => { console.error("Uncaught Exception:", error); process.exit(1); });
main();

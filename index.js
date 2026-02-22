const express = require("express"); const puppeteer = require("puppeteer"); const GameMonitor = require("./game/gameMonitor"); const BettingStrategy = require("./game/strategies");
const app = express();
app.get("/", (req, res) => { res.send("Aviator Bot Running"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Express server running"); });
const strategyConfig = { initialBet: 10, maxBet: 100, minBet: 1, targetMultiplier: 1.5, stopLoss: 50, takeProfit: 100, martingaleMultiplier: 2 };
async function initializeBrowser() { const browser = await puppeteer.launch({ headless: true, args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ] });
const page = await browser.newPage(); page.setDefaultNavigationTimeout(60000);
return { browser, page }; }
async function main() { try { console.log("Starting Aviator Bot...");
const { browser, page } = await initializeBrowser();

await page.goto("https://example.com");

const gameMonitor = new GameMonitor(page, {});
gameMonitor.strategy = new BettingStrategy(strategyConfig);

gameMonitor.startMonitoring();
} catch (error) { console.error("Bot initialization error:", error.message); } }
process.on("unhandledRejection", (reason) => { console.error("Unhandled Rejection:", reason); });
process.on("uncaughtException", (error) => { console.error("Uncaught Exception:", error); });
main();

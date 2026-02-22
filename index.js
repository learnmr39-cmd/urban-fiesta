const express = require("express"); const puppeteer = require("puppeteer"); const { gameMonitor } = require("./game/gameMonitor");
const app = express();
app.get("/", (req, res) => { res.send("Aviator Bot Running"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Express server running"); });
async function initializeBrowser() { const browser = await puppeteer.launch({ headless: true, args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ] });
const page = await browser.newPage(); page.setDefaultNavigationTimeout(60000);
return { browser, page }; }
async function main() { try { console.log("Starting Aviator Bot...");
const { browser, page } = await initializeBrowser();

await page.goto("https://example.com");

console.log("Browser launched successfully");

gameMonitor(page);

console.log("Bot ready");
} catch (error) { console.error("Bot initialization error:", error.message); } }
process.on("unhandledRejection", (reason) => { console.error("Unhandled Rejection:", reason); });
process.on("uncaughtException", (error) => { console.error("Uncaught Exception:", error); });
main();

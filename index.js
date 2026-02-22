const express = require("express"); const puppeteer = require('puppeteer'); const config = require('./util/config'); const logger = require('./util/logger'); const GameMonitor = require('./game/gameMonitor'); const BettingStrategy = require('./game/strategies');
const app = express();
app.get("/", (req, res) => { res.send("Aviator Bot Running"); });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Express server running"); });
async function initializeBrowser() { const browser = await puppeteer.launch({ headless: true, args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage" ] });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(config.NAVIGATION.TIMEOUT);

return { browser, page };
}
async function navigateInitialPages(page) { await page.goto(config.NAVIGATION.BASE_URL);
for (const [name, selector] of Object.entries(config.SELECTORS.INITIAL)) {
    try {
        await page.waitForSelector(selector, { timeout: config.NAVIGATION.TIMEOUT });
        await page.click(selector);
        logger.info(`Clicked ${name}`);
        await page.waitForTimeout(1000);
    } catch (error) {
        logger.error(`Failed to click ${name}: ${error.message}`);
        throw error;
    }
}
}
async function handleNewTab(target, browser, strategyConfig) { if (target.type() === 'page') { const newPage = await target.page();
if (newPage) {
        try {
            await newPage.waitForNavigation({ timeout: config.NAVIGATION.TIMEOUT });

            const gameMonitor = new GameMonitor(newPage, config);

            if (strategyConfig) {
                gameMonitor.strategy = new BettingStrategy(strategyConfig);
            }

            newPage.on('error', error => {
                logger.error(`Page error: ${error.message}`);
            });

            newPage.on('pageerror', error => {
                logger.error(`Page error: ${error.message}`);
            });

            gameMonitor.startMonitoring();

        } catch (error) {
            logger.error(`Error in new tab: ${error.message}`);
            await newPage.close();
        }
    }
}
}
async function main() { try { logger.info('Starting Aviator Bot...');
const strategyConfig = config.BETTING_STRATEGIES.MODERATE;

    const { browser, page } = await initializeBrowser();

    await navigateInitialPages(page);

    browser.on('targetcreated', (target) => handleNewTab(target, browser, strategyConfig));

} catch (error) {
    logger.error(`Bot initialization error: ${error.message}`);
    process.exit(1);
}
}
process.on('unhandledRejection', (reason, promise) => { logger.error('Unhandled Rejection:', reason); });
process.on('uncaughtException', (error) => { logger.error('Uncaught Exception:', error); process.exit(1); });
main();

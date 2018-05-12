const puppeteer = require('puppeteer');
const env = require('node-env-file');
const moment = require('moment');

console.logCopy = console.log.bind(console);
console.log = function (data) {
    var timestamp = '[' + new Date().toLocaleString() + '] ';
    this.logCopy(timestamp, data);
};

env(__dirname + '/.env');

const TRADINGVIEW_URL = process.env.TRADINGVIEW_URL;
const USERID = process.env.UID_TRADINGVIEW;
const PASSWORD = process.env.PASSWORD_TRADINGVIEW;
const FAKE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5';

const codes = [6301, 6302, 6305, 6326, 6361, 6366]

const launchBrowser = async () => {
    const browser = await puppeteer.launch({headless: true});
    return browser
}

const loginFirst = async (browser) => {
    const page = await browser.newPage();

    await page.setUserAgent(FAKE_USER_AGENT);
    await page.goto(TRADINGVIEW_URL);
    await page.waitFor(3000);

    await page.type('input[name="username"]', USERID);
    await page.type('input[name="password"]', PASSWORD);
    const submitButtonElement = await page.$('button[type=submit]');
    await submitButtonElement.click();
    await page.waitFor(500);
    page.on('dialog', async dialog => {
        await dialog.accept();
    });
    return page;
}

const fetchChartImages = async (page, code) => {
    await page.goto(`https://www.tradingview.com/chart/?symbol=TSE:${code}`, {"waitUntil": "networkidle0"});
    await page.waitFor(3000);
    const chartArea = await page.$('table.chart-markup-table')
    const clipArea = await chartArea.boundingBox();
    await page.screenshot({
        path: './' + code + '_tradingview_' + moment().format('YY-MM-DD h:mm') + '.png',
        clip: clipArea
    });
    await page.waitFor(500)
    console.log("retried a chart image for " + code)

}

const run = async () => {
    const browser = await launchBrowser();
    const page = await loginFirst(browser)
    for (let code of codes) {
        await fetchChartImages(page, code)
    }
    await browser.close();

}

run()
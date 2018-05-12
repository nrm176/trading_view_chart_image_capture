const puppeteer = require('puppeteer');
const env = require('node-env-file');
const moment = require('moment');

console.logCopy = console.log.bind(console);
console.log = function (data) {
    var timestamp = '[' + new Date().toUTCString() + '] ';
    this.logCopy(timestamp, data);
};

env(__dirname + '/.env');

const TRADINGVIEW_URL = process.env.TRADINGVIEW_URL;
const USERID = process.env.UID_TRADINGVIEW;
const PASSWORD = process.env.PASSWORD_TRADINGVIEW;


// (async () => {
//
//     const browser = await puppeteer.launch({headless: true});
//     const page = await browser.newPage();
//
//     await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5');
//     await page.goto(TRADINGVIEW_URL);
//     await page.waitFor(3000);
//
//     await page.type('input[name="username"]', USERID);
//     await page.type('input[name="password"]', PASSWORD);
//     const submitButtonElement = await page.$('button[type=submit]');
//     await submitButtonElement.click();
//     await page.waitFor(500);
//
//     // const codes = [1332,1333,1605,1721,1801,1802,1803,1808,1812,1925,1928,1963,2002,2269,2282,2432,
//     //     2501,2502,2503,2531,2768,2801,2802,2871,2914,3086,3099,3101,3103,3105,3289,3382,3401,3402,
//     //     3405,3407,3436,3861,3863,3865,4004,4005,4021,4042,4043,4061,4063,4151,4183,4188,4208,4272,
//     //     4324,4452,4502,4503,4506,4507,4519,4523,4543,4568,4578,4689,4704,4755,4901,4902,4911,5002,
//     //     5020,5101,5108,5201,5202,5214,5232,5233,5301,5332,5333,5401,5406,5411,5413,5541,5631,5703,
//     //     5706,5707,5711,5713,5714,5715,5801,5802,5803,5901,6103,6113,6301,6302,6305,6326,6361,6366,
//     //     6367,6471,6472,6473,6479,6501,6502,6503,6504,6506,6508,6674,6701,6702,6703,6752,6758,6762,
//     //     6770,6773,6841,6857,6902,6952,6954,6971,6976,6988,7003,7004,7011,7012,7013,7186,7201,7202,
//     //     7203,7205,7211,7261,7267,7269,7270,7272,7731,7733,7735,7751,7752,7762,7911,7912,7951,8001,
//     //     8002,8015,8028,8031,8035,8053,8058,8233,8252,8253,8267,8303,8304,8306,8308,8309,8316,8331,
//     //     8354,8355,8411,8601,8604,8628,8630,8725,8729,8750,8766,8795,8801,8802,8804,8830,9001,9005,
//     //     9007,9008,9009,9020,9021,9022,9062,9064,9101,9104,9107,9202,9301,9412,9432,9433,9437,9501,
//     //     9502,9503,9531,9532,9602,9613,9681,9735,9766,9983,9984]
//
//     const codes = [6301,6302,6305,6326,6361,6366]
//
//     page.on('dialog', async dialog => {
//         await dialog.accept();
//     });
//
//     const promises = []
//     for (let code of codes){
//
//         await page.goto(`https://www.tradingview.com/chart/?symbol=TSE:${code}`, {"waitUntil" : "networkidle0"});
//         // await page.waitFor(5000)
//         const chartArea = await page.$('table.chart-markup-table')
//         const clipArea = await chartArea.boundingBox();
//         await page.screenshot({path: './' + code + '_tradingview_' + moment().format('YY-MM-DD h:mm') + '.png', clip: clipArea});
//         await page.waitFor(500)
//         console.log("retried a chart image for " + code)
//     }
//
//     await browser.close()
//
//
//
//
// })();

const codes = [6301, 6302, 6305, 6326, 6361, 6366]

const launchBrowser = async () => {
    const browser = await puppeteer.launch({headless: true});
    return browser
}

const loginFirst = async (browser) => {
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5');
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
const puppeteer = require("puppeteer");
const useProxy = require('puppeteer-page-proxy');

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
      // `--proxy-server=http://95.31.211.120:30266`,
    ],
  });

  const page = await browser.newPage();
  Object.defineProperty(page.constructor, 'name', {
    get() {
      return 'CDPPage';
    },
  });

  page.eventsMap = new Map([['request', [{ name: '$ppp_requestListener' }]]]);
  
  await useProxy(page, "http://675e6d292f:9e667f5027@95.31.211.120:30266");  
  
  // await page.setRequestInterception(true);
  // page.on('request', async (req) => req.continue());

  await page.goto("https://www.whatismyip.com");
  // await page.waitForTimeout(10000);
  // await browser.close();
})();

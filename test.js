const puppeteer = require("puppeteer");
const useProxy = require("puppeteer-page-proxy");

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
  // await page.setJavaScriptEnabled(false)
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.resourceType() === "image" || req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || 
        req.url().includes('get_live_chat') || 
        req.url().includes('signaler-pa.youtube.com/punctual')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const time = Date.now();
  await page.goto(
    "https://www.youtube.com/live_chat?continuation=0ofMyAN-Gl5DaWtxSndvWVZVTTVVUzFVYkVSR01WQjZlak5wYVRsUFdtVlFNbE4zRWdzMk1DMTVkbkpPWW05dE5Cb1Q2cWpkdVFFTkNnczJNQzE1ZG5KT1ltOXROQ0FCTUFBJTNEMAGCAQYIBBgCIACIAQGgAZ6565q_84IDqAEAsgEA",
    {waitUntil: 'domcontentloaded'}
  );
  console.log(Date.now() - time);
  // await page.waitForTimeout(10000);
  // await browser.close();
})();

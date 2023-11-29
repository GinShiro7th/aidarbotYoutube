const puppeteer = require("puppeteer-extra");

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

  // await page.authenticate({ username: "675e6d292f", password: "9e667f5027" });

  await page.goto("https://www.whatismyip.com");
  // await page.waitForTimeout(10000);
  // await browser.close();
})();

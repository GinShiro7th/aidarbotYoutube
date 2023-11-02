// worker.js
const { parentPort, workerData } = require('worker_threads');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.connect({ browserWSEndpoint: workerData.browserWSEndpoint });

  const acc = workerData.cookies;

  const page = await browser.newPage();

  await page.setCookie(...acc.cookies);

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (
      req.resourceType() == "stylesheet" ||
      req.resourceType() == "font" ||
      req.resourceType() == 'image'
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(workerData.url, {timeout: 60000});

  await page.waitForSelector("#chatframe");
  const frames = await page.frames();
  const chatframe = frames.find((frame) => frame.name() === "chatframe");

  try {
    const comment = await chatframe.$(
      "#input.style-scope.yt-live-chat-message-input-renderer"
    );

    if (comment) {
      await comment.click();
      await comment.type("hello");
      await page.keyboard.press("Enter");
    }
  } catch (err) {
    console.log("error writing comment:", err);
  }

  await browser.close();
  parentPort.postMessage({ status: 'done' });
})();

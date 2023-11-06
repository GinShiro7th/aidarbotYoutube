// worker.js
const { parentPort, workerData } = require('worker_threads');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.connect({ browserWSEndpoint: workerData.endPoint});
  const acc = workerData.cookies;
  
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setCookie(...acc.cookies);
  
  try {
    await page.goto(workerData.url, { timeout: 120 * 1000 });
    
    await page.waitForSelector("#chatframe", {timeout: 60 * 1000});
    const frames = await page.frames();
    const chatframe = frames.find((frame) => frame.name() === "chatframe");
    
    await chatframe.waitForSelector("#input.style-scope.yt-live-chat-message-input-renderer", {timeout: 60 * 1000});
    
    // await page.waitForTimeout(500);

    const comment = await chatframe.$(
      "#input.style-scope.yt-live-chat-message-input-renderer"
    );

    if (comment) {
      await comment.click();
      await comment.type("hello");
      await page.keyboard.press("Enter");
    }
    
    // await page.waitForTimeout(500);
    // await browser.close();

    
    parentPort.postMessage({ status: 'done' });
  } catch (err) {

    await page.waitForTimeout(500);
    await browser.close();
    
    parentPort.postMessage(
      { 
        status: 'error',
        errMsg: err.message
      }
    );
  }

})();

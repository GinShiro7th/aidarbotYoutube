const { parentPort, workerData } = require('worker_threads');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

(async () => {
  const cookies = workerData.cookies;
  const url = workerData.url;

  // Создаем отдельный экземпляр браузера
  const browser = await puppeteer.launch({
    headless: cookies.length < 10,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
      '--disable-dev-shm-usage',
    ],
  });
  const context = await browser.createIncognitoBrowserContext();

  try {
    for (const cookie of cookies) {
      const page = await context.newPage();
      await page.setCookie(...cookie.cookies);

      await page.goto(url, { timeout: 120 * 1000 });
      await page.waitForSelector("#chatframe", { timeout: 60 * 1000 });
      const frames = await page.frames();
      const chatframe = frames.find((frame) => frame.name() === "chatframe");
      await chatframe.waitForSelector("#input.style-scope.yt-live-chat-message-input-renderer", { timeout: 60 * 1000 });

      const comment = await chatframe.$("#input.style-scope.yt-live-chat-message-input-renderer");

      if (comment) {
        await comment.click();
        await comment.type("hello");
        await page.keyboard.press("Enter");
      }

      await page.waitForTimeout(500);
      await context.close();
    }

    parentPort.postMessage({ status: 'done' });
  } catch (err) {
    await browser.close();

    parentPort.postMessage(
      { 
        status: 'error',
        errMsg: err.message
      }
    );
  }
})();

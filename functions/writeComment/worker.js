const { parentPort, workerData } = require('worker_threads');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const botState = require('../botState.json');
const fs = require('fs');

const stop = require('./functions/botState.json');
stop.stoped = false;
fs.writeFile('./functions/botState.json', JSON.stringify(stop), function (err) {
  if (err) {
    return console.log(err);
  }
})

  (async () => {
    const cookies = workerData.cookies;
    const url = workerData.url;
    const text = workerData.text;

    // Создаем отдельный экземпляр браузера
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        '--disable-dev-shm-usage',
      ],
    });
    try {
      for (const cookie of cookies) {
        if (botState.stoped) break;
        const page = await browser.newPage();

        console.log(cookie.login, cookie.password);

        await page.setCookie(...cookie.cookies);

        try {
          await page.goto(url, { timeout: 60000 });

          const comment = await page.$(
            "#input.style-scope.yt-live-chat-message-input-renderer"
          );

          if (comment) {
            await comment.click();
            await comment.type(text);

            await page.keyboard.press("Enter");
            console.log("entered");
          }
        } catch (err) {
          console.log("error writing comment:", err.message);
        }
        await page.close();
      }
      await browser.close();
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
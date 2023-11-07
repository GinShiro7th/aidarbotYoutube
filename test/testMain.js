const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

const cookies = require("../cookies.json");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function(url){
  if (isMainThread) {
    let browsersNum = cookies.length / 10;
    const workers = [];

    for (let i = 0; i < browsersNum; i++) {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
          "--disable-dev-shm-usage",
        ],
      });

      const context = await browser.createIncognitoBrowserContext();

      const workersNum = 10;
      const pagesCount = {
        num: 0,
      };

      for (let j = i * workersNum; j < workersNum * (i + 1); j++) {
        if (j < cookies.length) {
          const worker = new Worker(__filename, {
            workerData: {
              i,
              j,
            },
          });

          worker.on("message", async (msg) => {
            const page = await context.newPage();
            await page.setCookie(...cookies[j].cookies);
            try {
              await page.goto(url, { timeout: 120 * 1000 });
              await page.waitForSelector("#chatframe", { timeout: 60 * 1000 });
              const frames = await page.frames();
              const chatframe = frames.find(
                (frame) => frame.name() === "chatframe"
              );
              await chatframe.waitForSelector(
                "#input.style-scope.yt-live-chat-message-input-renderer",
                { timeout: 60 * 1000 }
              );

              const comment = await chatframe.$(
                "#input.style-scope.yt-live-chat-message-input-renderer"
              );

              if (comment) {
                await comment.click();
                await comment.type("hello");
                await page.keyboard.press("Enter");
              }

              await page.close();
            } catch (err) {
              await page.close();
              console.log(`${cookies[j].login} - page error: `, err.message);
            }
            
            console.log(`браузер ${msg.i} страница ${msg.j}`);
            if (++pagesCount.num == workersNum) {
              await browser.close();
            }
          });

          workers.push(worker);
        }
      }
    }
  } else {
    parentPort.postMessage({
      i: workerData.i,
      j: workerData.j,
    });
  }
}

const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function (url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
      '--disable-dev-shm-usage',
    ],
  });
  const context = await browser.createIncognitoBrowserContext();

  let start = -1;
  const end = 3;
  console.log('start =', start, '\nend =', end);
  const iter = setInterval(async () => {
    if (++start < end){
      console.log(start);
      const curr = start;
      const page = await context.newPage();
      console.log(cookies[curr].login, cookies[curr].password);
      await page.setCookie(...cookies[curr].cookies);

      await page.goto(url, {timeout: 60000});

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
        console.log("error writing comment:", err.message);
      }
      
      await page.close();

    } else {
      console.log('done');
      clearInterval(iter);
    }
  }, 2000);
}
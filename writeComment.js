const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function (url) {
  // for (const acc of cookies){
  //   const browser = await puppeteer.launch({
  //   headless: false,
  //   args: [
  //       "--no-sandbox",
  //       "--disable-gpu",
  //       "--enable-webgl",
  //       "--window-size=1900,1200",
  //     ],
  //   });
  //   const page = await browser.newPage();

  //   await page.setCookie(...acc.cookies);
  //   await page.goto(url);

  //   await page.waitForSelector('#chatframe');
  //   const frames = await page.frames()
  //   const chatframe = frames.find(frame => frame.name() === 'chatframe');
  //   try {
  //     const comment = await chatframe.$('#input.style-scope.yt-live-chat-message-input-renderer');

  //     if (comment){
  //       await comment.click();

  //       await comment.type('hello');

  //       await page.keyboard.press('Enter');
  //     }
  //   } catch (err) {
  //     console.log('error writing comment:', err);
  //   }
  //   await browser.close();
  //   //await page.close();
  // }

  const end = cookies.length;
  let curr = -1;

  const iter = setInterval(async () => {
    if (++curr < end) {
      console.log(curr);
      const cock = cookies[curr].cookies;

      const browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
        ],
      });
      const page = await browser.newPage();
      await page.setCookie(...cock);

      await page.goto(url);

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
    } else {
      console.log("done");
      clearInterval(iter);
    }
  }, 2000);
  // setTimeout(async () => await browser.close(), 5 * 60 * 1000);
};
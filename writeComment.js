const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

//123
module.exports = async function(url){

  const browser = await puppeteer.launch({
    //headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1270",
    ],
  });

  for (const acc of cookies){
    const page = await browser.newPage();

    await page.setCookie(...acc.cookies);
    await page.goto(url, { waitUntil: 'load' });

    /*await page.evaluate(async () => {
      window.scrollBy(0, 400);
    });*/

    //await page.waitForTimeout(100);

    const frames = await page.frames();
    const chatframe = frames.find(frame => frame.name() === 'chatframe');
    try {
      await chatframe.waitForSelector('#input.style-scope.yt-live-chat-message-input-renderer');
      const comment = await chatframe.$('#input.style-scope.yt-live-chat-message-input-renderer');

      if (comment){
        await comment.click();

        await comment.type('закинь на деп');

        await page.keyboard.press('Enter');
      }
    } catch (err) {
      console.log('error writing comment:', err);
    }

    //await page.waitForTimeout(3000);
  }
  await browser.close();
}
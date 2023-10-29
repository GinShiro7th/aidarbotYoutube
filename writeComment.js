const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());


module.exports = async function(url) {

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
    ],
  });

  const end = cookies.length - 1;
  const curr = 0;

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'load'});

  await page.evaluate(async () => {
    window.scrollBy(0, 400);
  });

  await page.waitForTimeout(200);

  const frames = await page.frames()
  const chatframe = frames.find(frame => frame.name() === 'chatframe');
  let i = 0;
  let interv = setInterval(async () => {
    //for (const cock of cookies) {
    let cock = cookies[i];
    await page.setCookie(...cock.cookies);
    console.log(curr);
    try {
      const comment = await chatframe.$('#input.style-scope.yt-live-chat-message-input-renderer');
      if (comment) {
        await comment.click();
        await comment.type('hello' + (curr++));
        await page.keyboard.press('Enter');
      }
    } catch (err) {
      console.log('error writing comment:', err);
    }
    //}
    i++;
    if (i > cookies.length) return clearInterval(interv);
  }, 1000);
  //await browser.close();
}
const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const botState = require('./botState.json');

puppeteer.use(StealthPlugin());

module.exports = async function (url, text, num) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
      "--disable-dev-shm-usage",
    ],
  });
  
  const page = await browser.newPage();
  try {
    const index = Number(num);
    console.log(cookies[index].login, cookies[index].password);
    console.log(text);
    
    await page.setCookie(...cookies[index].cookies);

    await page.goto(url, { timeout: 60000 });

    await page.waitForSelector("#chatframe");
    const frames = await page.frames();
    const chatframe = frames.find((frame) => frame.name() === "chatframe");
    try {
      const comment = await chatframe.$(
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
  } catch (err) {
    console.log('error writing comment for one user:', err.message);
  }
  await page.close();

  await browser.close();
};
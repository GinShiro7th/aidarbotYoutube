const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const botState = require('./botState.json');
const { clear_temp_files } = require("../utils/functions");

puppeteer.use(StealthPlugin());

module.exports = async function (url, text, num) {
  let browser;
  try {
    const index = Number(num) - 1;
    console.log(cookies[index].email, cookies[index].password);
    
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: './temp_profile',
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        "--disable-dev-shm-usage",
        // `--proxy-server=${proxyServer}`
      ],
    });
    
    const page = await browser.newPage();
  
    await page.setCookie(...cookies[index].cookies);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // await page.waitForSelector("#chatframe");
    // const frames = await page.frames();
    // const chatframe = frames.find((frame) => frame.name() === "chatframe");
    try {
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
  } catch (err) {
    console.log('error writing comment for one user:', err.message);
  }
  await browser.close();
};
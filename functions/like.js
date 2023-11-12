const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function (url) {

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
    ],
  });

  for (const acc of cookies) {
    const page = await browser.newPage();
    await page.setCookie(...acc.cookies);
    try {
      await page.goto(url, { timeout: 60000 });

      const likeButton = await page.$('#segmented-like-button > ytd-toggle-button-renderer > yt-button-shape > button');
      console.log(likeButton);
      await likeButton.click();

    } catch (err) {
      console.log('no like button(');
    }
    await page.close();
  }

  await browser.close();
}
const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { clear_temp_files } = require("../utils/functions");

puppeteer.use(StealthPlugin());


module.exports = async function(url){
  
  for (const acc of cookies){
    const browser = await puppeteer.launch({
      headless: false,
      userDataDir: './temp_profile',
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=800,800",
      ],
    });

    const page = await browser.newPage();

    await page.setCookie(...acc.cookies);
    console.log(acc.email, acc.password);
    try {
      await page.goto(url, { waitUntil: 'load' });
    
      const subButton = await page.$('.yt-spec-touch-feedback-shape.yt-spec-touch-feedback-shape--touch-response-inverse');
      await subButton.click();

    } catch (err) {
      console.log('no sub button(', err.message);
    }
    await page.close();
    // clear_temp_files();
    await browser.close();
  }
}
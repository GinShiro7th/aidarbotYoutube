const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());


module.exports = async function(url){
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
    ],
  });

  for (const acc of cookies){
    const page = await browser.newPage();
    await page.setCookie(...acc.cookies);
    console.log(acc.login, acc.password);
    try {
      await page.goto(url, { waitUntil: 'load' });
    
      const subButton = await page.$('.yt-spec-touch-feedback-shape.yt-spec-touch-feedback-shape--touch-response-inverse');
      console.log(subButton);
      await subButton.click();

    } catch (err) {
      console.log('no sub button(');
    }
    await page.close();
  }
  await browser.close();
}
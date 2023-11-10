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
    
    await page.goto(url, {timeout : 60000});
    
    try {
      const likeButton = await page.$('.yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--segmented-start'.replace(' ', '.'));
      console.log(subButton);
      await subButton.click();

    } catch (err) {
      console.log('no sub button(');
    }
    break;
  }
  await browser.close();
}
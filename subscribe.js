const cookies = require("./cookies.json");
const dataForReq = require('./dataForReq.json');

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
const fs = require('fs');


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
    
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      if (interceptedRequest.isInterceptResolutionHandled()) return;
      if (interceptedRequest.url().includes("https://www.youtube.com/youtubei/v1/subscription/subscribe")){
        console.log(interceptedRequest.data);
        dataForReq.push({
          login: acc.login,
          password: acc.password,
          params: {
            key: interceptedRequest.url().split('?')[1].split('&')[0].replace('key=', ''),
            prettyPrint: false,
          },
        })
      };
      interceptedRequest.continue();
    });

    await page.goto(url, { waitUntil: 'load' });
    
    try {
      const subButton = await page.$('.yt-spec-touch-feedback-shape.yt-spec-touch-feedback-shape--touch-response-inverse');
      console.log(subButton);
      await subButton.click();

    } catch (err) {
      console.log('no sub button(');
    }
    break;
  }
  //await browser.close();
  fs.writeFile('./dataForReq.json', JSON.stringify(dataForReq, null, 2), (err) => {if (err) console.log(err)});
}
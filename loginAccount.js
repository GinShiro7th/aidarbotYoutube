const fs = require("fs");
const solveImageCaptcha = require('./solveImageCaptcha.js');
const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function(login, password){

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
    ],
  });

  const loginUrl =
    "https://accounts.google.com/AddSession?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-GB%26next%3D%252F&hl=en-GB&passive=false&service=youtube&uilel=0";
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 OPR/102.0.0.0";


  try {
    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.goto(loginUrl, { waitUntil: "networkidle2" });

    await page.type('input[type="email"]', login);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    try {
      const captchaImgElement = await page.$eval("#captchaimg", () => true).catch(() => false);
      if (captchaImgElement) {
        await solveImageCaptcha(page);
      };
    } catch (err) {
      console.log('no captcha(');
    }

    await page.waitForTimeout(1000);
    
    await page.type('input[type="password"]', password);
    await page.keyboard.press('Enter');
    
    await page.waitForNavigation('https://www.youtube.com/');
    const userCookies = await page.cookies();
    await page.click('#avatar-btn');
    const nickname = await page.$eval('#channel-container', elem => elem.textContent);
    await page.waitForTimeout(1000);

    await browser.close();

    if (userCookies[0].domain.includes('youtube')){
      const index = cookies.findIndex(item => item.login === login && item.password === password);
      index === -1 ?
      cookies.push({
        login: login,
        name: nickname,
        password: password,
        cookies: userCookies
      }) : cookies[index].cookies = userCookies;
    } 
    fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2), (err) => { if (err) console.log(err)});
  } catch (err) {
    console.log('login err', err.message);
  }
  await browser.close();
};

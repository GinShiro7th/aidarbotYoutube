const fs = require("fs");
const solveImageCaptcha = require("./solveImageCaptcha.js");
const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
// const puppeteer = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const { sleep, clear_temp_files } = require("../utils/functions.js");
puppeteer.use(StealthPlugin());


async function loginAccount(email, password) {

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './temp_profile',
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
      "--disable-web-security",
    ],
  });

  const loginUrl =
    "https://accounts.google.com/AddSession?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-GB%26next%3D%252F&hl=en-GB&passive=false&service=youtube&uilel=0";

  try {
    const page = await browser.newPage();
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 OPR/104.0.0.0";
    await page.setUserAgent(ua);
    
    await page.goto(loginUrl, { waitUntil: "networkidle2" });
    
    await page.type('input[type="email"]', email);
    await page.keyboard.press("Enter");
    await sleep(5000);

    try {
      const captchaImgElement = await page
        .$eval("#captchaimg", () => true)
        .catch(() => false);
      if (captchaImgElement) {
        await solveImageCaptcha(page);
      }
    } catch (err) {
      console.log("no captcha(");
    }

    await sleep(3000);

    await page.type('input[type="password"]', password);
    await page.keyboard.press("Enter");

    await page.waitForNavigation({'waitUntil': 'networkidle0'});
    await page.goto("https://www.youtube.com", {waitUntil: "domcontentloaded"});

    const userCookies = await page.cookies();
    await page.waitForSelector('#avatar-btn');
    await page.click("#avatar-btn");
    await page.waitForSelector('#channel-container');
    let nickname = await page.$eval(
      "#channel-container",
      (elem) => elem.textContent
    );
    console.log(nickname);
    const name = nickname.split("\n")[1].trim();
    console.log(name);

    await browser.close();
    clear_temp_files();

    if (userCookies[0].domain.includes("youtube")) {
      const index = cookies.findIndex(
        (item) => item.email === email && item.password === password
      );
      if (index === -1) {
        cookies.push({
          email,
          name,
          password,
          // proxy,
          cookies: userCookies,
        });
      } else {
        // cookies[index].proxy = proxy;
        cookies[index].name = name;
        cookies[index].cookies = userCookies;
      }
    }
    fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2), (err) => {
      if (err) console.log(err);
    });

  } catch (err) {
    console.log("email err", err);
    await browser.close();
  }
};

module.exports = loginAccount;

const fs = require("fs");
const solveImageCaptcha = require("./solveImageCaptcha.js");
const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function loginAccount(login, password, proxy) {

  const proxyServer = proxy.replace(/\/(.*?)@/g, "//");
  const proxyUsername = proxy.substring(proxy.lastIndexOf('/')+1, proxy.indexOf('@')).split(':')[0];
  const proxyPassword = proxy.substring(proxy.lastIndexOf('/')+1, proxy.indexOf('@')).split(':')[1];

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
      "--disable-web-security",
      `--proxy-server=${proxyServer}`
    ],
  });


  const loginUrl =
    "https://accounts.google.com/AddSession?continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den-GB%26next%3D%252F&hl=en-GB&passive=false&service=youtube&uilel=0";

  try {
    const page = await browser.newPage();
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 OPR/104.0.0.0";
    await page.setUserAgent(ua);

    await page.authenticate({username: proxyUsername, password: proxyPassword});
    
    await page.goto(loginUrl, { waitUntil: "networkidle2" });
    
    await page.type('input[type="email"]', login);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

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

    await page.waitForTimeout(1000);

    await page.type('input[type="password"]', password);
    await page.keyboard.press("Enter");

    await page.waitForNavigation({timeout: 600000});
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
    const username = nickname.split("\n")[3].trim();

    console.log(name, username);

    nickname = name + "\n" + username; 
    console.log(nickname);

    await page.waitForTimeout(1000);

    await browser.close();

    if (userCookies[0].domain.includes("youtube")) {
      const index = cookies.findIndex(
        (item) => item.login === login && item.password === password
      );
      if (index === -1) {
        cookies.push({
          login: login,
          name: nickname,
          password: password,
          proxy: proxy,
          cookies: userCookies,
        });
      } else {
        cookies[index].proxy = proxy;
        cookies[index].name = nickname;
        cookies[index].cookies = userCookies;
      }
    }
    fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2), (err) => {
      if (err) console.log(err);
    });
  } catch (err) {
    console.log("login err", err);
    await browser.close();
  }
};

module.exports = loginAccount;


// const login = "robinnopelles@gmail.com"
// const password = "DFY66y@ve4"
// const proxy = "http://YGP3OY:YCV4Cmz0ow@45.11.21.6:1050"

// loginAccount(login, password, proxy);
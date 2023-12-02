const fs = require("fs");
const cookies = require("../cookies.json");

async function loginAccount(email, password, proxy) {
  const { selfbot } = await import("youtube-selfbot-api");

  let bot = new selfbot();
  const browser = await bot.launch();
  try{
    const page = await browser.newPage();
    const googleContext = await page.setupGoogle();
    await googleContext.login({
      email,
      password,
    });

    await page.goto("https://www.youtube.com");

    await page.waitForSelector(`#avatar-btn`, { timeout: 10000 });
    await page.click("#avatar-btn");
    await page.waitForSelector("#channel-container");
    let nickname = await page.$eval(
      "#channel-container",
      (elem) => elem.textContent
    );
    const userCookies = await page.getCookies();
    await browser.close();
    const name = nickname.split("\n")[1].trim();

    console.log(name);

    if (userCookies) {
      console.log("saving cookies..");
      const index = cookies.findIndex(
        (item) => item.email === email && item.password === password
      );
      if (index === -1) {
        cookies.push({
          email,
          name,
          password,
          proxy,
          cookies: userCookies,
        });
      } else {
        cookies[index].proxy = proxy;
        cookies[index].name = name;
        cookies[index].cookies = userCookies;
      }
    }
    fs.writeFile("./cookies.json", JSON.stringify(cookies, null, 2), (err) => {
      if (err) console.log(err);
    });
  } catch (err) {
    console.log('error logging acc:', err.message);
    await browser.close();
  }
}

module.exports = loginAccount;

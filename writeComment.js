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

    await page.setRequestInterception(true);

    page.on("request", (req) => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == 'image'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {timeout: 60000});

    await page.waitForSelector("#chatframe");
    const frames = await page.frames();
    const chatframe = frames.find((frame) => frame.name() === "chatframe");
    try {
      const comment = await chatframe.$(
        "#input.style-scope.yt-live-chat-message-input-renderer"
      );

      if (comment) {
        await comment.click();

        await comment.type("hello");

        await page.keyboard.press("Enter");
      }
    } catch (err) {
      console.log("error writing comment:", err);
    }
    await page.close();
  }
  await browser.close();

};
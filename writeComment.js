const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const botState = require('./botState.json');

puppeteer.use(StealthPlugin());

module.exports = async function (url, text) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
      "--disable-dev-shm-usage",
    ],
  });

  let req;
  let head;

  const page = await browser.newPage();

  console.log(cookies[0].login, cookies[0].password);

  await page.setCookie(...cookies[0].cookies);

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      request
        .url()
        .includes("https://www.youtube.com/youtubei/v1/live_chat/send_message")
    ) {
      req = request.postData();
      head = request.headers();
    }
    request.continue();
  });

  await page.goto(url, { timeout: 60000 });

  await page.waitForSelector("#chatframe");
  const frames = await page.frames();
  const chatframe = frames.find((frame) => frame.name() === "chatframe");
  try {
    const comment = await chatframe.$(
      "#input.style-scope.yt-live-chat-message-input-renderer"
    );

    if (comment) {
      await comment.click();
      await comment.type(text);

      await page.keyboard.press("Enter");
      console.log("entered");
    }
  } catch (err) {
    console.log("error writing comment:", err.message);
  }
  await page.close();



  for (let i=1; i<cookies.length; i++) {
    if (botState.stoped) break;
    const page = await browser.newPage();
    try {
      console.log(cookies[i].login, cookies[i].password);
      await page.setCookie(...cookies[i].cookies);
      await page.goto(JSON.parse(req).context.client.originalUrl, { timeout: 60000 });

      const comment = await page.$(
        "#input.style-scope.yt-live-chat-message-input-renderer"
      );

      if (comment) {
        await comment.click();
        await comment.type(text);

        await page.keyboard.press("Enter");
        console.log("entered");
      }
    } catch (err) {
      console.log("error writing comment:", err.message);
    }
    await page.close();
  }

  await browser.close();
};
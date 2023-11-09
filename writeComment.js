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
      "--disable-dev-shm-usage",
    ],
  });

  const context = await browser.createIncognitoBrowserContext();

  const processPage = async (acc) => {
    const page = await context.newPage();

    console.log(acc.login, acc.password);

    await page.setCookie(...acc.cookies);

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    await page.waitForSelector("#chatframe");
    const frames = await page.frames();
    const chatframe = frames.find((frame) => frame.name() === "chatframe");

    try {
      const comment = await chatframe.$(
        "#input.style-scope.yt-live-chat-message-input-renderer"
      );

      if (comment) {
        await comment.click();
        const number = generateRandomNumberWithinRange(10, 100, 2);
        await comment.type(`${number}`);

        await page.keyboard.press("Enter");
        console.log("entered");
      }
    } catch (err) {
      console.log("error writing comment:", err);
    }

    await page.close();
  };

  let i = 0;
  let end = cookies.length / 10;
  const iter = setInterval(async () => {
    if (i < end) {
      await Promise.all(cookies.slice(i * 10, (i + 1) * 10).map(processPage));
      i++;
      if (i == end)
        await browser.close();
    } else {
      clearInterval(iter);
    }
  }, 10 * 1000);

};

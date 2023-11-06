const cookies = require("./cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

function generateRandomNumberWithinRange(min, max, step) {
  if (min > max || step <= 0) {
    return "Неверные параметры";
  }

  // Вычисляем количество возможных десятков внутри заданного диапазона
  const numPossibleRanges = Math.floor((max - min + 1) / step);

  if (numPossibleRanges <= 0) {
    return "Невозможно сгенерировать числа с такими параметрами";
  }
  const randomRangeIndex = Math.floor(Math.random() * numPossibleRanges);

  const selectedRangeMin = min + randomRangeIndex * step;
  const selectedRangeMax = selectedRangeMin + step - 1;

  // Генерируем случайное число внутри выбранного диапазона
  const randomNumber = Math.floor(Math.random() * (selectedRangeMax - selectedRangeMin + 1)) + selectedRangeMin;
  return randomNumber;
}


module.exports = async function (url) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=1900,1200",
      '--disable-dev-shm-usage',
    ],
  });

  for (const acc of cookies) {
    const page = await browser.newPage();

    console.log(acc.login, acc.password);

    await page.setCookie(...acc.cookies);

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
        const number = generateRandomNumberWithinRange(10, 100, 2);
        await comment.type(`${number}`);

        await page.keyboard.press("Enter");
        console.log('entered');
      }
    } catch (err) {
      console.log("error writing comment:", err);
    }
    await page.close();
  }
  await browser.close();

};
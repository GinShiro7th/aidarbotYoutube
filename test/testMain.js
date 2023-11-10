const { Cluster } = require('puppeteer-cluster');
const cookies = require('../cookies.json');
const puppeteer = require('puppeteer');

module.exports = async function(url){
  const browser = await puppeteer.launch(
    {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        '--disable-dev-shm-usage',
      ],
    },
  );
  let req;

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
      await comment.type(`hello`);

      await page.keyboard.press("Enter");
      console.log("entered");
    }
  } catch (err) {
    console.log("error writing comment:", err);
  }
  await page.close();

  await browser.close();

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // Один браузер с несколькими страницами
    maxConcurrency: 3, // Максимальное количество одновременно открытых страниц
    puppeteerOptions: {
      headless: false,
    },
  });

  const context = await cluster.worker(0).creatIncognitoBrowserContext(); 
  // Обработка каждой страницы
  await cluster.task(async ({ page, data }) => {
    try {
      await page.close();
      const page = await context.newPage();
      await page.deleteCookie();
      console.log(cookies[data.i].login, cookies[data.i].password);
      await page.setCookie(...cookies[data.i].cookies);
      await page.goto(data.url, { timeout: 60000 });
      const comment = await page.$(
        "#input.style-scope.yt-live-chat-message-input-renderer"
      );

      if (comment) {
        await comment.click();
        await comment.type(`hello`);

        await page.keyboard.press("Enter");
        console.log("entered");
      }
      await page.close();
    } catch (err) {
      console.log("error writing comment:", err);
      await page.close();
    }
  });

  // Массив задач для обработки
  const tasks = [];

  for (let i = 1; i < cookies.length; i++) {
    tasks.push({ url: JSON.parse(req).context.client.originalUrl, i });
  }

  // Добавление задач в кластер
  tasks.forEach((task) => cluster.queue(task));

  // Дождитесь завершения всех задач
  await cluster.idle();
  await cluster.close();
}

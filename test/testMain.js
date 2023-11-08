const { Cluster } = require('puppeteer-cluster');
const cookies = require('../cookies.json');

(async () => {
  const numBrowsers = 7; // Количество браузеров
  const numPagesPerBrowser = 10; // Количество страниц в каждом браузере
  const clusterOptions = {
    concurrency: Cluster.CONCURRENCY_BROWSER, // Один браузер с несколькими страницами
    maxConcurrency: numBrowsers, // Максимальное количество одновременно открытых браузеров
    puppeteerOptions: {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        '--disable-dev-shm-usage',
      ],
    },
  };
  const cluster = await Cluster.launch(clusterOptions);

  // Обработка каждой страницы
  await cluster.task(async ({ page, data }) => {
    try {
      await page.setCookie(...cookies[data.cookieIndex].cookies);
      await page.goto(data.url, { timeout: 120 * 1000 });

      await page.setCookie(...cookies[data.pageIndex].cookies);

      await page.goto(url, { timeout: 120 * 1000 });
      await page.waitForSelector("#chatframe", { timeout: 60 * 1000 });
      const frames = await page.frames();
      const chatframe = frames.find((frame) => frame.name() === "chatframe");
      await chatframe.waitForSelector("#input.style-scope.yt-live-chat-message-input-renderer", { timeout: 60 * 1000 });

      const comment = await chatframe.$("#input.style-scope.yt-live-chat-message-input-renderer");

      if (comment) {
        await comment.click();
        await comment.type("hello");
        await page.keyboard.press("Enter");
      }

      console.log(`Страница ${data.pageIndex} в браузере ${data.browserIndex} открыта.`);
      // Здесь вы можете выполнять дополнительные действия на странице
    } catch (err) {
      console.error(`Ошибка на странице ${data.pageIndex} в браузере ${data.browserIndex}:`, err);
    }
  });

  // Генерация задач для каждой страницы в каждом браузере
  for (let i = 0; i < numBrowsers; i++) {
    for (let j = i * numPagesPerBrowser; j < (i + 1) * numPagesPerBrowser; j++) {
      if (j < cookies.length){
        const taskData = { url: 'https://www.youtube.com/watch?v=60-yvrNbom4', browserIndex: i, pageIndex: j, cookieIndex: i };
        cluster.queue(taskData);
      }
    }
  }

  // Дождитесь завершения всех задач
  await cluster.idle();
  await cluster.close();
})();

const { parentPort, workerData } = require('worker_threads');
const { Cluster } = require('puppeteer-cluster');

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // Один браузер с несколькими страницами
    maxConcurrency: workerData.cookies.length, // Максимальное количество одновременно открытых страниц
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
  });

  // Обработка каждой страницы
  await cluster.task(async ({ page, data }) => {
    try {
      await page.setCookie(...workerData.cookies[data.i].cookies);
      await page.goto(data.url, { timeout: 120 * 1000 });

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
      console.log(`Страница ${data.i} открыта.`);
      // Здесь вы можете выполнять дополнительные действия на странице
    } catch (err) {
      console.error(`Ошибка на странице ${data.i}:`, err);
    }
  });

  // Массив задач для обработки
  const tasks = [];

  for (let i = 0; i < workerData.cookies.length; i++) {
    tasks.push({ url: workerData.url, i });
  }

  // Добавление задач в кластер
  tasks.forEach((task) => cluster.queue(task));

  // Дождитесь завершения всех задач
  await cluster.idle();
  await cluster.close();
})();

const { Cluster } = require('puppeteer-cluster');
const cookies = require('../cookies.json');

(async () => {
  // Создаем новый экземпляр кластера
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2, // Максимальное количество одновременно открытых браузеров
    puppeteerOptions: {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        '--disable-dev-shm-usage',
      ],
    }
  });

  // Определяем задачу для обработки страницы
  await cluster.task(async ({ page, data }) => {
    await page.setCookie(...cookies[data.i].cookies);
    try{
      await page.goto(data.url, { timeout: 120 * 1000 });
      console.log(123);
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
    } catch (err) {
      console.log('page err -', err.message);
    }
    await page.close();
  });

  // Добавляем задачи для обработки
  for (let i = 0; i < 3; i++)
    cluster.queue({ url: 'https://www.youtube.com/watch?v=60-yvrNbom4', i });

  // Добавьте другие задачи...

  // Ожидаем завершения всех задач
  await cluster.idle();
  await cluster.close();
})();

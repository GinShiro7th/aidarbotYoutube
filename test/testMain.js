const { Cluster } = require('puppeteer-cluster');
const cookies = require('../cookies.json');

(async () => {
  const numAccounts = cookies.length;
  const maxConcurrency = 10; // Максимальное количество аккаунтов, обрабатываемых одновременно

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: maxConcurrency,
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

  await cluster.task(async ({ page, data }) => {
    const acc = data.account;
    await page.setCookie(...acc.cookies);
    await page.goto(data.url, { timeout: 60000 });

    const frames = await page.frames();
    const chatframe = frames.find((frame) => frame.name() === "chatframe");

    if (chatframe) {
      try {
        const comment = await chatframe.$("#input.style-scope.yt-live-chat-message-input-renderer");
        if (comment) {
          const number = generateRandomNumberWithinRange(10, 100, 2);
          await comment.click();
          await comment.type(`${number}`);
          await page.keyboard.press("Enter");
          console.log(`Аккаунт ${acc.login} отправил комментарий.`);
        }
      } catch (err) {
        console.error(`Ошибка аккаунта ${acc.login}:`, err);
      }
    }
  });

  for (let i = 0; i < numAccounts; i++) {
    const taskData = { account: cookies[i], url: 'https://www.youtube.com/watch?v=60-yvrNbom4' };
    cluster.queue(taskData);
  }

  await cluster.idle();
  await cluster.close();
})();

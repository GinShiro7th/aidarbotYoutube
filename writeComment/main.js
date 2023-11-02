const { Worker, isMainThread } = require("worker_threads");

const cookies = require("../cookies.json");

module.exports = async function (url) {
  if (isMainThread) {
    // Этот код выполняется в главном потоке

    const numWorkers = cookies.length;
    const workers = [];

    // Создаем один экземпляр браузера и получаем его WebSocket endpoint
    (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
        ],
      });
      const browserWSEndpoint = browser.wsEndpoint();

      // Запускаем рабочие потоки с общим браузером
      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker("./writeComment/worker.js", {
          workerData: {
            cookies: cookies[i],
            url: url,
            browserWSEndpoint: browserWSEndpoint,
          },
        });

        worker.on("message", (message) => {
          if (message.status === "done") {
            console.log(`Рабочий поток ${i} завершил работу.`);
          }
        });

        workers.push(worker);
      }
    })();
  }
};

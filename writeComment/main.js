const { Worker, isMainThread } = require("worker_threads");

const cookies = require("../cookies.json");

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function (url) {
  if (isMainThread) {
    // Этот код выполняется в главном потоке

    const pagesPerBrowser = 4;
    const numBrowsers = cookies.length / pagesPerBrowser; // Здесь указываете, сколько браузеров нужно создать
    const workers = [];

    for (let i = 0; i < numBrowsers; i++) {
      // Создаем отдельный экземпляр браузера
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
          '--disable-dev-shm-usage',
        ],
      });
      const endPoint = await browser.wsEndpoint();

      // Создаем отдельные рабочие потоки для каждой страницы в браузере
      for (let j = i * pagesPerBrowser; j < (i + 1) * pagesPerBrowser; j++) {
        if (j < cookies.length) {
          const worker = new Worker("./writeComment/worker.js", {
            workerData: {
              cookies: cookies[j],
              url,
              endPoint
            },
          });

          worker.on("message", (message) => {
            if (message.status === "done") {
              console.log(
                `Рабочий поток ${j} завершил работу в браузере ${i}.`
              );
            } else if (message.status === 'error'){
              console.log(`ошибка в потоке ${j} в браузере ${i} - ${message.errMsg}`);
            }
          });

          workers.push(worker);
        }
      }
    }
    return;
  } else {
    // Этот код не будет выполняться, так как worker.js используется в рабочих потоках
  }
};

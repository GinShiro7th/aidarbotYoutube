const { Worker, isMainThread } = require("worker_threads");
const cookies = require("../cookies.json");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

module.exports = async function (url) {
  if (isMainThread) {
    // Этот код выполняется в главном потоке

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

    const numPages = 30; // Здесь указываете, сколько браузеров нужно создать
    const numBrowsers = cookies.length / numBrowsers;
    const workers = [];

    for (let i = 1; i < numBrowsers; i++) {
      const worker = new Worker("./writeComment/worker.js", {
        workerData: {
          cookies: cookies.slice(i * numPages, (i + 1) * numPages),
          url: JSON.parse(req).context.client.originalUrl,
        },
      });

      worker.on("message", (message) => {
        if (message.status === "done") {
          console.log(`Рабочий поток браузера ${i} завершил работу.`);
        } else if (message.status === 'error'){
          console.log(`ошибка в рабочем потоке браузера ${i} - ${message.errMsg}`);
        }
      });

      workers.push(worker);
    }
    return;
  } else {
    // Этот код не будет выполняться в главном потоке
  }
};

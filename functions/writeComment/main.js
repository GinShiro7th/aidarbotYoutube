const { Worker, isMainThread } = require("worker_threads");
const cookies = require("../../cookies.json");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const botState = require("../botState.json");
const fs = require("fs");

module.exports = async function (video, text, msg, bot) {
  if (isMainThread) {
    botState.stoped = false;
    fs.writeFile(
      "./functions/botState.json",
      JSON.stringify(botState, null, 2),
      (err) => (err ? console.log(err) : null)
    );

    // Этот код выполняется в главном потоке
    const proggresMessage = await bot.sendMessage(
      msg.chat.id,
      "Перехожу на секцию комментариев..."
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=1900,1200",
        "--disable-dev-shm-usage",
        "--disable-web-security",
      ],
    });

    const page = await browser.newPage();

    await page.goto(video, { timeout: 120000 });
    await page.waitForSelector("#chatframe");
    let url = await page.$eval("#chatframe", (element) =>
      element.getAttribute("src")
    );

    url = "https://www.youtube.com" + url;
    
    console.log(url);

    await browser.close();

    const browsersNum = cookies.length / 50;
    const workers = [];

    for (let i = 0; i < browsersNum; i++) {
      try {
        async function spawnWorker() {
          const worker = new Worker("./functions/writeComment/worker.js", {
            workerData: {
              cookies: cookies.slice(i * 50, (i + 1) * 50),
              url,
              text,
            },
          });

          worker.on("message", async (message) => {
            if (message.status === "done") {
              console.log(`Рабочий поток браузера ${i} завершил работу.`);
              workers.pop();
              if (workers.length === 0) {
                await bot.sendMessage(
                  msg.chat.id,
                  "✅Все аккаунты успешно написали комментарии"
                );
              }
            } else if (message.status === "error") {
              console.log(
                `ошибка в рабочем потоке браузера ${i} - ${message.errMsg}`
              );
              workers.pop();
            } else if (message.status === "entered") {
              global.commentsCount++;
              console.log("com count", global.commentsCount);
              await bot.editMessageText(
                "комментариев написано: " + global.commentsCount,
                { message_id: proggresMessage.message_id, chat_id: msg.chat.id }
              );
            } else if (message.status === "comment error") {
              console.log(`${message.acc.name} - blocked`);
              cookies.splice(
                cookies.findIndex((obj) => obj.login === message.acc.login)
              );
              fs.writeFile(
                "./cookies.json",
                JSON.stringify(cookies, null, 2),
                (err) => {
                  if (err) console.log(err);
                }
              );
            }
          });

          workers.push(worker);
        }
        if (workers.length < 3) await spawnWorker();
        else {
          const iter = setInterval(async () => {
            if (workers.length < 3) {
              await spawnWorker();
              clearInterval(iter);
            }
          }, 100);
        }
      } catch (err) {
        console.log("err making worker:", err.message);
      }
    }
  } else {
    // Этот код не будет выполняться в главном потоке
  }
};

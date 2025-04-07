const { Worker, isMainThread } = require("worker_threads");
const cookies = require("../../cookies.json");
const puppeteer = require("puppeteer-extra");
// const puppeteer = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");


puppeteer.use(StealthPlugin());

const botState = require("../botState.json");
const fs = require("fs");
const { clear_temp_files } = require("../../utils/functions");

module.exports = main;

async function main(video, text, msg, bot) {
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

    let url = video.includes('live_chat') ? video : await (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './temp_profile',
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
          "--disable-dev-shm-usage",
          "--disable-web-security",
        ],
      });
      let url;
      const page = await browser.newPage();
      try{

        await page.goto(video, { timeout: 120000 });
        const button_selector = ".VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.Gu558e"
        const accept_cookies_button = await page.$(button_selector);

        console.log(accept_cookies_button);
        if (accept_cookies_button){
          console.log("accept cookies click");
          await accept_cookies_button.click();
          await page.waitForNavigation({waitUntil: "domcontentloaded", timeout: 500 * 1000});
        }

        await page.waitForSelector("#chatframe");
        const iframeElement = await page.$('#chatframe');
        const iframe = await iframeElement.contentFrame(); // Получаем объект iframe
        
        url = await iframe.evaluate(() => document.location.href);
      } catch (e) {
        console.log(e);
      }
      
      await browser.close();
        
      console.log(url);
      return url;
    })();

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
              // proxy: cookies.slice(i * 50, (i + 1) * 50)[Math.floor(Math.random() * 50)].proxy
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
                // clear_temp_files();
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
                cookies.findIndex((obj) => obj.email === message.acc.email), 1
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

const { Worker, isMainThread } = require("worker_threads");
const cookies = require('../../cookies.json');
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const botState = require('../botState.json');
const fs = require('fs');

module.exports = async function (url, text, msg, bot) {

  if (isMainThread) {
    botState.stoped = false;
    fs.writeFile('./functions/botState.json', JSON.stringify(botState, null, 2), (err) => err ? console.log(err) : null);
    
    // Этот код выполняется в главном потоке
    const proggresMessage = await bot.sendMessage(msg.chat.id, "комментариев написано: "+global.commentsCount);
      
    const browser = await puppeteer.launch(
      {
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--enable-webgl",
          "--window-size=1900,1200",
          '--disable-dev-shm-usage',
          '--disable-web-security'
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
    
    try {
      await page.goto(url, { timeout: 120000 });
      await page.waitForSelector("#chatframe");
      const frames = await page.frames();
      const chatframe = frames.find((frame) => frame.name() === "chatframe");
      const comment = await chatframe.$(
        "#input.style-scope.yt-live-chat-message-input-renderer"
      );
  
      if (comment) {
        await comment.click();
        await comment.type(text);
  
        await page.keyboard.press("Enter");
        console.log("entered");
      }
    } catch (err) {
      console.log("error writing comment:", err);
    }
    await page.close();
  
    await browser.close();  
    
    const cook = cookies.slice(1);

    global.commentsCount++;
    await bot.editMessageText("комментариев написано: "+global.commentsCount, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});
    
    const numPages = 50;
    const numBrowsers = cook.length / numPages;
    const workers = [];

    for (let i = 0; i < numBrowsers; i++) {
      try{
        const worker = new Worker("./functions/writeComment/worker.js", {
          workerData: {
            cookies: cook.slice(i * numPages, (i + 1) * numPages),
            url: JSON.parse(req).context.client.originalUrl,
            text: text,
          },
        });

        worker.on("message", async (message) => {
          if (message.status === "done") {
            console.log(`Рабочий поток браузера ${i} завершил работу.`);
            workers.pop();
            if (worker.length === 0){
              await bot.sendMessage(msg.chat.id, '✅Все аккаунты успешно написали комментарии');
            }
          } else if (message.status === 'error'){
            console.log(`ошибка в рабочем потоке браузера ${i} - ${message.errMsg}`);
          } else if (message.status === "entered"){
            console.log('com count', global.commentsCount);
            global.commentsCount++;
            await bot.editMessageText("комментариев написано: "+global.commentsCount, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});
          }
        });

        workers.push(worker);
      } catch (err) {
        console.log('err making worker:', err.message);
      }
    }
    
  } else {
    // Этот код не будет выполняться в главном потоке
  }
};
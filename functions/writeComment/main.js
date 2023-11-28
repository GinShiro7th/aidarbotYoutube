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
      
    let req;
    let i = 0;
    for(; i < cookies.length; ){
      const proxyServer = cookies[i].proxy.replace(/\/(.*?)@/g, "//");
      const proxyUsername = cookies[i].proxy.substring(cookies[i].proxy.lastIndexOf('/')+1, cookies[i].proxy.indexOf('@')).split(':')[0];
      const proxyPassword = cookies[i].proxy.substring(cookies[i].proxy.lastIndexOf('/')+1, cookies[i].proxy.indexOf('@')).split(':')[1];
      
      const browser = await puppeteer.launch(
        {
          headless: false,
          args: [
            "--no-sandbox",
            "--disable-gpu",
            "--enable-webgl",
            "--window-size=1900,1200",
            '--disable-dev-shm-usage',
            '--disable-web-security',
            `--proxy-server=${proxyServer}`
          ],
        },
      );
      const page = await browser.newPage();
      await page.authenticate({username: proxyUsername, password: proxyPassword});
    
      console.log(cookies[i].login, cookies[i].password);
      await page.setCookie(...cookies[i].cookies);
      
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
          global.commentsCount++;
          i++;
          await browser.close();  
          break;
        }
      } catch (err) {
        console.log("error writing comment:", err);
        cookies.splice(i);

      }
      await page.close();
    }
    
    await bot.editMessageText("комментариев написано: "+global.commentsCount, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});


    const cook = cookies.slice(i);
    const workers = [];

    function divideByField(arr, field) {
      const groups = {};
      arr.forEach(obj => {
        const value = obj[field];
        if (!groups[value]) {
          groups[value] = [];
        }
        groups[value].push(obj);
      });
    
      return Object.values(groups);
    }
    
    const dividedCookies = divideByField(cook, "proxy");
  
    for (let i = 0; i < dividedCookies.length; i++) {
      try{
        function spawnWorker(){
          const worker = new Worker("./functions/writeComment/worker.js", {
            workerData: {
              cookies: dividedCookies[i],
              url: JSON.parse(req).context.client.originalUrl,
              text: text,
              proxy: dividedCookies[i][0].proxy
            },
          });

          worker.on("message", async (message) => {
            if (message.status === "done") {
              console.log(`Рабочий поток браузера ${i} завершил работу.`);
              workers.pop();
              if (workers.length === 0){
                await bot.sendMessage(msg.chat.id, '✅Все аккаунты успешно написали комментарии');
              }
            } else if (message.status === 'error'){
              console.log(`ошибка в рабочем потоке браузера ${i} - ${message.errMsg}`);
              workers.pop();
            } else if (message.status === "entered"){
              console.log('com count', global.commentsCount);
              global.commentsCount++;
              await bot.editMessageText("комментариев написано: "+global.commentsCount, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});
            } else if (message.status === "comment error"){
              console.log(`${message.acc.name} - blocked`);
              cookies.splice(cookies.findIndex(obj => obj.login === message.acc.login));
            }
          });

          workers.push(worker);
        }
        if (workers.length < 5)
          spawnWorker()
        else{
          const iter = setInterval(() => {
            if (workers.length < 5){
              spawnWorker();
              clearInterval(iter);   
            }
          }, 100);
        }
      } catch (err) {
        console.log('err making worker:', err.message);
      }
    }
    fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2), (err) => {if (err) console.log(err)});
  } else {
    // Этот код не будет выполняться в главном потоке
  }
};
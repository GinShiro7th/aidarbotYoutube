const TelegramBot = require("node-telegram-bot-api");
const checkCommand = require("./checkCommand");

const token = "6749064462:AAEhNgVgYUrtF5bMCJr5d7gSrLR3TLro87g";

const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("message", async (msg) => {
   await checkCommand(msg, bot);
   /*
    case "Написать комментарии":
      bot.sendMessage(msg.chat.id, "Пришлите ссылку на стрим");
      const writeComment = require("./functions/writeComment/main");
      bot.once("message", (msg) => {
        const link = msg.text;
        bot.sendMessage(msg.chat.id, "Напишите комментарий");
        bot.once("message", (msg) => {
          writeComment(link, msg.text);
        });
      });
      break;
    case "Остановить написание":
      const fs = require("fs");
      const stop = require("./functions/botState.json");
      stop.stoped = true;
      fs.writeFile(
        "./functions/botState.json",
        JSON.stringify(stop),
        function (err) {
          if (err) {
            return console.log(err);
          }
        }
      );
      break;
    case "Написать с одного аккаунта":
      bot.sendMessage(msg.chat.id, "Пришлите ссылку на стрим");
      const Comment = require("./functions/writeComment");
      bot.once("message", (msg) => {
        const link = msg.text;
        bot.sendMessage(msg.chat.id, "Напишите комментарий");
        bot.once("message", (msg) => {
          const koment = msg.text;
          bot.sendMessage(msg.chat.id, "Напишите айди аккаунта");
          bot.once("message", (msg) => {
            Comment(link, koment, msg.text);
          });
        });
      });
      break;
    case "Поставить лайк":
      const like = require("./functions/like");
      bot.sendMessage(msg.chat.id, "Пришлите ссылку на видео");
      bot.once("message", (msg) => {
        like(msg.text);
      });
      break;

    case "Подписаться":
      const subscribe = require("./functions/subscribe");
      bot.sendMessage(msg.chat.id, "Пришлите ссылку на канал");
      bot.once("message", (msg) => {
        subscribe(msg.text);
      });
      break;
  }
  */
});

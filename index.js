const TelegramBot = require("node-telegram-bot-api");
const checkCommand = require("./checkCommand");

const token = "6749064462:AAEhNgVgYUrtF5bMCJr5d7gSrLR3TLro87g";

const bot = new TelegramBot(token, {
  polling: true,
});

global.commentsCount = 0;

bot.on("message", async (msg) => {
   console.log(msg.from.username, msg.text);
   await checkCommand(msg, bot);
});

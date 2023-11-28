const users = require('../../users.json');
const fs = require('fs');
const subscribe = require('../subscribe');

module.exports = async function(msg, bot, option){
  const userIndex = users.findIndex(obj => obj.id === msg.from.id);
  switch (option){
    case '1':
      await bot.sendMessage(msg.chat.id, "Пришлите ссылку на канал, на который нужно подписаться");
      users[userIndex].command = 'sub';
      break;
    case '2':
      const channelUrl = msg.text;
      await subscribe(channelUrl);
      await bot.sendMessage(msg.chat.id, "Все аккаунты подписались на канал");
      users[userIndex].command = 'start'
      break;
  }
  fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => {if (err) console.log(err)});
}
const users = require('../../users.json');
const fs = require('fs');
const writeComment = require('../writeComment/main');

module.exports = async function(msg, bot, option){
  const index = users.findIndex(item => item.id === msg.from.id);
  switch (option){
    case '1':
      await bot.sendMessage(msg.chat.id, 'Пришлите ссылку на стрим');
      users[index].command = 'commentUrl';
      break;
    case '2':
      const url = msg.text;
      await bot.sendMessage(msg.chat.id, "Пришлите текст комментария");
      users[index].command = 'commentText';
      users[index].args[0] = url;
      break;
    case '3':
      const text = msg.text;
      
      global.commentsCount = 0;

      await writeComment(users[index].args[0], text, msg, bot);

      users[index].command = 'start';
      users[index].args = [];
      break;
  }
  fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => err ? console.log(err) : null);
}
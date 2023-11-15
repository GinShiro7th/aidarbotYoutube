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
      const commentsCount = require('../writeComment/commentsCount.json');
      commentsCount.count = 0;
      fs.writeFile('./functions/writeComment/commentsCount.json', JSON.stringify(commentsCount, null, 2), (err) => err ? console.log(err) : null);        
          
      const proggresMessage = await bot.sendMessage(msg.chat.id, "комментариев написано: "+commentsCount.count);
      const iter = setInterval(async () => {
        const commentsCount = require('../writeComment/commentsCount.json');
        try {
          await bot.editMessageText("комментариев написано: "+commentsCount.count, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});
        } catch (err) {
          null;
        }
      }, 1000);
      
      await writeComment(users[index].args[0], text);
      
      clearInterval(iter);
      //await bot.deleteMessage(msg.chat.id, proggresMessage.message_id);
      await bot.sendMessage(msg.chat.id, '✅Все аккаунты успешно написали комментарии');
      users[index].command = 'start';
      users[index].args = [];
      break;
  }
  fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => err ? console.log(err) : null);
}
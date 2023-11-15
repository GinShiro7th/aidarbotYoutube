const users = require('../../users.json');
const writeComment = require('../writeComment');
const cookies = require('../../cookies.json');

module.exports = async function(msg, bot, option){
  const index = users.findIndex(item => item.id === msg.from.id);
  switch (option){
    case '1':
      await bot.sendMessage(msg.chat.id, 'Пришлите ссылку на стрим');
      users[index].command = 'oneUrl';
      break;
    case '2':
      const url = msg.text;
      await bot.sendMessage(msg.chat.id, "Пришлите текст комментария");
      users[index].command = 'oneText';
      users[index].args[0] = url;
      break;
    case '3':
      const text = msg.text;
      await bot.sendMessage(msg.chat.id, "Пришилите номер аккаунта, с которого нужно написать комментарий");
      users[index].command = 'oneNum';
      users[index].args[1] = text;
      break
    case '4':
      const num = msg.text;
      try {
        const i = Number(num) - 1;
        await new Promise(async (res) => {
          await writeComment(users[index].args[0], users[index].args[1], num);
          res(123);
        })
        await bot.sendMessage(msg.chat.id, `Аккаунт ${cookies[i].name.split('\n')[0]} успешно написал комментарий`);
      } catch (err) {
        console.log('writing one commnet err:', err.message);
      }
      break;
  }
}
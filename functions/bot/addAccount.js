const users = require('../../users.json');
const fs = require('fs');
const downloadFile = require('./downloadFile');
const loginAccount = require('../loginAccount');

module.exports = async function(msg, bot, option){
  switch (option){
    case '1':
      await bot.sendMessage(
        msg.chat.id,
        "Пришлите файл, в которым лежат данные для аккаунтов.\nФормат файла: \n'логин:пароль\nлогин:пароль\n...'"
      );
      users[users.findIndex(item => item.id === msg.from.id)].command = 'addTxt';
      break;
    case '2':
      if (!msg.document){
        return await bot.sendMessage(msg.chat.id, 'Вы не прикрепили файл!');
      }

      const fileId = msg.document.file_id;
      const filename = msg.document.file_name;
      const savePath = `./files/${filename}`;
      console.log(savePath);

      await downloadFile(fileId, savePath);

      const data = fs.readFileSync(savePath).toString();
      
      
      const accountsInfo = data.split('\n');
      let curr = 0;
      const end = accountsInfo.length;

      const proggres = `🔄Прогресс: ${curr} из ${end}`;
      const proggresMessage = await bot.sendMessage(msg.chat.id, proggres);

      for (acc of accountsInfo){
        const logPass = acc.split(' ')[0];
        const login = logPass.split(':')[0];
        const password = logPass.split(':')[1];

        if (login && password)
          await new Promise(async (resolve) => {
            await loginAccount(login, password)
            resolve(123);
          });
        curr++;
        await bot.editMessageText(`🔄Прогресс: ${curr} из ${end}`, {message_id: proggresMessage.message_id, chat_id: msg.chat.id});
      }

      await bot.deleteMessage(msg.chat.id, proggresMessage.message_id);
      await bot.sendMessage(msg.chat.id, '✅Все аккаунты успешно залогинились');

      fs.unlink(savePath, (err) => err ? console.log(err) : null);

      users[users.findIndex(item => item.id === msg.from.id)].command = 'start';
      break;
  }
  fs.writeFile('./users.json', JSON.stringify(users, null, 2), (err) => err ? console.log(err) : null);
}
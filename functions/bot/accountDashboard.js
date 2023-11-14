module.exports = async function (msg, bot) {
  const accounts = require('../cookies.json');
  let mes = [];
  let dashboard = "Список ваших аккаунтов\n";
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    if (account.name)
      if (i % 30 || i === 0) {
        dashboard += i + 1 + ". " + account.name.split("\n")[0] + "\n";
        console.log(dashboard);
      } else {
        mes.push(dashboard);
        dashboard = i + 1 + ". " + account.name.split("\n")[0] + "\n";
      }
  }
  mes.push(dashboard);
  for (let i = 0; i < mes.length; i++)
    await bot.sendMessage(msg.chat.id, mes[i]);
};

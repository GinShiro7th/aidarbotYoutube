const tgbot = require('node-telegram-bot-api');
const token = "6749064462:AAEhNgVgYUrtF5bMCJr5d7gSrLR3TLro87g";
const bot = new tgbot(token, {
    polling: true
});
bot.on('message', async (msg) => {
    if (msg.text == "/start")
        bot.sendMessage(msg.chat.id, "Взаимодействуйте с помощью кнопок", {
            reply_markup: {
                keyboard: [
                    ["Список аккаунтов"],
                    ["Добавить аккаунты"],
                    ["Написать комментарии", "Остановить написание"],
                    ["Написать с одного аккаунта"],
                    ["Поставить лайк"],
                    ["Подписаться"]
                ],
                resize_keyboard: true
            }
        });
    switch (msg.text) {
        case 'Список аккаунтов':
            const accounts = require('./functions/cookies.json');
            let mes = [];
            let dashboard = 'Список ваших аккаунтов\n';
            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i];
                if (account.name)
                    if (i % 30 || i === 0) {
                        dashboard += (i+1) + '. ' + account.name.split('\n')[0] + '\n';
                        console.log(dashboard);
                    }
                    else {
                        mes.push(dashboard);
                        dashboard = i+1 + '. ' + account.name.split('\n')[0] + "\n";
                    }
            }
            mes.push(dashboard);
            for (let i = 0; i < mes.length; i++)
                await bot.sendMessage(msg.chat.id, mes[i]);
            break;

        case 'Добавить аккаунты':
            const loginAccount = require('./functions/loginAccount');
            bot.sendMessage(msg.chat.id, "Введите логин и пароль\nВ формате: 'логин:пароль'");
            bot.once('message', async (msg) => {
                const mas = msg.text.split('\n');
                for (let text of mas)
                    await loginAccount(text.split(':')[0], text.split(':')[1]);
            })
            break;
        case 'Написать комментарии':
            bot.sendMessage(msg.chat.id, "Пришлите ссылку на стрим");
            const writeComment = require('./functions/writeComment/main');
            bot.once('message', (msg) => {
                const link = msg.text;
                bot.sendMessage(msg.chat.id, "Напишите комментарий")
                bot.once('message', (msg) => {
                    writeComment(link, msg.text)
                })
            })
            break;
        case 'Остановить написание':
            const fs = require('fs');
            const stop = require('./functions/botState.json');
            stop.stoped = true;
            fs.writeFile('./functions/botState.json', JSON.stringify(stop), function (err) {
                if (err) {
                    return console.log(err);
                }

            })
            break;
        case 'Написать с одного аккаунта':
            bot.sendMessage(msg.chat.id, "Пришлите ссылку на стрим");
            const Comment = require('./functions/writeComment');
            bot.once('message', (msg) => {
                const link = msg.text;
                bot.sendMessage(msg.chat.id, "Напишите комментарий")
                bot.once('message', (msg) => {
                    const koment = msg.text;
                    bot.sendMessage(msg.chat.id, "Напишите айди аккаунта");        
                    bot.once('message', (msg) => {
                        Comment(link, koment, msg.text)
                    })
                })
            })
            break;  
        case 'Поставить лайк':
            const like = require('./functions/like');
            bot.sendMessage(msg.chat.id, "Пришлите ссылку на видео");
            bot.once("message", (msg) => {
                like(msg.text);
            })
            break;

        case 'Подписаться':
            const subscribe = require('./functions/subscribe');
            bot.sendMessage(msg.chat.id, "Пришлите ссылку на канал");
            bot.once("message", (msg) => {
                subscribe(msg.text);
            })
            break;
    }
});
const loginAccount = require("./loginAccount");
const subscribe = require("./subscribe");
//const writeComment = require("./writeComment/main");
//const writeComment = require('./writeComment');

const like = require('./like');

const accounts = require('./accounts.json');

const url = 'https://www.youtube.com/watch?v=60-yvrNbom4';

const channel = 'https://www.youtube.com/@1337LikeR';

/*
(async () => {
  for (let acc of accounts){
    await loginAccount(acc.login, acc.password);
  }
})()
*/
//loginAccount(accounts[2].login, accounts[2].password);

like(url);

// setTimeout(async () => await subscribe(channel), 1000);
//setTimeout(async () => await writeComment(url), 1000);
// setTimeout(async () => await test(url), 1000);
// setTimeout(async () => await loginAccount(login, password), 3000);
const loginAccount = require("./loginAccount");
const subscribe = require("./subscribe");
const writeComment = require("./writeComment/main");
//const writeComment = require('./writeComment');

//const like = require('./like');


const accounts = require('./accounts.json');

const url = 'https://www.youtube.com/watch?v=60-yvrNbom4';

const channel = 'https://www.youtube.com/@klp_gamer6794';

/*
(async () => {
  for (let acc of accounts){
    await loginAccount(acc.login, acc.password);
  }
})()
*/

//like(url);
//setTimeout(async () => await subscribe(channel), 1000);
setTimeout(async () => await writeComment(url, 'hello'), 100);
//setTimeout(async () => await loginAccount(accounts[0].login, accounts[0].password), 1000);
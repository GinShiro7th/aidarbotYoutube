const loginAccount = require("./loginAccount");
const subscribe = require("./subscribe");
const writeComment = require("./writeComment");

const login = "olgabatutina849@gmail.com";
const password = "CtyhxCyoi578";

const url = 'https://www.youtube.com/watch?v=60-yvrNbom4';

const channel = 'https://www.youtube.com/@sulive9561';

// setTimeout(async () => await subscribe(channel));
setTimeout(async () => await writeComment(url), 1000);
// setTimeout(async () => await loginAccount(login, password), 3000);
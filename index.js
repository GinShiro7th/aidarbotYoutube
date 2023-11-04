const loginAccount = require("./loginAccount");
const subscribe = require("./subscribe");
const writeComment = require("./writeComment/main");
// const writeComment = require('./writeComment');

const accounts = [
  {login : "annaprostoreeva@gmail.com", password: "Cr5ycVy8i"},
  {login : "matushinavalya2@gmail.com", password: "Fr6ygzxg689"},
  {login : "dinafalivosev@gmail.com", password: "Xt57Ct67hzH79"},  
  {login : "nivanaolisev@gmail.com", password: "F5ufChu8oo"},
  {login : "galinakracebova@gmail.com", password: "FtuvcVuik699)"},
  {login : "giamilonov@gmail.com", password: "Cy675fxGy88"},
  {login : "morozzoovakatya@gmail.com", password: "Ct7gxFt8io"},
  {login : "elenazarkowa87@gmail.com", password: "CtufZgyjji9o"},
  {login : "sobcakk06@gmail.com", password: "Frygxtuh5789"},
  {login : "olgabatutina849@gmail.com", password: "CtyhxCyoi578"}
];

const url = 'https://www.youtube.com/watch?v=60-yvrNbom4';

const channel = 'https://www.youtube.com/@1337LikeR';

(async () => {
  for (acc of accounts){
    await loginAccount(acc.login, acc.password);
  }
})()


// setTimeout(async () => await subscribe(channel), 1000);
// setTimeout(async () => await writeComment(url), 1000);
// setTimeout(async () => await loginAccount(login, password), 3000);
const botState = require('../botState.json');
const fs = require('fs');

module.exports = async function(msg, bot){
  botState.stoped = true;
  fs.writeFile('./functions/botState.json', JSON.stringify(botState, null, 2), (err) => err ? console.log(err) : null);
}
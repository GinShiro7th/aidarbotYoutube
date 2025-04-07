const fs = require('fs');

async function sleep(ms){
  return await new Promise((res, rej) => setTimeout(res, ms));
}

function clear_temp_files(){
  const dir = './temp_profile';
  fs.readdirSync(dir).forEach(f => fs.rmSync(`${dir}/${f}`, {recursive: true}));
}

clear_temp_files();

module.exports = {
  sleep,
  clear_temp_files,
}
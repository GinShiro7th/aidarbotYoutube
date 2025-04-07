const Captcha = require('2captcha');
const fs = require('fs');
const { sleep } = require('../utils/functions');

module.exports = async function solveImageCaptcha(page) {
  await (await page.$("#captchaimg")).screenshot({ path: "captcha.png" });
  const solver = new Captcha.Solver("7a3e39ae301c8d02cb1bf1ca713e3eca");
  const answer = await solver.imageCaptcha(fs.readFileSync("captcha.png", "base64"));
  console.log(answer.data);
  await page.type('input[type="text"]', answer.data);
  await page.keyboard.press("Enter");
  await sleep(2000);

  try {
    const captchaImgElement = await page.$eval("#captchaimg", () => true).catch(() => false);
    if (captchaImgElement){
      await solveImageCaptcha(page);
    }
  } catch (err) {
    return
  }
};

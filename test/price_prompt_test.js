const prompt = `
GET ALL THE PRICES FROM TEXT

16 Pro Max 1Tb Desert DUAL - 180.000🇭🇰
16 Pro Max 1Tb Natural DUAL - 180.000🇭🇰
16 Pro Max 1Tb Black DUAL - 181.000🇭🇰
16 Pro Max 1Tb Desert JA - 140.000🐪
16 Pro Max 512 Natural J/A - 122.500🌫️
16 Pro Max 512 Black J/A - 122.500⚫️
16 Pro Max 512 Desert AH - 122.500🐫
16 Pro Max 512 White JA - 122.500👻
16 Pro Max 256 Natural AH - 103.000🌫️
16 Pro Max 256 Black AH - 103.500⚫️
16 Pro 1Tb Desert DUAL - 165.000🇭🇰
16 Pro 1TB Natural JA - 133.800🌫️
16 Pro 1Tb Black JA - 135.500⚫️
16 Pro 1Tb White JA - 133.000👻
16 Pro 512 Desert JA - 118.500🐪
16 Pro 512 Natural JA - 118.000🌫️
16 Pro 256 White J/A - 98.500👻
15 256 Blue HN - 67.500🥶
14 Plus 256 Midnight EU - 71.900⚫️
S10 46 Milanese Natural ML - 85.000🌫️
S10 46 Milanese Gold ML - 83.000🔥
S10 46 Milanese Slate ML - 83.000⚫️
S10 42 Milanese Gold - 83.000🔥
S10 42 Milanese Natural - 83.000🌫
S10 42 Milanese Slate - 79.900⚫️
S10 46 Jet Black Loop - 34.500⚫️
S10 46 Jet Black ML - 33.900⚫️
S10 46 Rose Gold ML - 34.900🌸
S10 46 Rose Gold Loop - 35.000🌸
S10 46 Silver Blue Loop - 36(МК)
S10 42 Rose Gold ML - 35.500(МК)🌸
S10 42 Rose Gold Loop - 33.500🌸
S10 42 Rose Gold SM - 33.000👚
S10 42 Jet Black SM - 29.700⚫️
S9 45 Milanese Silver - 65.000👻
S9 45 Silver Steal Blue ML - 50.000👻🥶
S9 45 Silver Steal Blue SM - 49.500👻🥶
S9 45 Gold Steal Clay SM - 50.000🔥
S9 45 Graphite Steal Midnight ML - 50.000⚫️
S9 41 Silver Steal Blue ML - 47.900👽🥶
S9 41 Silver Steal Blue SM - 51.000👽🥶
S9 41 Gold Steal Clay ML - 50.000🔥
S9 41 Graphite Steal Midnight ML - 47.900⚫️
S9 41 Graphite Steal Midnight SM - 47.900⚫️
S9 45 Midnight Loop - 33.900⚫️
S9 45 Midnight SM - 27.900⚫️
S9 41 Pink ML - 33.900🌸
SE 2024 44 Midnight ML - 21 (МК)
49 Blue Ocean - 70.000🥶
49 Blue/Black ML - 69.000🥶⚫️
49 Green/Gray M/L - 63.900🧟‍♂️
49 Indigo L - 63.900😈
49 Indigo M - 63.900😈
49 Olive L - 67.900🫒
49 Milanese Black M - 83.000⚫️
49 Black Ocean - 69.000⚫️
49 Alpine Dark Green L - 71.000🧟‍♂️
49 Alpine Dark Green M - 71.000🧟
49 Navy Ocean - 71.900🥶
49 Ice Blue Ocean - 67.500🥶
512 Purple LTE - 99.900😈
512 Starlight LTE - 99.900👻
512 Purple WiFi - 79.000😈
512 Starlight WiFi - 79.000👻
512 Blue WiFi - 79.000🥶
256 Gray LTE - 76.000⚫️
128 Starlight LTE - 65.900👻
128 Blue LTE - 65.000🥶
128 Purple LTE - 67.000😈
`

const puppeteer = require("puppeteer-extra");
// const puppeteer = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--enable-webgl",
      "--window-size=800,800",
      "--disable-web-security",
    ],
  });
  const ai_url = 'https://talkai.info/chat/';
  const page = await browser.newPage();
  await page.goto(ai_url, {waitUntil: "domcontentloaded"});
  const captch_checkbox = ".cb-i";
  // if (page.$(captch_checkbox)){
  //   await page.click(captch_checkbox);
  //   await page.waitForNavigation();
  // } 


})();




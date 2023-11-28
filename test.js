const puppeteer = require('puppeteer');

(async () => {

  let proxies = [
    "109.248.14.173:1050",
    "45.87.253.242:1050",
    "46.8.22.245:1050",
    "45.87.253.200:1050",
    "188.130.220.232:1050",
    "46.8.107.131:1050",
    "188.130.142.229:1050",
    "109.248.14.5:1050",
    "46.8.111.142:1050",
    "45.15.73.247:1050"
  ];

  for (let i=1; i<10; i++){
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--enable-webgl",
        "--window-size=800,800",
        `--proxy-server=http://${proxies[i]}`
      ],
    });

    const page = await browser.newPage(); 
    
    await page.authenticate({username: "YGP3OY", password: "YCV4Cmz0ow"});

    await page.goto('https://www.whatismyip.com');
    // await page.waitForTimeout(10000);
    // await browser.close();
    break
  }
})()
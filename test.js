const puppeteer = require('puppeteer');

(async () => {

  let proxies = [
    '188.130.218.182:1050'
  ];

  for (let i=0; i<10; i++){
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
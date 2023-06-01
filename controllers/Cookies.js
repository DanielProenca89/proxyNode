const puppeteer = require('puppeteer');
const fs  = require('fs')

async function findNiche(){
  
  const browser = await puppeteer.launch({headless:false});
  
  const page = await browser.newPage();

  await page.goto('https://findniche.com/user/login');
  await page.waitForXPath('//*[@id="loginform-username"]')
  await page.focus('#loginform-username');
  await page.keyboard.type('silva12312312@bugfoo.com')
  await page.focus('#loginform-password');
  await page.keyboard.type('Spy12345')
  await page.click("#loginBut")
  await page.waitForNavigation()
  const cookies = await page.cookies();
  //let html = await page.content()
  fs.writeFileSync(__dirname +'/cookies/sites/findniche.json', JSON.stringify(cookies))
  page.close()
  return cookies
}




module.exports = {findNiche}
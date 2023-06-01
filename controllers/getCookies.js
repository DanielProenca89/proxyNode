
const puppeteer = require('puppeteer');
const fs  = require('fs')

/*async function getFindNiche(){
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const data = fs.readFileSync(__dirname + '/findniche.json', {encoding:"utf8"})
  const cookies = JSON.parse(data)
  await page.setCookie(...cookies)
  await page.goto('https://findniche.com/en');
  let html = await page.content()

  browser.close()
  return html

}*/


const getCookies = ()=>{
    const data = fs.readFileSync(__dirname + '/cookies/sites/findniche.json', {encoding:"utf8"})
    return JSON.parse(data)
}

module.exports = {getFindNiche, getCookies}
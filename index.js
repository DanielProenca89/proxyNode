const express = require('express');
const {getCookies} = require('./controllers/getCookies');
const cors = require('cors')
const app = express();
const fetch = require('node-fetch');
const cheerio = require('cheerio');

app.use(cors({
  origin: '*'
}));




const adjustResourcePaths = async (html) => {
  const $ = cheerio.load(html);

  // Seleciona todos os elementos <link> com o atributo 'href' contendo 'https'
  
  $('body').append(`<script>

  window.addEventListener("load", function(event) {
  function _x(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }

    return xnodes;
}

setInterval(()=>{
    if($(_x('//*[@id="crisp-chatbox"]/div/a')).length) $(_x('//*[@id="crisp-chatbox"]/div/a')).remove()

},1)
})
  
  </script>`);

  $('.nav-right').remove()
  $('.saasbox-nav-banner').remove()
  $('.cc-nsge').remove()
  $('link[href]').each((index, element) => {
    const href = $(element).attr('href');
    $(element).attr('href', `/findniche/css/${href.split('/')[href.split('/').length - 1]}`);
  });



  $('script[src]').each((index, element) => {
    
    const src = $(element).attr('src');
    $(element).attr('src', `/externo/${src}`);
  });


  $('img[src]').each((index, element) => {
    const src = $(element).attr('src');
    $(element).attr('src', `/findniche/images/${src.split('/')[src.split('/').length - 1]}`);
});




  // Retorna o HTML modificado
  return $.html();
};


app.use('/findniche',express.static(__dirname + '/findniche'));

app.get('/externo/*', async (req, res)=>{
  req.setTimeout(5000, function(){
    res.status(200)
});


  const url =  req.originalUrl.replace('/externo/','')
  const type = url.split('?')[0].slice(-3).replace('.', '').replace('/','')

if(url){
  try{
  const response = await fetch(url)
  if(['css', 'js', 'map'].includes(type)){
  const text = await response.text()
    res.send(text)
  }else if(['jpg', 'png', 'svg','-rj'].includes(type)){
    res.setHeader('Content-Type', `image/${(type==='jpg'?'jpeg':type)==='-rj'?'-rj':'jpeg'}`);
    response.body.pipe(res);
  }
}catch(error){
  res.status(404)
}
}
})


app.all('*', async (req, res) => {



try{
  //let page = await getFindNiche()
  const cookies = getCookies()
  const formattedCookies =  cookies.map(cookie => {
    let formattedCookie = `${cookie.name}=${cookie.value}`;
    res.cookie(cookie.name, cookie.value)
    return formattedCookie;
  }).join('; ');
  

// Use os cookies na requisição
const response = await fetch(`https://findniche.com${req.originalUrl}`, {
  headers: {
    'Cookie': formattedCookies,
  }
})
  const page = await response.text()

 // const root = parse(page)

  let html = await adjustResourcePaths(page)

  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://127.0.0.1:5050");
  res.header("Access-Control-Allow-Origin", "*")
  
  res.send(html)
}catch(error){
  console.log(error)
  res.send(error.toString())
}
});




app.get('/page1', (req,res)=>{
  res.set('Content-Type', 'text/html');
  res.header("Access-Control-Allow-Origin", "*")
  res.send('<iframe src="/findniche"></iframe>')
})




app.listen(5050, () => {
  console.log('Proxy online na porta 5050');
});

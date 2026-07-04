const cheerio = require('cheerio');
fetch('https://www.chulabook.com/th/product-details/9786161402921')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const title = $('title').text();
    console.log('Chulabook Title:', title);
  });

const fs = require('fs');
const cheerio = require('cheerio');
fetch('https://www.naiin.com/product/search?q=9786161402921')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const link = $('a.itemname').first().attr('href');
    console.log('Naiin link:', link);
  });

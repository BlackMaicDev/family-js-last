const cheerio = require('cheerio');
fetch('https://thailand.kinokuniya.com/bw/9786161402921')
  .then(r => { console.log('STATUS:', r.status); return r.text(); })
  .then(html => {
    const $ = cheerio.load(html);
    const title = $('h1').text().trim();
    console.log('Kinokuniya Title:', title);
  });

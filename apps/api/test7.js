const cheerio = require('cheerio');
fetch('https://thailand.kinokuniya.com/bw/9786161402921')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log($('img').map((i, el) => $(el).attr('src')).get().filter(src => src && src.includes('book')));
  });

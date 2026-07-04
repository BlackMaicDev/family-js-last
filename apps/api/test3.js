const cheerio = require('cheerio');
fetch('https://www.se-ed.com/product/something.aspx?no=9786161402921')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const title = $('h1').first().text().trim();
    console.log('Title:', title);
  });

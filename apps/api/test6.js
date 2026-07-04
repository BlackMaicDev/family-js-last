const cheerio = require('cheerio');
fetch('https://thailand.kinokuniya.com/bw/9786161402921')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    const title = $('h1').text().split('Added')[0].trim();
    const image = $('.img-responsive').first().attr('src');
    const author = $('.author a').first().text().trim();
    const priceText = $('.price').text().trim();
    console.log({title, image, author, priceText});
  });

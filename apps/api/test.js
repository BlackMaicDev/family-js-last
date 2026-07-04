const fs = require('fs');
fetch('https://www.se-ed.com/search?filter.keyword=9786161402921')
  .then(r => r.text())
  .then(html => {
    fs.writeFileSync('test.html', html);
    const lines = html.split('\n');
    lines.forEach(l => {
      if (l.includes('product/')) {
        console.log(l.substring(0, 500));
      }
    });
  });

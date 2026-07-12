const http = require('http');

const shiftsToAdd = [
  {
    name: 'ดึก/บ่าย',
    code: 'N/A', // I will map this to ด/บ in the frontend
    startTime: '00:00',
    endTime: '23:59',
    durationHours: 16,
    color: '#0ea5e9' // sky blue
  },
  {
    name: 'เช้า/บ่าย',
    code: 'M/A', // I will map this to ช/บ in the frontend
    startTime: '08:00',
    endTime: '23:59',
    durationHours: 16,
    color: '#14b8a6' // teal
  }
];

async function run() {
  for (const shift of shiftsToAdd) {
    const data = JSON.stringify(shift);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/nurse/shift-types',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let result = '';
      res.on('data', d => result += d);
      res.on('end', () => console.log('Response:', result));
    });

    req.on('error', error => console.error(error));
    req.write(data);
    req.end();
  }
}

run();

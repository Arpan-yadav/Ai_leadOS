import * as http from 'http';

const start = Date.now();
http.get('http://localhost:3001/api/dashboard/stats', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const end = Date.now();
    console.log('STATUS:', res.statusCode, 'TIME:', end - start, 'ms');
  });
}).on('error', (err) => console.log('Error:', err.message));

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api',
  method: 'GET',
  timeout: 5000
};

console.log('Checking if application is running...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received:');
    console.log(data.substring(0, 200) + (data.length > 200 ? '...' : ''));
    console.log('\nApplication is running successfully!');
  });
});

req.on('error', (e) => {
  console.log('Error connecting to application:');
  console.log(e.message);
  console.log('\nApplication may not be running or might have startup errors.');
});

req.end(); 
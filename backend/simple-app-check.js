const http = require('http');

console.log('Checking if NestJS application is running...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 3001
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response received - Application is running!');
    if (data.length > 0) {
      try {
        console.log(data.substring(0, 100) + (data.length > 100 ? '...' : ''));
      } catch (e) {
        console.log('Could not display response data');
      }
    }
  });
});

req.on('error', (e) => {
  console.log(`Error: ${e.message}`);
  console.log('Application is not running or is not accessible.');
});

req.on('timeout', () => {
  console.log('Request timed out - Application might be starting up or not responding.');
  req.destroy();
});

req.end(); 
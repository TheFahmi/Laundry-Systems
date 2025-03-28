const http = require('http');

// Function to check for any errors
function checkApplicationErrors() {
  console.log('Checking for application errors...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 400) {
        console.log('Error response received:');
        try {
          const parsedData = JSON.parse(data);
          console.log(JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.log(data.substring(0, 500) + (data.length > 500 ? '...' : ''));
        }
      } else {
        console.log('Success! No errors found when querying orders endpoint.');
        console.log('Sample response (truncated):');
        try {
          const parsedData = JSON.parse(data);
          console.log(JSON.stringify(parsedData, null, 2).substring(0, 200) + '...');
        } catch (e) {
          console.log(data.substring(0, 200) + '...');
        }
      }
      
      // Now try to create an order to see if there are any issues
      console.log('\nTesting order creation...');
      testOrderCreation();
    });
  });
  
  req.on('error', (e) => {
    console.log('Error connecting to application:');
    console.log(e.message);
  });
  
  req.end();
}

// Function to test order creation
function testOrderCreation() {
  const testOrder = {
    customerId: '00000000-0000-0000-0000-000000000001', // Use a sample customer ID
    items: [
      {
        serviceId: '00000000-0000-0000-0000-000000000001', // Use a sample service ID
        quantity: 1,
        weight: 1,
        price: 10000
      }
    ],
    status: 'new',
    totalAmount: 10000,
    totalWeight: 1
  };
  
  const data = JSON.stringify(testOrder);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`Order creation status code: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode >= 400) {
        console.log('Error creating order:');
        try {
          const parsedData = JSON.parse(responseData);
          console.log(JSON.stringify(parsedData, null, 2));
        } catch (e) {
          console.log(responseData);
        }
      } else {
        console.log('Success! Order was created without errors.');
        try {
          const parsedData = JSON.parse(responseData);
          console.log(`Order ID: ${parsedData.data?.id || 'unknown'}`);
          console.log(`Order Number: ${parsedData.data?.orderNumber || 'unknown'}`);
        } catch (e) {
          console.log('Could not parse response data.');
        }
      }
    });
  });
  
  req.on('error', (e) => {
    console.log('Error during order creation test:');
    console.log(e.message);
  });
  
  req.write(data);
  req.end();
}

// Start the check
checkApplicationErrors(); 
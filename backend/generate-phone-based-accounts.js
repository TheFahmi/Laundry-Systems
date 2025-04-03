require('dotenv').config();
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// Define the data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: ['dist/**/*.entity.js'],
});

// Run the migration
async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Make sure uuid-ossp extension is available
    await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    console.log('Generating phone-based user accounts for customers...');
    
    // Get customers without user accounts
    const customersWithoutUsers = await AppDataSource.query(`
      SELECT c.id, c.name, c.email, c.phone
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id IS NULL AND c.phone IS NOT NULL
    `);

    console.log(`Found ${customersWithoutUsers.length} customers without user accounts who have phone numbers`);

    // Default password - using the phone number itself as the initial password
    const saltRounds = 10;
    
    // Process each customer
    let createdCount = 0;
    const accountDetails = [];
    
    for (const customer of customersWithoutUsers) {
      try {
        // Clean the phone number (remove spaces, dashes, etc)
        let phone = (customer.phone || '').replace(/[^0-9]/g, '');
        
        if (!phone) {
          console.log(`Skipping customer ${customer.id} - ${customer.name}: Invalid phone number`);
          continue;
        }
        
        // Generate username from phone number
        let username = 'user' + phone.slice(-8); // Use last 8 digits with 'user' prefix
        
        // Set password as the phone number itself
        let password = phone;
        
        // Check if username already exists
        const existingUser = await AppDataSource.query(`
          SELECT username FROM users WHERE username = $1
        `, [username]);
        
        // If username exists, add a random number
        if (existingUser.length > 0) {
          username = username + Math.floor(1000 + Math.random() * 9000);
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create user account
        const result = await AppDataSource.query(`
          INSERT INTO users (
            id, username, password, email, name, role, is_active, created_at, updated_at
          ) VALUES (
            uuid_generate_v4(), $1, $2, $3, $4, 'customer', true, now(), now()
          ) RETURNING id
        `, [username, hashedPassword, customer.email || `${username}@example.com`, customer.name]);
        
        const userId = result[0].id;
        
        // Link user to customer
        await AppDataSource.query(`
          UPDATE customers
          SET user_id = $1
          WHERE id = $2
        `, [userId, customer.id]);
        
        createdCount++;
        console.log(`Created user account for ${customer.name}: username=${username}, password=${password}`);
        
        // Store account details for report
        accountDetails.push({
          name: customer.name,
          username: username,
          password: password,
          phone: customer.phone,
          email: customer.email
        });
      } catch (error) {
        console.error(`Error creating user for customer ${customer.id} - ${customer.name}:`, error);
      }
    }
    
    console.log(`Process completed successfully. Created ${createdCount} user accounts.`);
    
    // Create a report file with usernames and passwords
    const fs = require('fs');
    
    let report = `
PHONE-BASED CUSTOMER ACCOUNT GENERATION REPORT
=============================================
Date: ${new Date().toLocaleString()}
Total accounts created: ${createdCount}

IMPORTANT: These passwords are temporary and should be changed!
    
ACCOUNT DETAILS:
---------------
`;

    // Add account details to report
    accountDetails.forEach((account, index) => {
      report += `
${index + 1}. ${account.name}
   Username: ${account.username}
   Password: ${account.password}
   Phone: ${account.phone}
   Email: ${account.email || 'N/A'}
      `;
    });
    
    fs.writeFileSync('phone-based-accounts-report.txt', report);
    console.log('Report saved to phone-based-accounts-report.txt');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Execute the migration
runMigration(); 
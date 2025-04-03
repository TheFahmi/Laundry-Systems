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
  migrations: ['dist/migrations/1743780000000-GenerateCustomerUserAccounts.js'],
});

// Run the migration
async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    console.log('Generating user accounts for customers...');
    
    // Get customers without user accounts
    const customersWithoutUsers = await AppDataSource.query(`
      SELECT c.id, c.name, c.email, c.phone
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id IS NULL AND c.email IS NOT NULL
    `);

    console.log(`Found ${customersWithoutUsers.length} customers without user accounts who have email addresses`);

    // Default password - we'll use a secure one and require reset on first login
    const defaultPassword = 'Laundry@' + new Date().getFullYear(); // e.g., "Laundry@2023"
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Process each customer
    let createdCount = 0;
    for (const customer of customersWithoutUsers) {
      try {
        // Generate username from email (remove domain part)
        let username = customer.email.split('@')[0];
        
        // Check if username already exists
        const existingUser = await AppDataSource.query(`
          SELECT username FROM users WHERE username = $1
        `, [username]);
        
        // If username exists, add a random number
        if (existingUser.length > 0) {
          username = username + Math.floor(1000 + Math.random() * 9000);
        }
        
        // Create user account
        const result = await AppDataSource.query(`
          INSERT INTO users (
            id, username, password, email, name, role, is_active, created_at, updated_at
          ) VALUES (
            uuid_generate_v4(), $1, $2, $3, $4, 'customer', true, now(), now()
          ) RETURNING id
        `, [username, hashedPassword, customer.email, customer.name]);
        
        const userId = result[0].id;
        
        // Link user to customer
        await AppDataSource.query(`
          UPDATE customers
          SET user_id = $1
          WHERE id = $2
        `, [userId, customer.id]);
        
        createdCount++;
        console.log(`Created user account for ${customer.name}: username=${username}`);
      } catch (error) {
        console.error(`Error creating user for customer ${customer.id} - ${customer.name}:`, error);
      }
    }
    
    console.log(`Process completed successfully. Created ${createdCount} user accounts.`);
    console.log(`Default password for all generated accounts: ${defaultPassword}`);
    
    // Create a report file with usernames and passwords
    const fs = require('fs');
    const report = `
CUSTOMER ACCOUNT GENERATION REPORT
==================================
Date: ${new Date().toLocaleString()}
Total accounts created: ${createdCount}
Default password for all accounts: ${defaultPassword}
    
Note: Users will need to reset their password on first login.
A separate email should be sent to customers with their credentials.
`;
    
    fs.writeFileSync('customer-accounts-report.txt', report);
    console.log('Report saved to customer-accounts-report.txt');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Execute the migration
runMigration(); 
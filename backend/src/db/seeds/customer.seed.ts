import { DataSource } from 'typeorm';
import { Customer } from '../../modules/customer/entities/customer.entity';
import { v4 as uuidv4 } from 'uuid';

export const seedCustomers = async (dataSource: DataSource) => {
  try {
    // Check if we already have customers
    const existingCustomers = await dataSource.query('SELECT COUNT(*) FROM customers');
    const customerCount = parseInt(existingCustomers[0].count);
    
    if (customerCount > 0) {
      console.log(`Found ${customerCount} existing customers, skipping seed...`);
      return;
    }

    // Create customers using direct SQL to avoid naming issues
    const customers = [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St'
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
        address: '456 Oak Ave'
      },
      {
        id: uuidv4(),
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1122334455',
        address: '789 Pine Rd'
      }
    ];

    // Insert customers using direct query with snake_case column names
    console.log('Inserting customers...');
    for (const customer of customers) {
      try {
        await dataSource.query(
          `INSERT INTO customers (id, name, email, phone, address, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [customer.id, customer.name, customer.email, customer.phone, customer.address]
        );
        console.log(`Inserted customer: ${customer.name}`);
      } catch (err) {
        console.error(`Error inserting customer ${customer.name}:`, err);
      }
    }
    
    console.log(`Completed seeding customers`);
  } catch (error) {
    console.error('Error in customer seeding:', error);
  }
}; 
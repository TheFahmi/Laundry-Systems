import { DataSource } from 'typeorm';
import { Customer } from '../../modules/customer/customer.entity';
import { v4 as uuidv4 } from 'uuid';

export async function seedCustomers(dataSource: DataSource) {
  const customerRepository = dataSource.getRepository(Customer);
  
  console.log('Starting customer seed...');
  
  // Check if we already have customers
  const count = await customerRepository.count();
  if (count > 0) {
    console.log(`Database already has ${count} customers. Skipping customer seed.`);
    return;
  }
  
  // Create sample customers
  const customers = [
    customerRepository.create({
      id: uuidv4(),
      name: 'John Doe',
      phone: '081234567890',
      address: 'Jl. Sudirman No. 123, Jakarta',
      email: 'john.doe@example.com'
    }),
    customerRepository.create({
      id: uuidv4(),
      name: 'Jane Smith',
      phone: '085678901234',
      address: 'Jl. Thamrin No. 456, Jakarta',
      email: 'jane.smith@example.com'
    }),
    customerRepository.create({
      id: uuidv4(),
      name: 'Ahmad Rahman',
      phone: '089876543210',
      address: 'Jl. Gatot Subroto No. 789, Jakarta',
      email: 'ahmad.rahman@example.com'
    }),
    customerRepository.create({
      id: uuidv4(),
      name: 'Siti Aminah',
      phone: '087654321098',
      address: 'Jl. Kuningan No. 111, Jakarta',
      email: 'siti.aminah@example.com'
    }),
    customerRepository.create({
      id: uuidv4(),
      name: 'Budi Santoso',
      phone: '082345678901',
      address: 'Jl. Menteng No. 222, Jakarta',
      email: 'budi.santoso@example.com'
    })
  ];
  
  // Save all customers to database
  await customerRepository.save(customers);
  
  console.log(`Created ${customers.length} customers`);
} 
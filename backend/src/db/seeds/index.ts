import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { seedServiceCategories } from './service-category.seed';
import { seedServices } from './service.seed';
import { seedCustomers } from './customer.seed';

const runSeeds = async () => {
  try {
    // Initialize the data source
    const dataSource = await AppDataSource.initialize();
    console.log('Data source initialized');

    // Run seeds in order
    console.log('Running service category seeds...');
    await seedServiceCategories(dataSource);
    console.log('Service category seeds completed');

    console.log('Running service seeds...');
    await seedServices(dataSource);
    console.log('Service seeds completed');

    console.log('Running customer seeds...');
    await seedCustomers(dataSource);
    console.log('Customer seeds completed');

    console.log('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
};

runSeeds(); 
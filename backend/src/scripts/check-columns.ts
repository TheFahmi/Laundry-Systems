import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';

async function checkColumns() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Check service columns
    const serviceColumns = await dataSource.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'services'
    `);
    console.log('Service columns:', serviceColumns);
    
    // Check order_items columns and relationships
    const orderItemColumns = await dataSource.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'order_items'
    `);
    console.log('Order Item columns:', orderItemColumns);
    
    // Check foreign keys
    const foreignKeys = await dataSource.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'order_items'
    `);
    console.log('Order Item foreign keys:', foreignKeys);
    
  } catch (error) {
    console.error('Error checking columns:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

checkColumns()
  .then(() => console.log('Process completed'))
  .catch(error => console.error('Process failed:', error)); 
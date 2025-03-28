import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class FixCustomerIdNullValues1742894471003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if there are any NULL values in the id column
      const nullRows = await queryRunner.query(`
        SELECT COUNT(*) FROM customers 
        WHERE id IS NULL
      `);
      
      const nullCount = parseInt(nullRows[0].count, 10);
      console.log(`Found ${nullCount} customers with NULL id values`);
      
      if (nullCount > 0) {
        // For each customer with NULL id, generate a UUID and update
        await queryRunner.query(`
          CREATE OR REPLACE FUNCTION update_null_customer_ids() RETURNS void AS $$
          DECLARE
            customer_rec RECORD;
          BEGIN
            FOR customer_rec IN SELECT ctid FROM customers WHERE id IS NULL LOOP
              UPDATE customers 
              SET id = '${uuidv4()}'
              WHERE ctid = customer_rec.ctid;
            END LOOP;
          END;
          $$ LANGUAGE plpgsql;
          
          SELECT update_null_customer_ids();
        `);
        
        console.log(`Updated ${nullCount} customers with new UUID values`);
      }
      
      // Make the id column NOT NULL to prevent future NULL values
      const columnInfo = await queryRunner.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'customers' 
        AND column_name = 'id'
      `);
      
      if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'YES') {
        await queryRunner.query(`
          ALTER TABLE customers 
          ALTER COLUMN id SET NOT NULL
        `);
        console.log('Set customers.id column to NOT NULL');
      } else {
        console.log('customers.id column is already NOT NULL');
      }
      
    } catch (error) {
      console.error('Error fixing customer id values:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Allow NULL values in the id column again (typically you don't want to revert this)
      await queryRunner.query(`
        ALTER TABLE customers 
        ALTER COLUMN id DROP NOT NULL
      `);
    } catch (error) {
      console.error('Error in down migration:', error);
    }
  }
} 
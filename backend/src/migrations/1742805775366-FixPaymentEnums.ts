import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPaymentEnums1742805775366 implements MigrationInterface {
  name = 'FixPaymentEnums1742805775366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the enum types already exist
    const typeCheckResult = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum'
      ) as method_exists, EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum'
      ) as status_exists, EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'paymentstatus'
      ) as old_status_exists;
    `);
    
    const { method_exists, status_exists, old_status_exists } = typeCheckResult[0];
    
    console.log('Enum type check results:', { method_exists, status_exists, old_status_exists });
    
    // First create the enum types if they don't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
          CREATE TYPE payment_method_enum AS ENUM('cash', 'credit_card', 'bank_transfer', 'ewallet', 'other');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
          CREATE TYPE payment_status_enum AS ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded');
        END IF;
      END
      $$;
    `);
    
    // Get current column types
    const columnTypes = await queryRunner.query(`
      SELECT 
        pg_typeof(payment_method) as method_type,
        pg_typeof(status) as status_type
      FROM payments 
      LIMIT 1
    `);
    
    console.log('Current column types:', columnTypes[0]);
    
    // Handle payment_method column
    try {
      // Update the payment_method column - first ensure it's text
      await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN payment_method TYPE VARCHAR(50);
      `);
      
      // Then convert to enum
      await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN payment_method TYPE payment_method_enum
        USING CASE
          WHEN payment_method = 'cash' THEN 'cash'::payment_method_enum
          WHEN payment_method = 'credit_card' THEN 'credit_card'::payment_method_enum
          WHEN payment_method = 'bank_transfer' THEN 'bank_transfer'::payment_method_enum
          WHEN payment_method = 'ewallet' THEN 'ewallet'::payment_method_enum
          ELSE 'other'::payment_method_enum
        END;
      `);
      
      console.log('Successfully converted payment_method to enum');
    } catch (error) {
      console.error('Error converting payment_method:', error);
      throw error;
    }
    
    // Handle status column
    try {
      // First check if there's an existing enum type for status
      if (old_status_exists) {
        // Need to convert via text first
        console.log('Converting from existing paymentstatus enum to payment_status_enum');
        
        // Get information about any default values
        const defaultInfoResult = await queryRunner.query(`
          SELECT column_name, column_default
          FROM information_schema.columns
          WHERE table_name = 'payments' AND column_name = 'status'
        `);
        
        const hasDefault = defaultInfoResult.length > 0 && defaultInfoResult[0].column_default !== null;
        if (hasDefault) {
          console.log('Dropping default value for status column:', defaultInfoResult[0].column_default);
          await queryRunner.query(`
            ALTER TABLE payments
            ALTER COLUMN status DROP DEFAULT;
          `);
        }
        
        // Create a mapping table for conversion
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS temp_payment_status_mapping (
            old_status text,
            new_status payment_status_enum
          );
        `);
        
        // Insert mapping values
        await queryRunner.query(`
          INSERT INTO temp_payment_status_mapping (old_status, new_status)
          VALUES 
            ('pending', 'pending'::payment_status_enum),
            ('completed', 'completed'::payment_status_enum),
            ('failed', 'failed'::payment_status_enum),
            ('cancelled', 'cancelled'::payment_status_enum),
            ('refunded', 'refunded'::payment_status_enum)
          ON CONFLICT DO NOTHING;
        `);
        
        // First check the values in the status column
        const statusValues = await queryRunner.query(`
          SELECT DISTINCT status FROM payments;
        `);
        
        console.log('Current status values in the payments table:', statusValues);
        
        // Convert status to text first
        await queryRunner.query(`
          ALTER TABLE payments
          ALTER COLUMN status TYPE text;
        `);
        
        // Then convert to the new enum using the mapping
        await queryRunner.query(`
          UPDATE payments p
          SET status = (
            SELECT m.new_status
            FROM temp_payment_status_mapping m
            WHERE m.old_status = p.status
          )
          WHERE status IS NOT NULL;
        `);
        
        // Set default value for any NULL status
        await queryRunner.query(`
          UPDATE payments
          SET status = 'pending'
          WHERE status IS NULL;
        `);
        
        // Change column type to the enum
        await queryRunner.query(`
          ALTER TABLE payments
          ALTER COLUMN status TYPE payment_status_enum USING status::payment_status_enum;
        `);
        
        // Drop the temporary mapping table
        await queryRunner.query(`
          DROP TABLE temp_payment_status_mapping;
        `);
      } else {
        // Simple case: convert directly from text to enum
        // First check for default values
        const defaultInfoResult = await queryRunner.query(`
          SELECT column_name, column_default
          FROM information_schema.columns
          WHERE table_name = 'payments' AND column_name = 'status'
        `);
        
        const hasDefault = defaultInfoResult.length > 0 && defaultInfoResult[0].column_default !== null;
        if (hasDefault) {
          console.log('Dropping default value for status column:', defaultInfoResult[0].column_default);
          await queryRunner.query(`
            ALTER TABLE payments
            ALTER COLUMN status DROP DEFAULT;
          `);
        }
        
        await queryRunner.query(`
          ALTER TABLE payments
          ALTER COLUMN status TYPE VARCHAR(50);
        `);
        
        await queryRunner.query(`
          ALTER TABLE payments
          ALTER COLUMN status TYPE payment_status_enum
          USING CASE 
            WHEN status = 'pending' THEN 'pending'::payment_status_enum
            WHEN status = 'completed' THEN 'completed'::payment_status_enum
            WHEN status = 'failed' THEN 'failed'::payment_status_enum
            WHEN status = 'cancelled' THEN 'cancelled'::payment_status_enum
            WHEN status = 'refunded' THEN 'refunded'::payment_status_enum
            ELSE 'pending'::payment_status_enum
          END;
        `);
      }
      
      console.log('Successfully converted status to enum');
    } catch (error) {
      console.error('Error converting status:', error);
      throw error;
    }
    
    // Set default values
    await queryRunner.query(`
      ALTER TABLE payments
      ALTER COLUMN payment_method SET DEFAULT 'cash',
      ALTER COLUMN status SET DEFAULT 'pending';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert back to varchar
    try {
      await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN payment_method TYPE VARCHAR(50) USING payment_method::text,
        ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
      `);
      
      // Remove default values
      await queryRunner.query(`
        ALTER TABLE payments
        ALTER COLUMN payment_method DROP DEFAULT,
        ALTER COLUMN status DROP DEFAULT;
      `);
    } catch (error) {
      console.error('Error in down migration:', error);
      throw error;
    }
  }
} 
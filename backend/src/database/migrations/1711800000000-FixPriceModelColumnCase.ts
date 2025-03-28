import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPriceModelColumnCase1711800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists with camelCase
    const priceModelColumnExists = await queryRunner.hasColumn('services', 'priceModel');
    
    // If the camelCase column exists, we need to standardize to lowercase
    if (priceModelColumnExists) {
      // First rename the column to a temporary name
      await queryRunner.query(`
        ALTER TABLE services 
        RENAME COLUMN "priceModel" TO "pricemodel_temp"
      `);
      
      // Then create the properly named column
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "pricemodel" pricemodel DEFAULT 'per_kg' NOT NULL
      `);
      
      // Copy the data from the temp column
      await queryRunner.query(`
        UPDATE services 
        SET "pricemodel" = "pricemodel_temp"::pricemodel
      `);
      
      // Finally, drop the temporary column
      await queryRunner.query(`
        ALTER TABLE services 
        DROP COLUMN "pricemodel_temp"
      `);
      
      console.log('Standardized "pricemodel" column case in services table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration standardizes column names, so the down method is a no-op
    // We don't want to revert back to inconsistent column names
  }
} 
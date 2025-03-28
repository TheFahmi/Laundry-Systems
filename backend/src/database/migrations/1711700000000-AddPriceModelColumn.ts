import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceModelColumn1711700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the enum type if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricemodel') THEN
          CREATE TYPE pricemodel AS ENUM ('per_kg', 'per_piece', 'flat_rate');
        END IF;
      END
      $$;
    `);
    
    // Check if priceModel column exists and add if missing
    const priceModelColumnExists = await queryRunner.hasColumn('services', 'priceModel');
    if (!priceModelColumnExists) {
      // Add priceModel column using the enum type
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "priceModel" pricemodel DEFAULT 'per_kg' NOT NULL
      `);
      console.log('Added "priceModel" column to services table');
      
      // Update the priceModel based on unit for existing records
      await queryRunner.query(`
        UPDATE services 
        SET "priceModel" = 
          CASE 
            WHEN unit = 'kg' THEN 'per_kg'::pricemodel
            WHEN unit = 'pcs' THEN 'per_piece'::pricemodel
            ELSE 'flat_rate'::pricemodel
          END
      `);
      console.log('Updated priceModel values for existing records');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const priceModelColumnExists = await queryRunner.hasColumn('services', 'priceModel');
    if (priceModelColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "priceModel"`);
    }
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPriceModelColumnSpecific1711800000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // First check if the column exists with the wrong case
      await queryRunner.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'services' 
            AND column_name = 'priceModel'
          ) THEN
            -- If it exists, rename to lowercase
            ALTER TABLE services RENAME COLUMN "priceModel" TO pricemodel;
          END IF;
        END
        $$;
      `);
      
      console.log('Fixed pricemodel column case in services table if needed');
    } catch (error) {
      console.error('Error in migration:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration needed for a case fix
  }
} 
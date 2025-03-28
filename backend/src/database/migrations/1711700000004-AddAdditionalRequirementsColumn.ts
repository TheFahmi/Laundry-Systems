import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalRequirementsColumn1711700000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if additionalRequirements column exists and add if missing
    const additionalRequirementsColumnExists = await queryRunner.hasColumn('services', 'additionalRequirements');
    if (!additionalRequirementsColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "additionalRequirements" JSONB NULL
      `);
      console.log('Added "additionalRequirements" column to services table');
      
      // Initialize with empty JSON object for existing services
      await queryRunner.query(`
        UPDATE services 
        SET "additionalRequirements" = '{}'::jsonb
        WHERE "additionalRequirements" IS NULL
      `);
      console.log('Initialized additionalRequirements with empty JSON objects');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const additionalRequirementsColumnExists = await queryRunner.hasColumn('services', 'additionalRequirements');
    if (additionalRequirementsColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "additionalRequirements"`);
    }
  }
} 
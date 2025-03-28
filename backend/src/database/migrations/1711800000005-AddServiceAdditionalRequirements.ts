import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceAdditionalRequirements1711800000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if additional_requirements column exists in services
      const additionalRequirementsExists = await queryRunner.hasColumn('services', 'additional_requirements');
      if (!additionalRequirementsExists) {
        await queryRunner.query(`
          ALTER TABLE services 
          ADD COLUMN "additional_requirements" JSONB NULL
        `);
        console.log('Added additional_requirements column to services table');
      }
    } catch (error) {
      console.error('Error in migration:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // If needed, we can drop the added column, but it's usually better to keep it
    // for data integrity
  }
} 
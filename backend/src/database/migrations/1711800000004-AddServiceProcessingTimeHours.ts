import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceProcessingTimeHours1711800000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if processing_time_hours column exists in services
      const processingTimeHoursExists = await queryRunner.hasColumn('services', 'processing_time_hours');
      if (!processingTimeHoursExists) {
        await queryRunner.query(`
          ALTER TABLE services 
          ADD COLUMN "processing_time_hours" INTEGER NOT NULL DEFAULT 0
        `);
        console.log('Added processing_time_hours column to services table');
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
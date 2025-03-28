import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProcessingTimeHoursColumn1711700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if processingTimeHours column exists and add if missing
    const processingTimeHoursColumnExists = await queryRunner.hasColumn('services', 'processingTimeHours');
    if (!processingTimeHoursColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "processingTimeHours" INTEGER DEFAULT 2 NOT NULL
      `);
      console.log('Added "processingTimeHours" column to services table');
      
      // If estimatedTime column exists, copy values from it
      const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
      if (estimatedTimeColumnExists) {
        await queryRunner.query(`
          UPDATE services 
          SET "processingTimeHours" = CASE
            WHEN "estimatedTime" >= 60 THEN "estimatedTime" / 60
            ELSE "estimatedTime"
          END
        `);
        console.log('Copied values from estimatedTime to processingTimeHours');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const processingTimeHoursColumnExists = await queryRunner.hasColumn('services', 'processingTimeHours');
    if (processingTimeHoursColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "processingTimeHours"`);
    }
  }
} 
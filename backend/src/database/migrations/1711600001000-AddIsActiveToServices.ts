import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToServices1711600001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if is_active column exists and add if missing
    const isActiveColumnExists = await queryRunner.hasColumn('services', 'is_active');
    if (!isActiveColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "is_active" BOOLEAN DEFAULT TRUE NOT NULL
      `);
      console.log('Added "is_active" column to services table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const isActiveColumnExists = await queryRunner.hasColumn('services', 'is_active');
    if (isActiveColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "is_active"`);
    }
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveColumn1711700000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if isActive column exists and add if missing
    const isActiveColumnExists = await queryRunner.hasColumn('services', 'isActive');
    if (!isActiveColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "isActive" BOOLEAN DEFAULT TRUE NOT NULL
      `);
      console.log('Added "isActive" column to services table');
      
      // Check if is_active column exists and copy values from it
      const is_active_exists = await queryRunner.hasColumn('services', 'is_active');
      if (is_active_exists) {
        await queryRunner.query(`
          UPDATE services 
          SET "isActive" = "is_active"
        `);
        console.log('Copied values from is_active to isActive');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const isActiveColumnExists = await queryRunner.hasColumn('services', 'isActive');
    if (isActiveColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "isActive"`);
    }
  }
} 
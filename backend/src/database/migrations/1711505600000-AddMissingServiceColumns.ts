import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingServiceColumns1711505600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if unit column exists and add if missing
    const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
    if (!unitColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "unit" VARCHAR(50) DEFAULT 'kg' NOT NULL
      `);
      console.log('Added "unit" column to services table');
    }

    // Check if estimatedTime column exists and add if missing
    const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
    if (!estimatedTimeColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
      `);
      console.log('Added "estimatedTime" column to services table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
    if (estimatedTimeColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "estimatedTime"`);
    }

    const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
    if (unitColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "unit"`);
    }
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtColumn1711700000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if updatedAt column exists and add if missing
    const updatedAtColumnExists = await queryRunner.hasColumn('services', 'updatedAt');
    if (!updatedAtColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "updatedAt" TIMESTAMP DEFAULT now() NOT NULL
      `);
      console.log('Added "updatedAt" column to services table');
      
      // Check if updated_at column exists and copy values from it
      const updated_at_exists = await queryRunner.hasColumn('services', 'updated_at');
      if (updated_at_exists) {
        await queryRunner.query(`
          UPDATE services 
          SET "updatedAt" = updated_at
        `);
        console.log('Copied values from updated_at to updatedAt');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const updatedAtColumnExists = await queryRunner.hasColumn('services', 'updatedAt');
    if (updatedAtColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "updatedAt"`);
    }
  }
} 
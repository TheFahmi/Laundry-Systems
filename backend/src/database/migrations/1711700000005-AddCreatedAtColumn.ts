import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtColumn1711700000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if createdAt column exists and add if missing
    const createdAtColumnExists = await queryRunner.hasColumn('services', 'createdAt');
    if (!createdAtColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "createdAt" TIMESTAMP DEFAULT now() NOT NULL
      `);
      console.log('Added "createdAt" column to services table');
      
      // Check if created_at column exists and copy values from it
      const created_at_exists = await queryRunner.hasColumn('services', 'created_at');
      if (created_at_exists) {
        await queryRunner.query(`
          UPDATE services 
          SET "createdAt" = created_at
        `);
        console.log('Copied values from created_at to createdAt');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const createdAtColumnExists = await queryRunner.hasColumn('services', 'createdAt');
    if (createdAtColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "createdAt"`);
    }
  }
} 
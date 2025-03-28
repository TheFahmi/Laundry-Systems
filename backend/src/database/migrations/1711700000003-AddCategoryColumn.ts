import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryColumn1711700000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if category column exists and add if missing
    const categoryColumnExists = await queryRunner.hasColumn('services', 'category');
    if (!categoryColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "category" VARCHAR(255) NULL
      `);
      console.log('Added "category" column to services table');
      
      // If category_id column exists, try to populate the category column
      const category_id_exists = await queryRunner.hasColumn('services', 'category_id');
      if (category_id_exists) {
        // Join with service_categories to get the category name
        await queryRunner.query(`
          UPDATE services s
          SET "category" = sc.name
          FROM service_categories sc
          WHERE s.category_id = sc.id
        `);
        console.log('Populated category field from category_id relationships');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed
    const categoryColumnExists = await queryRunner.hasColumn('services', 'category');
    if (categoryColumnExists) {
      await queryRunner.query(`ALTER TABLE services DROP COLUMN "category"`);
    }
  }
} 
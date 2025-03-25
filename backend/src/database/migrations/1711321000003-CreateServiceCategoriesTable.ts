import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceCategoriesTable1711321000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    
    // Insert default service categories
    await queryRunner.query(`
      INSERT INTO service_categories (name, description, created_at, updated_at)
      VALUES 
        ('Regular', 'Layanan cuci reguler dengan waktu pengerjaan 2-3 hari', now(), now())
    `);
    
    await queryRunner.query(`
      INSERT INTO service_categories (name, description, created_at, updated_at)
      VALUES 
        ('Express', 'Layanan cuci express dengan waktu pengerjaan 1 hari', now(), now())
    `);
    
    await queryRunner.query(`
      INSERT INTO service_categories (name, description, created_at, updated_at)
      VALUES 
        ('Super Express', 'Layanan cuci super express dengan waktu pengerjaan 6 jam', now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS service_categories`);
  }
} 
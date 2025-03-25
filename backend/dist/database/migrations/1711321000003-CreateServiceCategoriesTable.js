"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateServiceCategoriesTable1711321000003 = void 0;
class CreateServiceCategoriesTable1711321000003 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS service_categories`);
    }
}
exports.CreateServiceCategoriesTable1711321000003 = CreateServiceCategoriesTable1711321000003;
//# sourceMappingURL=1711321000003-CreateServiceCategoriesTable.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateServicesTable1711321000004 = void 0;
class CreateServicesTable1711321000004 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES service_categories(id),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Kering Regular', 'Layanan cuci kering reguler per kg', 7000, 1, now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Setrika Regular', 'Layanan cuci dan setrika reguler per kg', 10000, 1, now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Kering Express', 'Layanan cuci kering express per kg', 10000, 2, now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Setrika Express', 'Layanan cuci dan setrika express per kg', 15000, 2, now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Kering Super Express', 'Layanan cuci kering super express per kg', 15000, 3, now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO services (name, description, price, category_id, created_at, updated_at)
      VALUES ('Cuci Setrika Super Express', 'Layanan cuci dan setrika super express per kg', 20000, 3, now(), now())
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS services`);
    }
}
exports.CreateServicesTable1711321000004 = CreateServicesTable1711321000004;
//# sourceMappingURL=1711321000004-CreateServicesTable.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomersTable1711321000000 = void 0;
class CreateCustomersTable1711321000000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100),
        address VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      INSERT INTO customers (name, phone, email, address, notes, created_at, updated_at)
      VALUES 
        ('Budi Santoso', '081234567890', 'budi@example.com', 'Jl. Sudirman No. 123, Jakarta', 'Pelanggan tetap', now(), now()),
        ('Siti Rahma', '082345678901', 'siti@example.com', 'Jl. Thamrin No. 45, Jakarta', 'Alergi deterjen tertentu', now(), now()),
        ('Joko Widodo', '083456789012', 'joko@example.com', 'Jl. Gatot Subroto No. 10, Jakarta', NULL, now(), now()),
        ('Anita Wijaya', '084567890123', 'anita@example.com', 'Jl. Kuningan No. 55, Jakarta', 'Perlu disetrika rapi', now(), now()),
        ('Denny Sumargo', '085678901234', 'denny@example.com', 'Jl. Kebon Jeruk No. 77, Jakarta', 'Pelanggan baru', now(), now())
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS customers`);
    }
}
exports.CreateCustomersTable1711321000000 = CreateCustomersTable1711321000000;
//# sourceMappingURL=1711321000000-CreateCustomersTable.js.map
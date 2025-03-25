"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1711321000010 = void 0;
class CreateUserTable1711321000010 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`
      INSERT INTO users (username, password, full_name, role, created_at, updated_at)
      VALUES ('admin', '$2b$10$UhIrH2L7oCJ0Za0K1hNcN.xhN1nQI8FWXZJY3g76ZzUXT.o9zBYHC', 'Administrator', 'admin', now(), now())
    `);
        await queryRunner.query(`
      INSERT INTO users (username, password, full_name, role, created_at, updated_at)
      VALUES 
        ('kasir1', '$2b$10$k5ZlvQQcmltDe90ILhj3n.QBuIwdl3Z9sCNGYvjzI.3YVw5/LX5K.', 'Dewi Sartika', 'cashier', now(), now()),
        ('kasir2', '$2b$10$k5ZlvQQcmltDe90ILhj3n.QBuIwdl3Z9sCNGYvjzI.3YVw5/LX5K.', 'Rudi Hermawan', 'cashier', now(), now()),
        ('operator', '$2b$10$k5ZlvQQcmltDe90ILhj3n.QBuIwdl3Z9sCNGYvjzI.3YVw5/LX5K.', 'Budi Santoso', 'operator', now(), now()),
        ('manager', '$2b$10$k5ZlvQQcmltDe90ILhj3n.QBuIwdl3Z9sCNGYvjzI.3YVw5/LX5K.', 'Sinta Wijaya', 'manager', now(), now())
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS users`);
    }
}
exports.CreateUserTable1711321000010 = CreateUserTable1711321000010;
//# sourceMappingURL=1711321000010-CreateUserTable.js.map
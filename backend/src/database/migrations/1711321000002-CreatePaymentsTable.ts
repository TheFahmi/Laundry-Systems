import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1711321000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        reference_number VARCHAR(100),
        status VARCHAR(20) NOT NULL,
        order_id INTEGER REFERENCES orders(id),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert dummy payments
    await queryRunner.query(`
      INSERT INTO payments (amount, payment_method, reference_number, status, order_id, created_at, updated_at)
      VALUES 
        (35000, 'cash', NULL, 'completed', 1, now(), now()),
        (25000, 'bank_transfer', 'TRF12345678', 'completed', 2, now(), now()),
        (25000, 'bank_transfer', 'TRF12345679', 'pending', 2, now(), now()),
        (40000, 'e-wallet', 'EWALLET98765', 'completed', 3, now(), now()),
        (35000, 'bank_transfer', 'TRF12345680', 'pending', 3, now(), now()),
        (45000, 'cash', NULL, 'completed', 4, now(), now()),
        (30000, 'e-wallet', 'EWALLET98766', 'completed', 5, now(), now()),
        (30000, 'cash', NULL, 'pending', 5, now(), now()),
        (15000, 'bank_transfer', 'TRF12345681', 'completed', 6, now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payments`);
  }
} 
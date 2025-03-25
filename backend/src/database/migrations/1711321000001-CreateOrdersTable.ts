import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1711321000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        notes VARCHAR(255),
        pickup_date DATE NOT NULL,
        delivery_date DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert dummy orders
    await queryRunner.query(`
      INSERT INTO orders (customer_id, total_amount, status, notes, pickup_date, delivery_date, created_at, updated_at)
      VALUES 
        (1, 35000, 'completed', 'Cuci rapi', '2023-03-20', '2023-03-22', now(), now()),
        (1, 50000, 'in_progress', 'Setrika halus', '2023-03-25', '2023-03-27', now(), now()),
        (2, 75000, 'pending', 'Gunakan deterjen khusus', '2023-03-26', '2023-03-28', now(), now()),
        (3, 45000, 'completed', 'Laundry kiloan', '2023-03-18', '2023-03-20', now(), now()),
        (4, 60000, 'in_progress', 'Pakaian formal', '2023-03-24', '2023-03-26', now(), now()),
        (5, 30000, 'pending', 'First order', '2023-03-27', '2023-03-29', now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
  }
} 
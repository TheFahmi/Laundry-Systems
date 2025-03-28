import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1711321000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id),
        quantity DECIMAL(10,2) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert dummy order items
    await queryRunner.query(`
      INSERT INTO order_items (order_id, service_id, quantity, price, subtotal, created_at, updated_at)
      VALUES 
        (1, 1, 5, 7000, 35000, now(), now()),
        (2, 2, 5, 10000, 50000, now(), now()),
        (3, 2, 5, 10000, 50000, now(), now()),
        (3, 4, 2.5, 10000, 25000, now(), now()),
        (4, 3, 4.5, 10000, 45000, now(), now()),
        (5, 4, 4, 15000, 60000, now(), now()),
        (6, 5, 2, 15000, 30000, now(), now())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
  }
} 
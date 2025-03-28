import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemsMissingColumns1711800000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if unit_price column exists in order_items
      const unitPriceExists = await queryRunner.hasColumn('order_items', 'unit_price');
      if (!unitPriceExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN "unit_price" DECIMAL(10,2) NOT NULL DEFAULT 0
        `);
        console.log('Added unit_price column to order_items table');
      }

      // Check if total_price column exists in order_items
      const totalPriceExists = await queryRunner.hasColumn('order_items', 'total_price');
      if (!totalPriceExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN "total_price" DECIMAL(10,2) NOT NULL DEFAULT 0
        `);
        console.log('Added total_price column to order_items table');
      }

      // Check if notes column exists in order_items
      const notesExists = await queryRunner.hasColumn('order_items', 'notes');
      if (!notesExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN "notes" VARCHAR(255) NULL
        `);
        console.log('Added notes column to order_items table');
      }

      // Update unit_price and total_price based on existing data
      await queryRunner.query(`
        UPDATE order_items 
        SET 
          unit_price = price,
          total_price = subtotal
        WHERE unit_price = 0 AND total_price = 0
      `);
      console.log('Updated values for unit_price and total_price columns');
    } catch (error) {
      console.error('Error in migration:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // If needed, we can drop the added columns, but it's usually better to keep them
    // for data integrity
  }
} 
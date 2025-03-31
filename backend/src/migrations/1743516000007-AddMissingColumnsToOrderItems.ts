import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToOrderItems1743516000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if notes column exists
      const notesExists = await queryRunner.hasColumn('order_items', 'notes');
      if (!notesExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN "notes" VARCHAR(255) NULL
        `);
        console.log('Added notes column to order_items table');
      }

      // Check if weight_based column exists
      const weightBasedExists = await queryRunner.hasColumn('order_items', 'weight_based');
      if (!weightBasedExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN "weight_based" BOOLEAN DEFAULT false
        `);
        console.log('Added weight_based column to order_items table');
      }

      // Update weight_based values based on weight column
      await queryRunner.query(`
        UPDATE order_items
        SET weight_based = CASE
          WHEN weight IS NOT NULL AND weight > 0 THEN true
          ELSE false
        END
      `);
      console.log('Updated weight_based values based on weight column');

    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Drop notes column if it exists
      const notesExists = await queryRunner.hasColumn('order_items', 'notes');
      if (notesExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          DROP COLUMN "notes"
        `);
        console.log('Dropped notes column from order_items table');
      }

      // Drop weight_based column if it exists
      const weightBasedExists = await queryRunner.hasColumn('order_items', 'weight_based');
      if (weightBasedExists) {
        await queryRunner.query(`
          ALTER TABLE order_items 
          DROP COLUMN "weight_based"
        `);
        console.log('Dropped weight_based column from order_items table');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  }
} 
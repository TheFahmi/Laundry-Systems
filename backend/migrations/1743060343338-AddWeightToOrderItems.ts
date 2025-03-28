import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeightToOrderItems1743060343338 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add weight column to order_items table
        await queryRunner.query(`
            ALTER TABLE order_items
            ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT NULL
        `);
        
        console.log('Added weight column to order_items table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove weight column from order_items table
        await queryRunner.query(`
            ALTER TABLE order_items
            DROP COLUMN IF EXISTS weight
        `);
        
        console.log('Removed weight column from order_items table');
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeliveryNeededToOrders1743724000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to add it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'is_delivery_needed'
        `);
        
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE orders ADD COLUMN "is_delivery_needed" BOOLEAN DEFAULT false`);
            console.log('Added is_delivery_needed column to orders table');
        } else {
            console.log('Column is_delivery_needed already exists in orders table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to drop it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'is_delivery_needed'
        `);
        
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE orders DROP COLUMN "is_delivery_needed"`);
            console.log('Dropped is_delivery_needed column from orders table');
        } else {
            console.log('Column is_delivery_needed does not exist in orders table, skipping...');
        }
    }
} 
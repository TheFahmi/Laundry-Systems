import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeightBasedToOrderItems1742894470000 implements MigrationInterface {
    name = 'AddWeightBasedToOrderItems1742894470000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'order_items'
            )
        `);
        
        if (!tableExists[0].exists) {
            console.log('Order items table does not exist, skipping migration');
            return;
        }
        
        // Check if column exists before trying to add it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' AND column_name = 'weight_based'
        `);
        
        if (columnExists.length === 0) {
            // Add weight_based column to order_items table only if it doesn't exist
            await queryRunner.query(`ALTER TABLE "order_items" ADD "weight_based" boolean NOT NULL DEFAULT false`);
            console.log('Added weight_based column to order_items table');
        } else {
            console.log('Column weight_based already exists in order_items table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if the column exists before trying to drop it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' AND column_name = 'weight_based'
        `);
        
        if (columnExists.length > 0) {
            // Remove weight_based column from order_items table
            await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "weight_based"`);
            console.log('Dropped weight_based column from order_items table');
        } else {
            console.log('Column weight_based does not exist in order_items table, skipping...');
        }
    }
} 
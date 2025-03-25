import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerIdToPayments1742892512106 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the customer_id column already exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'customer_id'
            `);
            
            if (columnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "customer_id" VARCHAR(255) NULL`);
                console.log('Added customer_id column to payments table');

                // Update customer_id to match orders.customer_id for existing payments
                await queryRunner.query(`
                    UPDATE payments p
                    SET customer_id = o.customer_id
                    FROM orders o
                    WHERE p.order_id = o.id
                `);
                console.log('Updated customer_id values for existing payments');
            } else {
                console.log('Column customer_id already exists in payments table, skipping...');
            }
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the customer_id column exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'customer_id'
            `);
            
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments DROP COLUMN "customer_id"`);
                console.log('Dropped customer_id column from payments table');
            } else {
                console.log('Column customer_id does not exist in payments table, skipping...');
            }
        } catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionIdToPayment1742805388034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if the payments table exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'payments'
            )
        `);
        
        if (!tableExists[0].exists) {
            console.log('Payments table does not exist, skipping migration');
            return;
        }
        
        // Check if column exists before trying to add it - use snake_case for the column name
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transaction_id'
        `);
        
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "transaction_id" varchar NULL`);
            console.log('Added transaction_id column to payments table');
        } else {
            console.log('Column transaction_id already exists in payments table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First check if the payments table exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'payments'
            )
        `);
        
        if (!tableExists[0].exists) {
            console.log('Payments table does not exist, skipping down migration');
            return;
        }
        
        // Check if column exists before trying to drop it - use snake_case for the column name
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transaction_id'
        `);
        
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE payments DROP COLUMN "transaction_id"`);
            console.log('Dropped transaction_id column from payments table');
        } else {
            console.log('Column transaction_id does not exist in payments table, skipping...');
        }
    }

}

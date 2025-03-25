import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionIdToPayment1742805388034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to add it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transactionId'
        `);
        
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "transactionId" varchar NULL`);
            console.log('Added transactionId column to payments table');
        } else {
            console.log('Column transactionId already exists in payments table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to drop it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transactionId'
        `);
        
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE payments DROP COLUMN "transactionId"`);
            console.log('Dropped transactionId column from payments table');
        } else {
            console.log('Column transactionId does not exist in payments table, skipping...');
        }
    }

}

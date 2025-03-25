import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentIdToPayment1742805775364 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to add it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'paymentId'
        `);
        
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "paymentId" SERIAL`);
            console.log('Added paymentId column to payments table');
        } else {
            console.log('Column paymentId already exists in payments table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to drop it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'paymentId'
        `);
        
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE payments DROP COLUMN "paymentId"`);
            console.log('Dropped paymentId column from payments table');
        } else {
            console.log('Column paymentId does not exist in payments table, skipping...');
        }
    }
}
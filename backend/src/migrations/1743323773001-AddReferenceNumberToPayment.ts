import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceNumberToPayment1743323773001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to add it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'reference_number'
        `);
        
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "reference_number" VARCHAR(50) UNIQUE`);
            console.log('Added reference_number column to payments table');
        } else {
            console.log('Column reference_number already exists in payments table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to drop it
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'reference_number'
        `);
        
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE payments DROP COLUMN "reference_number"`);
            console.log('Dropped reference_number column from payments table');
        } else {
            console.log('Column reference_number does not exist in payments table, skipping...');
        }
    }
} 
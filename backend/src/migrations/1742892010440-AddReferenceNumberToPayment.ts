import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceNumberToPayment1742892010440 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if column exists before trying to add it
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'referenceNumber'
            `);
            
            if (columnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "referenceNumber" varchar(255) NULL`);
                console.log('Added referenceNumber column to payments table');
            } else {
                console.log('Column referenceNumber already exists in payments table, skipping...');
            }
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if column exists before trying to drop it
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'referenceNumber'
            `);
            
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments DROP COLUMN "referenceNumber"`);
                console.log('Dropped referenceNumber column from payments table');
            } else {
                console.log('Column referenceNumber does not exist in payments table, skipping...');
            }
        } catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}

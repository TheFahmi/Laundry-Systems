import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPaymentIdColumn1742894434504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the paymentId column already exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'paymentId'
            `);
            
            // Check if the payment_id column exists (possible alternative name)
            const alternativeColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'payment_id'
            `);
            
            if (columnExists.length === 0 && alternativeColumnExists.length === 0) {
                // If neither column exists, add the paymentId column
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "paymentId" INTEGER NULL`);
                console.log('Added paymentId column to payments table');
                
                // Generate sequential values for paymentId for existing records
                await queryRunner.query(`
                    WITH numbered_payments AS (
                        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
                        FROM payments
                    )
                    UPDATE payments
                    SET "paymentId" = np.rn
                    FROM numbered_payments np
                    WHERE payments.id = np.id
                `);
                console.log('Generated sequential values for paymentId column');
            } 
            else if (alternativeColumnExists.length > 0 && columnExists.length === 0) {
                // If only payment_id exists, rename it to paymentId
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "payment_id" TO "paymentId"`);
                console.log('Renamed payment_id to paymentId in payments table');
            }
            else {
                console.log('Column paymentId already exists in payments table, skipping...');
            }
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the paymentId column exists
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
        } catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}

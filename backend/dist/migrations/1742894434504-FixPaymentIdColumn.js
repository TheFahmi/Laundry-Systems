"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixPaymentIdColumn1742894434504 = void 0;
class FixPaymentIdColumn1742894434504 {
    async up(queryRunner) {
        try {
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'paymentId'
            `);
            const alternativeColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'payment_id'
            `);
            if (columnExists.length === 0 && alternativeColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "paymentId" INTEGER NULL`);
                console.log('Added paymentId column to payments table');
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
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "payment_id" TO "paymentId"`);
                console.log('Renamed payment_id to paymentId in payments table');
            }
            else {
                console.log('Column paymentId already exists in payments table, skipping...');
            }
        }
        catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }
    async down(queryRunner) {
        try {
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'paymentId'
            `);
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments DROP COLUMN "paymentId"`);
                console.log('Dropped paymentId column from payments table');
            }
            else {
                console.log('Column paymentId does not exist in payments table, skipping...');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.FixPaymentIdColumn1742894434504 = FixPaymentIdColumn1742894434504;
//# sourceMappingURL=1742894434504-FixPaymentIdColumn.js.map
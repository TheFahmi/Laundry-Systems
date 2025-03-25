"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddReferenceNumberToPayment1742892010440 = void 0;
class AddReferenceNumberToPayment1742892010440 {
    async up(queryRunner) {
        try {
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'referenceNumber'
            `);
            if (columnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "referenceNumber" varchar(255) NULL`);
                console.log('Added referenceNumber column to payments table');
            }
            else {
                console.log('Column referenceNumber already exists in payments table, skipping...');
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
                WHERE table_name = 'payments' AND column_name = 'referenceNumber'
            `);
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments DROP COLUMN "referenceNumber"`);
                console.log('Dropped referenceNumber column from payments table');
            }
            else {
                console.log('Column referenceNumber does not exist in payments table, skipping...');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.AddReferenceNumberToPayment1742892010440 = AddReferenceNumberToPayment1742892010440;
//# sourceMappingURL=1742892010440-AddReferenceNumberToPayment.js.map
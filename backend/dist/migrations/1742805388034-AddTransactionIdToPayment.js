"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTransactionIdToPayment1742805388034 = void 0;
class AddTransactionIdToPayment1742805388034 {
    async up(queryRunner) {
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transactionId'
        `);
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "transactionId" varchar NULL`);
            console.log('Added transactionId column to payments table');
        }
        else {
            console.log('Column transactionId already exists in payments table, skipping...');
        }
    }
    async down(queryRunner) {
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'transactionId'
        `);
        if (columnExists.length > 0) {
            await queryRunner.query(`ALTER TABLE payments DROP COLUMN "transactionId"`);
            console.log('Dropped transactionId column from payments table');
        }
        else {
            console.log('Column transactionId does not exist in payments table, skipping...');
        }
    }
}
exports.AddTransactionIdToPayment1742805388034 = AddTransactionIdToPayment1742805388034;
//# sourceMappingURL=1742805388034-AddTransactionIdToPayment.js.map
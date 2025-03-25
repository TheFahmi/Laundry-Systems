"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPaymentIdToPayment1742805775364 = void 0;
class AddPaymentIdToPayment1742805775364 {
    async up(queryRunner) {
        const columnExists = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'paymentId'
        `);
        if (columnExists.length === 0) {
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN "paymentId" SERIAL`);
            console.log('Added paymentId column to payments table');
        }
        else {
            console.log('Column paymentId already exists in payments table, skipping...');
        }
    }
    async down(queryRunner) {
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
}
exports.AddPaymentIdToPayment1742805775364 = AddPaymentIdToPayment1742805775364;
//# sourceMappingURL=1742805775364-AddPaymentIdToPayment.js.map
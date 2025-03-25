"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomerIdToPayments1742892512106 = void 0;
class AddCustomerIdToPayments1742892512106 {
    async up(queryRunner) {
        try {
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'customer_id'
            `);
            if (columnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "customer_id" VARCHAR(255) NULL`);
                console.log('Added customer_id column to payments table');
                await queryRunner.query(`
                    UPDATE payments p
                    SET customer_id = o.customer_id
                    FROM orders o
                    WHERE p.order_id = o.id
                `);
                console.log('Updated customer_id values for existing payments');
            }
            else {
                console.log('Column customer_id already exists in payments table, skipping...');
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
                WHERE table_name = 'payments' AND column_name = 'customer_id'
            `);
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments DROP COLUMN "customer_id"`);
                console.log('Dropped customer_id column from payments table');
            }
            else {
                console.log('Column customer_id does not exist in payments table, skipping...');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.AddCustomerIdToPayments1742892512106 = AddCustomerIdToPayments1742892512106;
//# sourceMappingURL=1742892512106-AddCustomerIdToPayments.js.map
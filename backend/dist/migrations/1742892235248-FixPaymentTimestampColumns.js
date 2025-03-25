"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixPaymentTimestampColumns1742892235248 = void 0;
class FixPaymentTimestampColumns1742892235248 {
    async up(queryRunner) {
        try {
            const createdAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'created_at'
            `);
            const createdAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'createdAt'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'updated_at'
            `);
            const updatedAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'updatedAt'
            `);
            if (createdAtExists.length === 0 && createdAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added created_at column to payments table');
            }
            else if (createdAtExists.length === 0 && createdAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "createdAt" TO "created_at"`);
                console.log('Renamed createdAt to created_at in payments table');
            }
            else {
                console.log('Column created_at already exists in payments table, skipping...');
            }
            if (updatedAtExists.length === 0 && updatedAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added updated_at column to payments table');
            }
            else if (updatedAtExists.length === 0 && updatedAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "updatedAt" TO "updated_at"`);
                console.log('Renamed updatedAt to updated_at in payments table');
            }
            else {
                console.log('Column updated_at already exists in payments table, skipping...');
            }
        }
        catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }
    async down(queryRunner) {
        try {
            const createdAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'created_at'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'updated_at'
            `);
            if (createdAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "created_at" TO "createdAt"`);
                console.log('Reverted created_at to createdAt in payments table');
            }
            if (updatedAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "updated_at" TO "updatedAt"`);
                console.log('Reverted updated_at to updatedAt in payments table');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.FixPaymentTimestampColumns1742892235248 = FixPaymentTimestampColumns1742892235248;
//# sourceMappingURL=1742892235248-FixPaymentTimestampColumns.js.map
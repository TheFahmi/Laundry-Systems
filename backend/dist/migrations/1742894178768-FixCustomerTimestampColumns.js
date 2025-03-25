"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixCustomerTimestampColumns1742894178768 = void 0;
class FixCustomerTimestampColumns1742894178768 {
    async up(queryRunner) {
        try {
            const createdAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'created_at'
            `);
            const createdAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'createdAt'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'updated_at'
            `);
            const updatedAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'updatedAt'
            `);
            if (createdAtExists.length === 0 && createdAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE customers ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added created_at column to customers table');
            }
            else if (createdAtExists.length === 0 && createdAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE customers RENAME COLUMN "createdAt" TO "created_at"`);
                console.log('Renamed createdAt to created_at in customers table');
            }
            else {
                console.log('Column created_at already exists in customers table, skipping...');
            }
            if (updatedAtExists.length === 0 && updatedAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE customers ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added updated_at column to customers table');
            }
            else if (updatedAtExists.length === 0 && updatedAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE customers RENAME COLUMN "updatedAt" TO "updated_at"`);
                console.log('Renamed updatedAt to updated_at in customers table');
            }
            else {
                console.log('Column updated_at already exists in customers table, skipping...');
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
                WHERE table_name = 'customers' AND column_name = 'created_at'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'updated_at'
            `);
            if (createdAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE customers RENAME COLUMN "created_at" TO "createdAt"`);
                console.log('Reverted created_at to createdAt in customers table');
            }
            if (updatedAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE customers RENAME COLUMN "updated_at" TO "updatedAt"`);
                console.log('Reverted updated_at to updatedAt in customers table');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.FixCustomerTimestampColumns1742894178768 = FixCustomerTimestampColumns1742894178768;
//# sourceMappingURL=1742894178768-FixCustomerTimestampColumns.js.map
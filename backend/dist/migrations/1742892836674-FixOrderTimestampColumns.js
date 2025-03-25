"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixOrderTimestampColumns1742892836674 = void 0;
class FixOrderTimestampColumns1742892836674 {
    async up(queryRunner) {
        try {
            const createdAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'created_at'
            `);
            const createdAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'createdAt'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'updated_at'
            `);
            const updatedAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'updatedAt'
            `);
            if (createdAtExists.length === 0 && createdAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE orders ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added created_at column to orders table');
            }
            else if (createdAtExists.length === 0 && createdAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE orders RENAME COLUMN "createdAt" TO "created_at"`);
                console.log('Renamed createdAt to created_at in orders table');
            }
            else {
                console.log('Column created_at already exists in orders table, skipping...');
            }
            if (updatedAtExists.length === 0 && updatedAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE orders ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added updated_at column to orders table');
            }
            else if (updatedAtExists.length === 0 && updatedAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE orders RENAME COLUMN "updatedAt" TO "updated_at"`);
                console.log('Renamed updatedAt to updated_at in orders table');
            }
            else {
                console.log('Column updated_at already exists in orders table, skipping...');
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
                WHERE table_name = 'orders' AND column_name = 'created_at'
            `);
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'updated_at'
            `);
            if (createdAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE orders RENAME COLUMN "created_at" TO "createdAt"`);
                console.log('Reverted created_at to createdAt in orders table');
            }
            if (updatedAtExists.length > 0) {
                await queryRunner.query(`ALTER TABLE orders RENAME COLUMN "updated_at" TO "updatedAt"`);
                console.log('Reverted updated_at to updatedAt in orders table');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.FixOrderTimestampColumns1742892836674 = FixOrderTimestampColumns1742892836674;
//# sourceMappingURL=1742892836674-FixOrderTimestampColumns.js.map
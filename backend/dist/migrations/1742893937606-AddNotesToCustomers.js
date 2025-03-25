"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotesToCustomers1742893937606 = void 0;
class AddNotesToCustomers1742893937606 {
    async up(queryRunner) {
        try {
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'notes'
            `);
            if (columnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE customers ADD COLUMN "notes" TEXT NULL`);
                console.log('Added notes column to customers table');
            }
            else {
                console.log('Column notes already exists in customers table, skipping...');
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
                WHERE table_name = 'customers' AND column_name = 'notes'
            `);
            if (columnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE customers DROP COLUMN "notes"`);
                console.log('Dropped notes column from customers table');
            }
            else {
                console.log('Column notes does not exist in customers table, skipping...');
            }
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.AddNotesToCustomers1742893937606 = AddNotesToCustomers1742893937606;
//# sourceMappingURL=1742893937606-AddNotesToCustomers.js.map
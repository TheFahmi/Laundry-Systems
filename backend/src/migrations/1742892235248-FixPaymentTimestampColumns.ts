import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPaymentTimestampColumns1742892235248 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if `created_at` column exists
            const createdAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'created_at'
            `);
            
            // Check if `createdAt` column exists
            const createdAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'createdAt'
            `);
            
            // Check if `updated_at` column exists
            const updatedAtExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'updated_at'
            `);
            
            // Check if `updatedAt` column exists
            const updatedAtColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'payments' AND column_name = 'updatedAt'
            `);
            
            // If neither column exists, add `created_at` column
            if (createdAtExists.length === 0 && createdAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added created_at column to payments table');
            } 
            // If only createdAt exists, rename it to created_at
            else if (createdAtExists.length === 0 && createdAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "createdAt" TO "created_at"`);
                console.log('Renamed createdAt to created_at in payments table');
            }
            // If only created_at exists, do nothing
            else {
                console.log('Column created_at already exists in payments table, skipping...');
            }
            
            // If neither column exists, add `updated_at` column
            if (updatedAtExists.length === 0 && updatedAtColumnExists.length === 0) {
                await queryRunner.query(`ALTER TABLE payments ADD COLUMN "updated_at" TIMESTAMP DEFAULT NOW()`);
                console.log('Added updated_at column to payments table');
            } 
            // If only updatedAt exists, rename it to updated_at
            else if (updatedAtExists.length === 0 && updatedAtColumnExists.length > 0) {
                await queryRunner.query(`ALTER TABLE payments RENAME COLUMN "updatedAt" TO "updated_at"`);
                console.log('Renamed updatedAt to updated_at in payments table');
            }
            // If only updated_at exists, do nothing
            else {
                console.log('Column updated_at already exists in payments table, skipping...');
            }
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // This would revert the changes if needed
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
        } catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}

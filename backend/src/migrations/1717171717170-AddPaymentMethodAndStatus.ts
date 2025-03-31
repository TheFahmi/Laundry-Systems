import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentMethodAndStatus1717171717170 implements MigrationInterface {
    name = 'AddPaymentMethodAndStatus1717171717170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if payments table exists
        const tablesExist = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'payments'
            )
        `);
        
        const paymentsTableExists = tablesExist[0].exists;
        
        if (!paymentsTableExists) {
            console.log('Payments table does not exist, skipping migration');
            return;
        }
        
        // Get table columns if table exists
        const tableColumns = await queryRunner.getTable("payments");
        
        if (tableColumns && !tableColumns.findColumnByName("payment_method")) {
            // Create enum type for payment methods if it doesn't exist
            await queryRunner.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
                        CREATE TYPE payment_method_enum AS ENUM ('cash', 'credit_card', 'bank_transfer', 'ewallet', 'other');
                    END IF;
                END
                $$;
            `);
            
            // Add payment_method column
            await queryRunner.query(`
                ALTER TABLE "payments" 
                ADD COLUMN "payment_method" payment_method_enum NOT NULL DEFAULT 'cash'
            `);
        }
        
        if (tableColumns && !tableColumns.findColumnByName("payment_status")) {
            // Create enum type for payment status if it doesn't exist
            await queryRunner.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
                        CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
                    END IF;
                END
                $$;
            `);
            
            // Add payment_status column
            await queryRunner.query(`
                ALTER TABLE "payments" 
                ADD COLUMN "payment_status" payment_status_enum NOT NULL DEFAULT 'pending'
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if payments table exists
        const tablesExist = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'payments'
            )
        `);
        
        const paymentsTableExists = tablesExist[0].exists;
        
        if (!paymentsTableExists) {
            console.log('Payments table does not exist, skipping down migration');
            return;
        }
        
        // Drop columns if they exist
        const tableColumns = await queryRunner.getTable("payments");
        
        if (tableColumns && tableColumns.findColumnByName("payment_method")) {
            await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        }
        
        if (tableColumns && tableColumns.findColumnByName("payment_status")) {
            await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_status"`);
        }
        
        // Try to drop enum types
        await queryRunner.query(`
            DO $$
            BEGIN
                DROP TYPE IF EXISTS payment_method_enum;
                DROP TYPE IF EXISTS payment_status_enum;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END
            $$;
        `);
    }
} 
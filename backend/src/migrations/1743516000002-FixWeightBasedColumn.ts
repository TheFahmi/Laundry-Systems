import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWeightBasedColumn1743516000002 implements MigrationInterface {
    name = 'FixWeightBasedColumn1743516000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the order_items table exists
            const tableExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'order_items'
                )
            `);

            if (!tableExists[0].exists) {
                console.log('order_items table does not exist, skipping migration');
                return;
            }

            // Check if weight_based column exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public'
                AND table_name = 'order_items' 
                AND column_name = 'weight_based'
            `);

            if (columnExists.length === 0) {
                // Add weight_based column if it doesn't exist
                await queryRunner.query(`
                    ALTER TABLE "order_items" 
                    ADD COLUMN "weight_based" boolean NOT NULL DEFAULT false
                `);
                console.log('Added weight_based column to order_items table');
            } else {
                console.log('weight_based column already exists in order_items table');
            }

            // Check if weight column exists
            const weightColumnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public'
                AND table_name = 'order_items' 
                AND column_name = 'weight'
            `);

            if (weightColumnExists.length === 0) {
                // Add weight column if it doesn't exist
                await queryRunner.query(`
                    ALTER TABLE "order_items" 
                    ADD COLUMN "weight" DECIMAL(10,2) DEFAULT NULL
                `);
                console.log('Added weight column to order_items table');
            } else {
                console.log('weight column already exists in order_items table');
            }

            // Update weight_based based on weight values
            await queryRunner.query(`
                UPDATE "order_items"
                SET "weight_based" = CASE
                    WHEN "weight" IS NOT NULL AND "weight" > 0 THEN true
                    ELSE false
                END
            `);
            console.log('Updated weight_based values based on weight column');

        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the columns exist before trying to drop them
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public'
                AND table_name = 'order_items' 
                AND column_name IN ('weight_based', 'weight')
            `);

            const columns = columnExists.map(col => col.column_name);

            if (columns.includes('weight_based')) {
                await queryRunner.query(`
                    ALTER TABLE "order_items" 
                    DROP COLUMN "weight_based"
                `);
                console.log('Dropped weight_based column from order_items table');
            }

            if (columns.includes('weight')) {
                await queryRunner.query(`
                    ALTER TABLE "order_items" 
                    DROP COLUMN "weight"
                `);
                console.log('Dropped weight column from order_items table');
            }
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 
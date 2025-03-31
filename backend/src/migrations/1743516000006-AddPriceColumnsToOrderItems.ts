import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPriceColumnsToOrderItems1743516000006 implements MigrationInterface {
    name = 'AddPriceColumnsToOrderItems1743516000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            console.log('Adding price columns to order_items table...');
            
            // Check if the table exists
            const table = await queryRunner.getTable('order_items');
            
            // Add price column if it doesn't exist
            const priceColumn = table.findColumnByName('price');
            if (!priceColumn) {
                await queryRunner.addColumn('order_items', new TableColumn({
                    name: 'price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0
                }));
            }

            // Add subtotal column if it doesn't exist
            const subtotalColumn = table.findColumnByName('subtotal');
            if (!subtotalColumn) {
                await queryRunner.addColumn('order_items', new TableColumn({
                    name: 'subtotal',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0
                }));
            }

            // Add unit_price column if it doesn't exist
            const unitPriceColumn = table.findColumnByName('unit_price');
            if (!unitPriceColumn) {
                await queryRunner.addColumn('order_items', new TableColumn({
                    name: 'unit_price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0
                }));
            }

            // Add total_price column if it doesn't exist
            const totalPriceColumn = table.findColumnByName('total_price');
            if (!totalPriceColumn) {
                await queryRunner.addColumn('order_items', new TableColumn({
                    name: 'total_price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0
                }));
            }

            // Update existing records with service prices
            await queryRunner.query(`
                UPDATE order_items oi
                SET price = s.price,
                    unit_price = s.price,
                    total_price = CASE
                        WHEN oi.weight IS NOT NULL AND oi.weight > 0 THEN oi.weight * s.price
                        ELSE oi.quantity * s.price
                    END,
                    subtotal = CASE
                        WHEN oi.weight IS NOT NULL AND oi.weight > 0 THEN oi.weight * s.price
                        ELSE oi.quantity * s.price
                    END
                FROM services s
                WHERE oi.service_id = s.id
            `);

            console.log('Price columns added successfully.');
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Drop columns in reverse order
            const table = await queryRunner.getTable('order_items');
            
            const totalPriceColumn = table.findColumnByName('total_price');
            if (totalPriceColumn) {
                await queryRunner.dropColumn('order_items', 'total_price');
            }

            const unitPriceColumn = table.findColumnByName('unit_price');
            if (unitPriceColumn) {
                await queryRunner.dropColumn('order_items', 'unit_price');
            }

            const subtotalColumn = table.findColumnByName('subtotal');
            if (subtotalColumn) {
                await queryRunner.dropColumn('order_items', 'subtotal');
            }

            const priceColumn = table.findColumnByName('price');
            if (priceColumn) {
                await queryRunner.dropColumn('order_items', 'price');
            }
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 
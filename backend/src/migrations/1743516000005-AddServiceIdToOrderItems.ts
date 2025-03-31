import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddServiceIdToOrderItems1743516000005 implements MigrationInterface {
    name = 'AddServiceIdToOrderItems1743516000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            console.log('Adding service_id column to order_items table...');
            
            // Check if the column already exists
            const table = await queryRunner.getTable('order_items');
            const serviceIdColumn = table.findColumnByName('service_id');
            
            if (!serviceIdColumn) {
                // Add service_id column
                await queryRunner.addColumn('order_items', new TableColumn({
                    name: 'service_id',
                    type: 'uuid',
                    isNullable: true // Changed to true to avoid issues with existing records
                }));

                // Add service_name column if it doesn't exist
                const serviceNameColumn = table.findColumnByName('service_name');
                if (!serviceNameColumn) {
                    await queryRunner.addColumn('order_items', new TableColumn({
                        name: 'service_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: true // Changed to true to avoid issues with existing records
                    }));
                }

                // Add foreign key constraint
                const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('service_id') !== -1);
                if (!foreignKey) {
                    await queryRunner.createForeignKey('order_items', new TableForeignKey({
                        name: 'FK_order_items_service',
                        columnNames: ['service_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'services',
                        onDelete: 'SET NULL',
                        onUpdate: 'CASCADE'
                    }));
                }

                // Update existing records with default service
                await queryRunner.query(`
                    UPDATE order_items 
                    SET service_id = (
                        SELECT id FROM services WHERE name = 'Regular Wash & Fold' LIMIT 1
                    ),
                    service_name = 'Regular Wash & Fold'
                    WHERE service_id IS NULL
                `);

                // Now make service_id not nullable
                await queryRunner.changeColumn('order_items', 'service_id', new TableColumn({
                    name: 'service_id',
                    type: 'uuid',
                    isNullable: false
                }));

                console.log('Service_id column added successfully.');
            } else {
                console.log('Service_id column already exists.');
            }
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Drop foreign key first
            const table = await queryRunner.getTable('order_items');
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('service_id') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('order_items', foreignKey);
            }
            
            // Drop columns
            const serviceIdColumn = table.findColumnByName('service_id');
            if (serviceIdColumn) {
                await queryRunner.dropColumn('order_items', 'service_id');
            }

            const serviceNameColumn = table.findColumnByName('service_name');
            if (serviceNameColumn) {
                await queryRunner.dropColumn('order_items', 'service_name');
            }
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 
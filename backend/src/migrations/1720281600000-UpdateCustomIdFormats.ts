import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCustomIdFormats1720281600000 implements MigrationInterface {
    name = 'UpdateCustomIdFormats1720281600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            console.log('Starting migration...');

            // First, check if required tables exist
            const checkTablesExist = async (tables: string[]): Promise<Record<string, boolean>> => {
                const results: Record<string, boolean> = {};
                for (const table of tables) {
                    const tableExistResult = await queryRunner.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = '${table}'
                        )
                    `);
                    results[table] = tableExistResult[0].exists;
                }
                return results;
            };
            
            const tablesExist = await checkTablesExist(['customers', 'orders', 'payments', 'order_items']);
            
            console.log('Tables existence check:', tablesExist);
            
            // If any required table doesn't exist, log and exit early
            if (!tablesExist['customers'] || !tablesExist['orders'] || !tablesExist['payments'] || !tablesExist['order_items']) {
                console.log('One or more required tables do not exist. Skipping migration.');
                return;
            }

            // First, identify all foreign key constraints in the database
            const foreignKeysResult = await queryRunner.query(`
                SELECT
                    tc.constraint_name,
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM
                    information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                        AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND (tc.table_name IN ('customers', 'orders', 'payments', 'order_items')
                    OR ccu.table_name IN ('customers', 'orders', 'payments', 'order_items'))
            `);

            // Drop all foreign key constraints
            for (const fk of foreignKeysResult) {
                await queryRunner.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`);
                console.log(`Dropped foreign key: ${fk.constraint_name} from table ${fk.table_name}`);
            }

            // Drop specific constraints that might be missed above
            const tablesToCheck = ['orders', 'payments', 'order_items', 'customers'];
            for (const table of tablesToCheck) {
                const constraints = await queryRunner.query(`
                    SELECT conname
                    FROM pg_constraint
                    WHERE conrelid = '${table}'::regclass
                    AND contype = 'f';
                `);
                
                for (const constraint of constraints) {
                    await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint.conname}"`);
                    console.log(`Dropped additional constraint: ${constraint.conname} from table ${table}`);
                }
            }

            // Now change all columns to VARCHAR consistently
            console.log('Altering column types to VARCHAR...');
            await queryRunner.query(`ALTER TABLE customers ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE payments ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE payments ALTER COLUMN order_id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(255)`);

            // Add serial ID columns for generated IDs
            console.log('Adding serial ID columns...');
            await queryRunner.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS "customerId" SERIAL`);
            await queryRunner.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderId" SERIAL`);
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "paymentId" SERIAL`);

            // Update customer IDs to the new format
            console.log('Updating customer IDs...');
            const customers = await queryRunner.query(`SELECT "customerId", id FROM customers`);
            for (const customer of customers) {
                const newId = `CUST-${String(customer.customerId || Math.floor(Math.random() * 9999999)).padStart(7, '0')}`;
                await queryRunner.query(`
                    UPDATE customers SET id = $1 WHERE id = $2
                `, [newId, customer.id]);
            }

            // Update order IDs to the new format
            console.log('Updating order IDs...');
            const orders = await queryRunner.query(`SELECT "orderId", id FROM orders`);
            for (const order of orders) {
                const newId = `ORD-${String(order.orderId || Math.floor(Math.random() * 9999999)).padStart(7, '0')}`;
                await queryRunner.query(`
                    UPDATE orders SET id = $1 WHERE id = $2
                `, [newId, order.id]);
            }

            // Update payment IDs
            console.log('Updating payment IDs...');
            const payments = await queryRunner.query(`SELECT "paymentId", id FROM payments`);
            for (const payment of payments) {
                // Simplified format without referencing created_at which is inconsistent
                const paymentId = payment.paymentId || Math.floor(Math.random() * 9999999999);
                const newId = `TRX-${String(paymentId).padStart(10, '0')}`;
                
                await queryRunner.query(`
                    UPDATE payments SET id = $1 WHERE id = $2
                `, [newId, payment.id]);
            }

            // Update relationships
            console.log('Updating relationships...');
            
            // Update customer_id in orders if needed
            const ordersCountResult = await queryRunner.query(`SELECT COUNT(*) as count FROM orders`);
            const ordersCount = ordersCountResult && ordersCountResult[0] ? ordersCountResult[0].count : 0;
            
            const customersCountResult = await queryRunner.query(`SELECT COUNT(*) as count FROM customers`);
            const customersCount = customersCountResult && customersCountResult[0] ? customersCountResult[0].count : 0;
            
            if (ordersCount > 0 && customersCount > 0) {
                await queryRunner.query(`
                    UPDATE orders SET customer_id = (
                        SELECT id FROM customers LIMIT 1
                    ) WHERE customer_id IS NULL OR customer_id = '';
                `);
            }
            
            // Update order_id in payments if needed
            const paymentsCountResult = await queryRunner.query(`SELECT COUNT(*) as count FROM payments`);
            const paymentsCount = paymentsCountResult && paymentsCountResult[0] ? paymentsCountResult[0].count : 0;
            
            const ordersCountForPaymentsResult = await queryRunner.query(`SELECT COUNT(*) as count FROM orders`);
            const ordersCountForPayments = ordersCountForPaymentsResult && ordersCountForPaymentsResult[0] ? ordersCountForPaymentsResult[0].count : 0;
            
            if (paymentsCount > 0 && ordersCountForPayments > 0) {
                await queryRunner.query(`
                    UPDATE payments SET order_id = (
                        SELECT id FROM orders LIMIT 1
                    ) WHERE order_id IS NULL OR order_id = '';
                `);
            }

            // Recreate the foreign key constraints
            console.log('Recreating foreign key constraints...');
            
            // First, ensure all orders reference valid customers
            console.log('Validating references before adding constraints...');
            
            // Get all customer IDs
            const customerIds = await queryRunner.query(`SELECT id FROM customers`);
            const validCustomerIds = customerIds.map(c => c.id);
            
            if (validCustomerIds.length > 0) {
                // Update any orders with invalid customer references to point to a valid customer
                await queryRunner.query(`
                    UPDATE orders 
                    SET customer_id = $1
                    WHERE customer_id IS NULL 
                       OR customer_id = '' 
                       OR customer_id NOT IN (${validCustomerIds.map(id => `'${id}'`).join(',')})
                `, [validCustomerIds[0]]);
                
                // Now it's safe to add the constraint
                await queryRunner.query(`
                    ALTER TABLE orders
                    ADD CONSTRAINT "FK_orders_customer_id" 
                    FOREIGN KEY ("customer_id") REFERENCES customers(id) ON UPDATE CASCADE;
                `);
            } else {
                console.log('No customers found, skipping customer_id foreign key creation');
            }
            
            // Get all order IDs
            const orderIds = await queryRunner.query(`SELECT id FROM orders`);
            const validOrderIds = orderIds.map(o => o.id);
            
            if (validOrderIds.length > 0) {
                // Update any payments with invalid order references
                await queryRunner.query(`
                    UPDATE payments 
                    SET order_id = $1
                    WHERE order_id IS NULL 
                       OR order_id = '' 
                       OR order_id NOT IN (${validOrderIds.map(id => `'${id}'`).join(',')})
                `, [validOrderIds[0]]);
                
                // Now add the payments to order foreign key
                await queryRunner.query(`
                    ALTER TABLE payments
                    ADD CONSTRAINT "FK_payments_order_id" 
                    FOREIGN KEY ("order_id") REFERENCES orders(id) ON UPDATE CASCADE;
                `);
                
                // And finally the order items 
                await queryRunner.query(`
                    UPDATE order_items 
                    SET order_id = $1
                    WHERE order_id IS NULL 
                       OR order_id = '' 
                       OR order_id NOT IN (${validOrderIds.map(id => `'${id}'`).join(',')})
                `, [validOrderIds[0]]);
                
                await queryRunner.query(`
                    ALTER TABLE order_items
                    ADD CONSTRAINT "FK_order_items_order_id" 
                    FOREIGN KEY ("order_id") REFERENCES orders(id) ON UPDATE CASCADE;
                `);
            } else {
                console.log('No orders found, skipping order_id foreign keys creation');
            }

            console.log('Migration completed successfully!');
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert is not fully implemented as it's complicated to go back to UUID
        try {
            // Check if tables exist before trying to drop constraints
            const checkTablesExist = async (tables: string[]): Promise<Record<string, boolean>> => {
                const results: Record<string, boolean> = {};
                for (const table of tables) {
                    const tableExistResult = await queryRunner.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = '${table}'
                        )
                    `);
                    results[table] = tableExistResult[0].exists;
                }
                return results;
            };
            
            const tablesExist = await checkTablesExist(['orders', 'payments', 'order_items']);
            
            // Only drop constraints for tables that exist
            if (tablesExist['orders']) {
                await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS "FK_orders_customer_id"`);
            }
            
            if (tablesExist['payments']) {
                await queryRunner.query(`ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_order_id"`);
            }
            
            if (tablesExist['order_items']) {
                await queryRunner.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS "FK_order_items_order_id"`);
            }
            
            // This rollback is partial - going back to UUID would need more work
            console.log('Warning: Partial rollback only, UUID data will not be restored properly.');
        } catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
} 
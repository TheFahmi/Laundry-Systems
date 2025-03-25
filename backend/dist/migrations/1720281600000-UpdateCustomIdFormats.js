"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomIdFormats1720281600000 = void 0;
class UpdateCustomIdFormats1720281600000 {
    constructor() {
        this.name = 'UpdateCustomIdFormats1720281600000';
    }
    async up(queryRunner) {
        try {
            console.log('Starting migration...');
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
            for (const fk of foreignKeysResult) {
                await queryRunner.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`);
                console.log(`Dropped foreign key: ${fk.constraint_name} from table ${fk.table_name}`);
            }
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
            console.log('Altering column types to VARCHAR...');
            await queryRunner.query(`ALTER TABLE customers ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE payments ALTER COLUMN id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE payments ALTER COLUMN order_id TYPE VARCHAR(255)`);
            await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(255)`);
            console.log('Adding serial ID columns...');
            await queryRunner.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS "customerId" SERIAL`);
            await queryRunner.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderId" SERIAL`);
            await queryRunner.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "paymentId" SERIAL`);
            console.log('Updating customer IDs...');
            const customers = await queryRunner.query(`SELECT "customerId", id FROM customers`);
            for (const customer of customers) {
                const newId = `CUST-${String(customer.customerId || Math.floor(Math.random() * 9999999)).padStart(7, '0')}`;
                await queryRunner.query(`
                    UPDATE customers SET id = $1 WHERE id = $2
                `, [newId, customer.id]);
            }
            console.log('Updating order IDs...');
            const orders = await queryRunner.query(`SELECT "orderId", id FROM orders`);
            for (const order of orders) {
                const newId = `ORD-${String(order.orderId || Math.floor(Math.random() * 9999999)).padStart(7, '0')}`;
                await queryRunner.query(`
                    UPDATE orders SET id = $1 WHERE id = $2
                `, [newId, order.id]);
            }
            console.log('Updating payment IDs...');
            const payments = await queryRunner.query(`SELECT "paymentId", id FROM payments`);
            for (const payment of payments) {
                const paymentId = payment.paymentId || Math.floor(Math.random() * 9999999999);
                const newId = `TRX-${String(paymentId).padStart(10, '0')}`;
                await queryRunner.query(`
                    UPDATE payments SET id = $1 WHERE id = $2
                `, [newId, payment.id]);
            }
            console.log('Updating relationships...');
            const ordersCount = await queryRunner.query(`SELECT COUNT(*) as count FROM orders`);
            if (ordersCount[0].count > 0 && await queryRunner.query(`SELECT COUNT(*) as count FROM customers`)[0].count > 0) {
                await queryRunner.query(`
                    UPDATE orders SET customer_id = (
                        SELECT id FROM customers LIMIT 1
                    ) WHERE customer_id IS NULL OR customer_id = '';
                `);
            }
            const paymentsCount = await queryRunner.query(`SELECT COUNT(*) as count FROM payments`);
            if (paymentsCount[0].count > 0 && await queryRunner.query(`SELECT COUNT(*) as count FROM orders`)[0].count > 0) {
                await queryRunner.query(`
                    UPDATE payments SET order_id = (
                        SELECT id FROM orders LIMIT 1
                    ) WHERE order_id IS NULL OR order_id = '';
                `);
            }
            console.log('Recreating foreign key constraints...');
            await queryRunner.query(`
                ALTER TABLE orders
                ADD CONSTRAINT "FK_orders_customer_id" 
                FOREIGN KEY ("customer_id") REFERENCES customers(id);
            `);
            await queryRunner.query(`
                ALTER TABLE payments
                ADD CONSTRAINT "FK_payments_order_id" 
                FOREIGN KEY ("order_id") REFERENCES orders(id);
            `);
            await queryRunner.query(`
                ALTER TABLE order_items
                ADD CONSTRAINT "FK_order_items_order_id" 
                FOREIGN KEY ("order_id") REFERENCES orders(id);
            `);
            console.log('Migration completed successfully!');
        }
        catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }
    async down(queryRunner) {
        try {
            await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS "FK_orders_customer_id"`);
            await queryRunner.query(`ALTER TABLE payments DROP CONSTRAINT IF EXISTS "FK_payments_order_id"`);
            await queryRunner.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS "FK_order_items_order_id"`);
            console.log('Warning: Partial rollback only, UUID data will not be restored properly.');
        }
        catch (error) {
            console.error('Rollback error:', error);
            throw error;
        }
    }
}
exports.UpdateCustomIdFormats1720281600000 = UpdateCustomIdFormats1720281600000;
//# sourceMappingURL=1720281600000-UpdateCustomIdFormats.js.map
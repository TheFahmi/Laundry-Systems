"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsolidateFixScripts1711600000000 = void 0;
class ConsolidateFixScripts1711600000000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await this.fixServiceColumns(queryRunner);
        await this.fixPaymentEnums(queryRunner);
        await this.fixOrderColumns(queryRunner);
        await this.fixEmptyPrices(queryRunner);
        await this.fixOrderItems(queryRunner);
        await this.fixOrderNumbers(queryRunner);
        await this.fixOrderTotals(queryRunner);
        await this.fixPaymentDisplay(queryRunner);
        await this.fixPaymentIDs(queryRunner);
        await this.fixReferenceNumbers(queryRunner);
        await this.fixRelations(queryRunner);
        await this.fixRemainingOrderColumns(queryRunner);
        await this.fixServiceCategory(queryRunner);
        await this.fixTotalAmounts(queryRunner);
        await this.fixTotalWeights(queryRunner);
        await this.fixTransactions(queryRunner);
    }
    async down(queryRunner) {
        console.log('No down migration provided for data fixes');
    }
    async fixServiceColumns(queryRunner) {
        const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
        if (!unitColumnExists) {
            await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "unit" VARCHAR(50) DEFAULT 'kg' NOT NULL
      `);
            console.log('Added "unit" column to services table');
        }
        const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
        if (!estimatedTimeColumnExists) {
            const columnCheck = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
        AND column_name ILIKE 'estimatedtime'
      `);
            if (columnCheck.length === 0) {
                await queryRunner.query(`
          ALTER TABLE services 
          ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
        `);
                console.log('Added "estimatedTime" column to services table');
            }
            else {
                console.log(`Column "${columnCheck[0].column_name}" already exists, skipping`);
            }
        }
        const isActiveColumnExists = await queryRunner.hasColumn('services', 'is_active');
        if (!isActiveColumnExists) {
            await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "is_active" BOOLEAN DEFAULT TRUE NOT NULL
      `);
            console.log('Added "is_active" column to services table');
        }
    }
    async fixPaymentEnums(queryRunner) {
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentmethod') THEN
          CREATE TYPE paymentmethod AS ENUM ('cash', 'credit_card', 'debit_card', 'transfer', 'ewallet', 'other');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
          CREATE TYPE paymentstatus AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orderstatus') THEN
          CREATE TYPE orderstatus AS ENUM ('new', 'processing', 'washing', 'drying', 'folding', 'ready', 'delivered', 'cancelled');
        END IF;
      END
      $$;
    `);
        console.log('Ensured payment and order enums exist');
    }
    async fixOrderColumns(queryRunner) {
        const orderColumns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
    `);
        if (!orderColumns.some(col => col.column_name === 'status')) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN status orderstatus DEFAULT 'new' NOT NULL
      `);
            console.log('Added status column to orders table');
        }
        if (!orderColumns.some(col => col.column_name === 'total_amount')) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0 NOT NULL
      `);
            console.log('Added total_amount column to orders table');
        }
        if (!orderColumns.some(col => col.column_name === 'total_weight')) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN total_weight DECIMAL(10,2) DEFAULT 0 
      `);
            console.log('Added total_weight column to orders table');
        }
    }
    async fixEmptyPrices(queryRunner) {
        await queryRunner.query(`
      UPDATE services 
      SET price = 10000 
      WHERE price IS NULL OR price = 0
    `);
        console.log('Fixed any empty or zero prices in services table');
    }
    async fixOrderItems(queryRunner) {
        const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      )
    `);
        if (!tableExists[0].exists) {
            await queryRunner.query(`
        CREATE TABLE order_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          service_id UUID REFERENCES services(id),
          quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
          price DECIMAL(10,2) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
            console.log('Created order_items table');
        }
        else {
            const orderItemColumns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      `);
            const columnNames = orderItemColumns.map(col => col.column_name);
            if (!columnNames.includes('subtotal')) {
                await queryRunner.query(`
          ALTER TABLE order_items 
          ADD COLUMN subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED
        `);
                console.log('Added subtotal column to order_items table');
            }
        }
        console.log('Fixed order_items table structure');
    }
    async fixOrderNumbers(queryRunner) {
        const orderNumberExists = await queryRunner.hasColumn('orders', 'order_number');
        if (!orderNumberExists) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN order_number VARCHAR(20) UNIQUE
      `);
            await queryRunner.query(`
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(id::text, 8, '0')
        WHERE order_number IS NULL
      `);
            console.log('Added and populated order_number column');
        }
    }
    async fixOrderTotals(queryRunner) {
        await queryRunner.query(`
      UPDATE orders o
      SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM order_items oi
        WHERE oi.order_id = o.id
      )
      WHERE EXISTS (
        SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
      )
    `);
        console.log('Updated order totals based on order items');
    }
    async fixPaymentDisplay(queryRunner) {
        const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
      )
    `);
        if (!tableExists[0].exists) {
            await queryRunner.query(`
        CREATE TABLE payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          customer_id UUID REFERENCES customers(id),
          amount DECIMAL(10,2) NOT NULL,
          payment_method paymentmethod NOT NULL DEFAULT 'cash',
          payment_status paymentstatus NOT NULL DEFAULT 'pending',
          reference_number VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
            console.log('Created payments table');
        }
        console.log('Fixed payment display setup');
    }
    async fixPaymentIDs(queryRunner) {
        await queryRunner.query(`
      UPDATE payments
      SET id = uuid_generate_v4()
      WHERE id IS NULL
    `);
        console.log('Fixed payment IDs');
    }
    async fixReferenceNumbers(queryRunner) {
        await queryRunner.query(`
      UPDATE payments
      SET reference_number = 'REF-' || LPAD(id::text, 8, '0')
      WHERE reference_number IS NULL
    `);
        console.log('Fixed payment reference numbers');
    }
    async fixRelations(queryRunner) {
        const customerIdExists = await queryRunner.hasColumn('orders', 'customer_id');
        if (!customerIdExists) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN customer_id UUID REFERENCES customers(id)
      `);
            console.log('Added customer_id to orders table');
        }
        try {
            await queryRunner.query(`
        ALTER TABLE order_items
        DROP CONSTRAINT IF EXISTS order_items_service_id_fkey,
        ADD CONSTRAINT order_items_service_id_fkey 
        FOREIGN KEY (service_id) 
        REFERENCES services(id)
      `);
            console.log('Fixed order_items service reference');
        }
        catch (error) {
            console.log('Error fixing service reference, may not be needed:', error.message);
        }
        console.log('Fixed relations between tables');
    }
    async fixRemainingOrderColumns(queryRunner) {
        const notesExists = await queryRunner.hasColumn('orders', 'notes');
        if (!notesExists) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN notes TEXT
      `);
            console.log('Added notes column to orders table');
        }
        const pickupDateExists = await queryRunner.hasColumn('orders', 'pickup_date');
        if (!pickupDateExists) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN pickup_date TIMESTAMP
      `);
            console.log('Added pickup_date column to orders table');
        }
        const deliveryDateExists = await queryRunner.hasColumn('orders', 'delivery_date');
        if (!deliveryDateExists) {
            await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN delivery_date TIMESTAMP
      `);
            console.log('Added delivery_date column to orders table');
        }
        console.log('Fixed remaining order columns');
    }
    async fixServiceCategory(queryRunner) {
        const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_categories'
      )
    `);
        if (!tableExists[0].exists) {
            await queryRunner.query(`
        CREATE TABLE service_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
            await queryRunner.query(`
        INSERT INTO service_categories (name, description)
        VALUES 
          ('Regular', 'Layanan cuci regular dengan estimasi 2-3 hari'),
          ('Express', 'Layanan cuci express dengan estimasi 1 hari'),
          ('Super Express', 'Layanan cuci super express dengan estimasi 6 jam')
      `);
            console.log('Created service_categories table with default categories');
        }
        const categoryIdExists = await queryRunner.hasColumn('services', 'category_id');
        if (!categoryIdExists) {
            await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN category_id UUID REFERENCES service_categories(id)
      `);
            await queryRunner.query(`
        UPDATE services
        SET category_id = (SELECT id FROM service_categories WHERE name = 'Regular' LIMIT 1)
        WHERE category_id IS NULL
      `);
            console.log('Added and populated category_id in services table');
        }
        console.log('Fixed service categories');
    }
    async fixTotalAmounts(queryRunner) {
        await queryRunner.query(`
      UPDATE orders o
      SET total_amount = (
        SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
        FROM order_items oi
        WHERE oi.order_id = o.id
      )
    `);
        console.log('Fixed order total amounts');
    }
    async fixTotalWeights(queryRunner) {
        await queryRunner.query(`
      UPDATE orders
      SET total_weight = 0
      WHERE total_weight IS NULL
    `);
        console.log('Set default total weights for orders');
    }
    async fixTransactions(queryRunner) {
        const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      )
    `);
        if (!tableExists[0].exists) {
            await queryRunner.query(`
        CREATE TABLE transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          payment_id UUID REFERENCES payments(id),
          amount DECIMAL(10,2) NOT NULL,
          transaction_type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          reference_id VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
            console.log('Created transactions table for future use');
        }
        console.log('Fixed transaction structure');
    }
}
exports.ConsolidateFixScripts1711600000000 = ConsolidateFixScripts1711600000000;
//# sourceMappingURL=1711600000000-ConsolidateFixScripts.js.map
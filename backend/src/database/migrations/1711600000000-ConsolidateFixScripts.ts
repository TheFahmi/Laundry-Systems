import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidateFixScripts1711600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure we have UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Fix service table columns
    await this.fixServiceColumns(queryRunner);

    // 2. Fix payment enums
    await this.fixPaymentEnums(queryRunner);

    // 3. Fix order columns
    await this.fixOrderColumns(queryRunner);

    // 4. Fix empty prices
    await this.fixEmptyPrices(queryRunner);

    // 5. Fix order items
    await this.fixOrderItems(queryRunner);

    // 6. Fix order numbers
    await this.fixOrderNumbers(queryRunner);

    // 7. Fix order totals
    await this.fixOrderTotals(queryRunner);

    // 8. Fix payment display
    await this.fixPaymentDisplay(queryRunner);

    // 9. Fix payment IDs
    await this.fixPaymentIDs(queryRunner);

    // 10. Fix reference numbers
    await this.fixReferenceNumbers(queryRunner);

    // 11. Fix relations
    await this.fixRelations(queryRunner);

    // 12. Fix remaining order columns
    await this.fixRemainingOrderColumns(queryRunner);

    // 13. Fix service category
    await this.fixServiceCategory(queryRunner);

    // 14. Fix total amounts
    await this.fixTotalAmounts(queryRunner);

    // 15. Fix total weights
    await this.fixTotalWeights(queryRunner);

    // 16. Fix transactions
    await this.fixTransactions(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // We don't provide a down migration since these are data fixes
    console.log('No down migration provided for data fixes');
  }

  // Fix service table columns (unit and estimatedTime)
  private async fixServiceColumns(queryRunner: QueryRunner): Promise<void> {
    // Check if unit column exists and add if missing
    const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
    if (!unitColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "unit" VARCHAR(50) DEFAULT 'kg' NOT NULL
      `);
      console.log('Added "unit" column to services table');
    }

    // Check if estimatedTime column exists and add if missing
    const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
    if (!estimatedTimeColumnExists) {
      // First check if there might be a column with different case
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
      } else {
        console.log(`Column "${columnCheck[0].column_name}" already exists, skipping`);
      }
    }

    // Check if is_active column exists and add if missing
    const isActiveColumnExists = await queryRunner.hasColumn('services', 'is_active');
    if (!isActiveColumnExists) {
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "is_active" BOOLEAN DEFAULT TRUE NOT NULL
      `);
      console.log('Added "is_active" column to services table');
    }
  }

  // Fix payment enums
  private async fixPaymentEnums(queryRunner: QueryRunner): Promise<void> {
    // Create enums if they don't exist
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

  // Fix order columns
  private async fixOrderColumns(queryRunner: QueryRunner): Promise<void> {
    // Get all columns from orders table
    const orderColumns = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders'
    `);

    // Check and add status column if missing
    if (!orderColumns.some(col => col.column_name === 'status')) {
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN status orderstatus DEFAULT 'new' NOT NULL
      `);
      console.log('Added status column to orders table');
    }

    // Check and add total_amount column if missing
    if (!orderColumns.some(col => col.column_name === 'total_amount')) {
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0 NOT NULL
      `);
      console.log('Added total_amount column to orders table');
    }

    // Check and add total_weight column if missing
    if (!orderColumns.some(col => col.column_name === 'total_weight')) {
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN total_weight DECIMAL(10,2) DEFAULT 0 
      `);
      console.log('Added total_weight column to orders table');
    }
  }

  // Fix empty prices
  private async fixEmptyPrices(queryRunner: QueryRunner): Promise<void> {
    // Update null or zero prices in services
    await queryRunner.query(`
      UPDATE services 
      SET price = 10000 
      WHERE price IS NULL OR price = 0
    `);
    console.log('Fixed any empty or zero prices in services table');
  }

  // Fix order items
  private async fixOrderItems(queryRunner: QueryRunner): Promise<void> {
    // Check if order_items table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      )
    `);

    if (!tableExists[0].exists) {
      // Create order_items table if it doesn't exist
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
    } else {
      // Get columns of order_items table
      const orderItemColumns = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      `);
      
      const columnNames = orderItemColumns.map(col => col.column_name);
      
      // Check and add columns if missing
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

  // Fix order numbers
  private async fixOrderNumbers(queryRunner: QueryRunner): Promise<void> {
    // Check if order_number column exists
    const orderNumberExists = await queryRunner.hasColumn('orders', 'order_number');
    
    if (!orderNumberExists) {
      // Add order_number column
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN order_number VARCHAR(20) UNIQUE
      `);
      
      // Generate order numbers for existing orders
      await queryRunner.query(`
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(id::text, 8, '0')
        WHERE order_number IS NULL
      `);
      
      console.log('Added and populated order_number column');
    }
  }

  // Fix order totals
  private async fixOrderTotals(queryRunner: QueryRunner): Promise<void> {
    // Update order totals based on order items
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

  // Fix payment display
  private async fixPaymentDisplay(queryRunner: QueryRunner): Promise<void> {
    // Check if payments table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payments'
      )
    `);

    if (!tableExists[0].exists) {
      // Create payments table if it doesn't exist
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

  // Fix payment IDs
  private async fixPaymentIDs(queryRunner: QueryRunner): Promise<void> {
    // Ensure all payments have proper IDs
    await queryRunner.query(`
      UPDATE payments
      SET id = uuid_generate_v4()
      WHERE id IS NULL
    `);
    
    console.log('Fixed payment IDs');
  }

  // Fix reference numbers
  private async fixReferenceNumbers(queryRunner: QueryRunner): Promise<void> {
    // Generate reference numbers for payments that don't have them
    await queryRunner.query(`
      UPDATE payments
      SET reference_number = 'REF-' || LPAD(id::text, 8, '0')
      WHERE reference_number IS NULL
    `);
    
    console.log('Fixed payment reference numbers');
  }

  // Fix relations
  private async fixRelations(queryRunner: QueryRunner): Promise<void> {
    // Check if orders table has customer_id
    const customerIdExists = await queryRunner.hasColumn('orders', 'customer_id');
    
    if (!customerIdExists) {
      // Add customer_id to orders
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN customer_id UUID REFERENCES customers(id)
      `);
      console.log('Added customer_id to orders table');
    }
    
    // Ensure service_id in order_items references services
    try {
      await queryRunner.query(`
        ALTER TABLE order_items
        DROP CONSTRAINT IF EXISTS order_items_service_id_fkey,
        ADD CONSTRAINT order_items_service_id_fkey 
        FOREIGN KEY (service_id) 
        REFERENCES services(id)
      `);
      console.log('Fixed order_items service reference');
    } catch (error) {
      console.log('Error fixing service reference, may not be needed:', error.message);
    }
    
    console.log('Fixed relations between tables');
  }

  // Fix remaining order columns
  private async fixRemainingOrderColumns(queryRunner: QueryRunner): Promise<void> {
    // Check for notes column in orders
    const notesExists = await queryRunner.hasColumn('orders', 'notes');
    
    if (!notesExists) {
      await queryRunner.query(`
        ALTER TABLE orders 
        ADD COLUMN notes TEXT
      `);
      console.log('Added notes column to orders table');
    }
    
    // Check for pickup_date and delivery_date in orders
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

  // Fix service category
  private async fixServiceCategory(queryRunner: QueryRunner): Promise<void> {
    // Check if service_categories table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_categories'
      )
    `);

    if (!tableExists[0].exists) {
      // Create service_categories table
      await queryRunner.query(`
        CREATE TABLE service_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT now(),
          updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
      `);
      
      // Insert default categories
      await queryRunner.query(`
        INSERT INTO service_categories (name, description)
        VALUES 
          ('Regular', 'Layanan cuci regular dengan estimasi 2-3 hari'),
          ('Express', 'Layanan cuci express dengan estimasi 1 hari'),
          ('Super Express', 'Layanan cuci super express dengan estimasi 6 jam')
      `);
      
      console.log('Created service_categories table with default categories');
    }
    
    // Check if services has category_id
    const categoryIdExists = await queryRunner.hasColumn('services', 'category_id');
    
    if (!categoryIdExists) {
      // Add category_id to services
      await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN category_id UUID REFERENCES service_categories(id)
      `);
      
      // Set default category for existing services
      await queryRunner.query(`
        UPDATE services
        SET category_id = (SELECT id FROM service_categories WHERE name = 'Regular' LIMIT 1)
        WHERE category_id IS NULL
      `);
      
      console.log('Added and populated category_id in services table');
    }
    
    console.log('Fixed service categories');
  }

  // Fix total amounts
  private async fixTotalAmounts(queryRunner: QueryRunner): Promise<void> {
    // Recalculate order total amounts
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

  // Fix total weights
  private async fixTotalWeights(queryRunner: QueryRunner): Promise<void> {
    // Default weight calculation for orders
    await queryRunner.query(`
      UPDATE orders
      SET total_weight = 0
      WHERE total_weight IS NULL
    `);
    
    console.log('Set default total weights for orders');
  }

  // Fix transactions
  private async fixTransactions(queryRunner: QueryRunner): Promise<void> {
    // Check if transactions table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      )
    `);

    if (!tableExists[0].exists) {
      // Create transactions table for future use
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
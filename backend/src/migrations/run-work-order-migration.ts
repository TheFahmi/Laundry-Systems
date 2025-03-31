import { DataSource } from 'typeorm';

// Create a new DataSource instance for this migration script
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry',
  synchronize: false,
  logging: true,
});

async function runMigration() {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Database connection established');

    // Check if the work_orders table already exists
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'work_orders'
      );
    `);

    if (tableExists[0].exists) {
      console.log('Work orders tables already exist, skipping migration');
      await dataSource.destroy();
      return;
    }

    console.log('Creating work_orders table...');
    
    // Create work_orders table
    await dataSource.query(`
      CREATE TABLE "work_orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "job_queue_id" uuid,
        "work_order_number" varchar UNIQUE NOT NULL,
        "status" varchar CHECK ("status" IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
        "assigned_to" varchar,
        "priority" int DEFAULT 3,
        "start_time" timestamp,
        "end_time" timestamp,
        "instructions" text,
        "current_step" varchar CHECK ("current_step" IN ('sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check')) DEFAULT 'sorting',
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_work_orders_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_work_orders_job_queue" FOREIGN KEY ("job_queue_id") REFERENCES "daily_job_queues"("id") ON DELETE SET NULL
      );
    `);

    console.log('Creating work_order_steps table...');
    
    // Create work_order_steps table
    await dataSource.query(`
      CREATE TABLE "work_order_steps" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "work_order_id" uuid NOT NULL,
        "step_type" varchar CHECK ("step_type" IN ('sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check')) NOT NULL,
        "sequence_number" int NOT NULL,
        "status" varchar CHECK ("status" IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
        "assigned_to" varchar,
        "start_time" timestamp,
        "end_time" timestamp,
        "duration_minutes" int,
        "notes" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_work_order_steps_work_order" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE
      );
    `);

    console.log('Tables created successfully!');
    
    // Close the connection
    await dataSource.destroy();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error running migration:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the migration
runMigration(); 
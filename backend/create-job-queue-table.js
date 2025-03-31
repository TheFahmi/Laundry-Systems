const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createJobQueueTable() {
  console.log('Starting daily_job_queues table creation...');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_job_queues'
      );
    `;
    
    const tableExists = await client.query(checkTableQuery);
    
    if (tableExists.rows[0].exists) {
      console.log('Table daily_job_queues already exists. Skipping creation.');
    } else {
      console.log('Creating table daily_job_queues...');
      
      // Create table query
      const createTableQuery = `
        CREATE TABLE "daily_job_queues" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "order_id" uuid NOT NULL,
          "scheduled_date" date NOT NULL,
          "queue_position" integer NOT NULL,
          "estimated_completion_time" TIMESTAMP,
          "actual_completion_time" TIMESTAMP,
          "notes" text,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_daily_job_queues" PRIMARY KEY ("id")
        );
        
        ALTER TABLE "daily_job_queues" 
        ADD CONSTRAINT "FK_daily_job_queues_orders" 
        FOREIGN KEY ("order_id") REFERENCES "orders"("id") 
        ON DELETE CASCADE;
        
        CREATE UNIQUE INDEX "IDX_daily_job_queues_order_date" 
        ON "daily_job_queues" ("order_id", "scheduled_date");
      `;
      
      await client.query(createTableQuery);
      console.log('Table daily_job_queues created successfully');
    }
  } catch (error) {
    console.error('Error during migration process:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createJobQueueTable()
  .then(() => console.log('Daily job queue table migration completed'))
  .catch(error => console.error('Migration script failed:', error)); 
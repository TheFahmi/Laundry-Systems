import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegrateUsersAndCustomers1743770000000 implements MigrationInterface {
    name = 'IntegrateUsersAndCustomers1743770000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Starting migration to integrate users and customers...');
        
        // First, check if the users and customers tables exist
        const userTableExists = await queryRunner.hasTable('users');
        const customerTableExists = await queryRunner.hasTable('customers');
        
        if (!userTableExists) {
            console.log('Creating users table...');
            
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "username" VARCHAR(50) NOT NULL UNIQUE,
                    "password" VARCHAR(255) NOT NULL,
                    "email" VARCHAR(100) NOT NULL UNIQUE,
                    "name" VARCHAR(100) NOT NULL,
                    "role" VARCHAR(20) DEFAULT 'staff',
                    "is_active" BOOLEAN DEFAULT true,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
                )
            `);
            
            // Create a default admin user
            await queryRunner.query(`
                INSERT INTO "users" (
                    "username", "password", "email", "name", "role", "is_active", "created_at", "updated_at"
                ) VALUES (
                    'admin', '$2b$10$AQYAcV6kSxYvIKYQ1tyidu4ZQdlxV7QUJqaBfXIU0YLl/fPe2817i', 'admin@example.com', 'System Administrator', 'admin', true, now(), now()
                )
                ON CONFLICT DO NOTHING
            `);
        } else {
            console.log('Users table already exists, updating schema if needed...');
            
            // Check if the users table has the correct columns
            const hasEmailColumn = await queryRunner.hasColumn('users', 'email');
            if (!hasEmailColumn) {
                await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "email" VARCHAR(100) NULL`);
                await queryRunner.query(`UPDATE "users" SET "email" = "username" || '@example.com' WHERE "email" IS NULL`);
                await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
                await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`);
            }
            
            // Convert id column to UUID if it's not already
            const idColumnType = await queryRunner.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'id'
            `);
            
            if (idColumnType.length > 0 && idColumnType[0].data_type === 'integer') {
                // Need to convert ID to UUID
                console.log('Converting users.id from integer to UUID...');
                
                // Create a temporary ID column
                await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "uuid_id" uuid DEFAULT uuid_generate_v4()`);
                // Copy all the data with new UUIDs
                await queryRunner.query(`CREATE TEMPORARY TABLE users_backup AS SELECT * FROM "users"`);
                // Drop the original table
                await queryRunner.query(`DROP TABLE "users"`);
                // Create the table with the correct schema
                await queryRunner.query(`
                    CREATE TABLE "users" (
                        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                        "username" VARCHAR(50) NOT NULL UNIQUE,
                        "password" VARCHAR(255) NOT NULL,
                        "email" VARCHAR(100) NOT NULL UNIQUE,
                        "name" VARCHAR(100) NOT NULL,
                        "role" VARCHAR(20) DEFAULT 'staff',
                        "is_active" BOOLEAN DEFAULT true,
                        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
                    )
                `);
                // Insert the data from the backup
                await queryRunner.query(`
                    INSERT INTO "users" ("username", "password", "email", "name", "role", "is_active", "created_at", "updated_at")
                    SELECT "username", "password", "email", 
                           COALESCE("name", "full_name") as "name", 
                           "role", 
                           COALESCE("is_active", true) as "is_active", 
                           "created_at", "updated_at" 
                    FROM users_backup
                `);
                // Drop the backup table
                await queryRunner.query(`DROP TABLE users_backup`);
            }
        }
        
        if (!customerTableExists) {
            console.log('Creating customers table...');
            
            await queryRunner.query(`
                CREATE TABLE "customers" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "name" VARCHAR(100) NOT NULL,
                    "email" VARCHAR(100) UNIQUE,
                    "phone" VARCHAR(20),
                    "address" VARCHAR(255),
                    "notes" TEXT,
                    "user_id" uuid,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_customers_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
                )
            `);
        } else {
            console.log('Customers table already exists, updating schema if needed...');
            
            // Convert ID to UUID if needed
            const idColumnType = await queryRunner.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'customers' AND column_name = 'id'
            `);
            
            if (idColumnType.length > 0 && idColumnType[0].data_type === 'integer') {
                // Need to convert ID to UUID
                console.log('Converting customers.id from integer to UUID...');
                
                // Create a temporary table
                await queryRunner.query(`CREATE TEMPORARY TABLE customers_backup AS SELECT * FROM "customers"`);
                // Drop the original table
                await queryRunner.query(`DROP TABLE "customers"`);
                // Create the table with the correct schema
                await queryRunner.query(`
                    CREATE TABLE "customers" (
                        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                        "name" VARCHAR(100) NOT NULL,
                        "email" VARCHAR(100) UNIQUE,
                        "phone" VARCHAR(20),
                        "address" VARCHAR(255),
                        "notes" TEXT,
                        "user_id" uuid,
                        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                        CONSTRAINT "FK_customers_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
                    )
                `);
                // Insert the data from the backup
                await queryRunner.query(`
                    INSERT INTO "customers" ("name", "email", "phone", "address", "notes", "created_at", "updated_at")
                    SELECT "name", "email", "phone", "address", "notes", "created_at", "updated_at" 
                    FROM customers_backup
                `);
                // Drop the backup table
                await queryRunner.query(`DROP TABLE customers_backup`);
            } else {
                // Add the user_id column if it doesn't exist
                const hasUserIdColumn = await queryRunner.hasColumn('customers', 'user_id');
                if (!hasUserIdColumn) {
                    await queryRunner.query(`ALTER TABLE "customers" ADD COLUMN "user_id" uuid`);
                    await queryRunner.query(`
                        ALTER TABLE "customers" 
                        ADD CONSTRAINT "FK_customers_users" 
                        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
                    `);
                }
            }
        }
        
        console.log('Migration completed successfully.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the foreign key constraint
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "FK_customers_users"`);
        
        // Remove the user_id column from customers
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "user_id"`);
        
        console.log('Migration reverted successfully.');
    }
} 
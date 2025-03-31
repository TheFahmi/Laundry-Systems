import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1743600000000 implements MigrationInterface {
    name = 'CreateUsersTable1743600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Creating users table...');
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" VARCHAR(255) PRIMARY KEY,
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
                "id", "username", "password", "email", "name", "role", "is_active", "created_at", "updated_at"
            ) VALUES (
                'admin-user-001', 'admin', '$2b$10$AQYAcV6kSxYvIKYQ1tyidu4ZQdlxV7QUJqaBfXIU0YLl/fPe2817i', 'admin@example.com', 'System Administrator', 'admin', true, now(), now()
            )
            ON CONFLICT DO NOTHING
        `);
        
        console.log('Users table created successfully with admin user (password: admin123).');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
} 
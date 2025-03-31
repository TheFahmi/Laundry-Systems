import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class AddFahmiUser1743516000004 implements MigrationInterface {
    name = 'AddFahmiUser1743516000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Adding fahmi123 user...');
        
        // Hash the password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('fahmi123', salt);
        
        // Add the user
        await queryRunner.query(`
            INSERT INTO "users" (
                "id", "username", "password", "email", "name", "role", "is_active", "created_at", "updated_at"
            ) VALUES (
                uuid_generate_v4(), 'fahmi123', $1, 'fahmi@example.com', 'Fahmi', 'user', true, now(), now()
            )
            ON CONFLICT (username) DO UPDATE
            SET password = $1, updated_at = now()
        `, [hashedPassword]);
        
        console.log('User fahmi123 added/updated successfully.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "users" WHERE username = 'fahmi123'`);
    }
} 
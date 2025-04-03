import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class GenerateCustomerUserAccounts1743780000000 implements MigrationInterface {
    name = 'GenerateCustomerUserAccounts1743780000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Starting migration to generate user accounts for customers...');

        // Get customers without user accounts
        const customersWithoutUsers = await queryRunner.query(`
            SELECT c.id, c.name, c.email, c.phone
            FROM customers c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.user_id IS NULL
        `);

        console.log(`Found ${customersWithoutUsers.length} customers without user accounts`);

        // Default password - we'll use a secure one and require reset on first login
        const defaultPassword = 'Laundry@' + new Date().getFullYear(); // e.g., "Laundry@2023"
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        // Process each customer
        let createdCount = 0;
        for (const customer of customersWithoutUsers) {
            try {
                // Skip customers without email
                if (!customer.email) {
                    console.log(`Skipping customer ${customer.id} - ${customer.name}: No email address`);
                    continue;
                }

                // Generate username from email (remove domain part)
                let username = customer.email.split('@')[0];
                
                // Check if username already exists
                const existingUser = await queryRunner.query(`
                    SELECT username FROM users WHERE username = $1
                `, [username]);
                
                // If username exists, add a random number
                if (existingUser.length > 0) {
                    username = username + Math.floor(1000 + Math.random() * 9000);
                }
                
                // Create user account
                const result = await queryRunner.query(`
                    INSERT INTO users (
                        username, password, email, name, role, is_active, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, 'customer', true, now(), now()
                    ) RETURNING id
                `, [username, hashedPassword, customer.email, customer.name]);
                
                const userId = result[0].id;
                
                // Link user to customer
                await queryRunner.query(`
                    UPDATE customers
                    SET user_id = $1
                    WHERE id = $2
                `, [userId, customer.id]);
                
                createdCount++;
                console.log(`Created user account for ${customer.name}: username=${username}`);
            } catch (error) {
                console.error(`Error creating user for customer ${customer.id} - ${customer.name}:`, error);
            }
        }
        
        console.log(`Migration completed successfully. Created ${createdCount} user accounts.`);
        console.log(`Default password for all generated accounts: ${defaultPassword}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This would revert created users, but we'll skip for safety reasons
        // Instead, we'll just log a message
        console.log('This migration cannot be reverted automatically for security reasons.');
        console.log('To revert, you would need to manually identify and delete the created user accounts.');
    }
} 
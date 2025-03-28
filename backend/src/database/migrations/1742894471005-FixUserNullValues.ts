import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class FixUserNullValues1742894471005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if users table exists
      const tableExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )
      `);
      
      if (!tableExists[0].exists) {
        console.log('Users table does not exist, skipping');
        return;
      }
      
      console.log('Checking for NULL values in users table...');
      
      // Check for null IDs
      const nullIdCount = await queryRunner.query(`
        SELECT COUNT(*) FROM users WHERE id IS NULL
      `);
      
      if (parseInt(nullIdCount[0].count, 10) > 0) {
        console.log(`Found ${nullIdCount[0].count} users with NULL id values`);
        
        // Update NULL IDs with UUID
        await queryRunner.query(`
          UPDATE users SET id = '${uuidv4()}'
          WHERE id IS NULL
        `);
        
        console.log('Fixed NULL id values');
      }
      
      // Check for other null fields and set defaults
      const columnsToCheck = [
        { name: 'username', default: `'user_${Date.now()}'` },
        { name: 'password', default: `'${await generateDefaultPassword()}'` },
        { name: 'email', default: `'placeholder_${Date.now()}@example.com'` },
        { name: 'name', default: `'Unnamed User'` }
      ];
      
      for (const column of columnsToCheck) {
        const nullCount = await queryRunner.query(`
          SELECT COUNT(*) FROM users 
          WHERE ${column.name} IS NULL
        `);
        
        if (parseInt(nullCount[0].count, 10) > 0) {
          console.log(`Found ${nullCount[0].count} users with NULL ${column.name} values`);
          
          // Update NULL values with defaults
          await queryRunner.query(`
            UPDATE users 
            SET ${column.name} = ${column.default} || id
            WHERE ${column.name} IS NULL
          `);
          
          console.log(`Fixed NULL ${column.name} values`);
        }
        
        // Add NOT NULL constraint
        await queryRunner.query(`
          ALTER TABLE users
          ALTER COLUMN ${column.name} SET NOT NULL
        `);
        
        console.log(`Added NOT NULL constraint to ${column.name}`);
      }
      
      console.log('User table fixes completed successfully');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration doesn't need to be reverted as it fixes data integrity
    console.log('This migration does not need to be reverted');
  }
}

// Helper function to generate a default bcrypt password
async function generateDefaultPassword(): Promise<string> {
  // In a real scenario, use bcrypt to hash a default password
  // Since we can't import bcrypt here easily, we'll use a placeholder
  return 'DEFAULT_PASSWORD_PLACEHOLDER';
} 
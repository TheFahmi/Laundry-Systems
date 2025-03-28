import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixServiceColumnReference1711800000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if we need to fix the join relationship
      await queryRunner.query(`
        DO $$
        BEGIN
          -- Check if we have 'service_id' column in order_items table
          IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'order_items' 
            AND column_name = 'service_id'
          ) THEN
            -- Create or update service_id foreign key reference
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.table_constraints 
              WHERE constraint_type = 'FOREIGN KEY' 
              AND table_name = 'order_items' 
              AND constraint_name = 'FK_order_items_service'
            ) THEN
              -- Add foreign key constraint if needed
              ALTER TABLE order_items
              ADD CONSTRAINT "FK_order_items_service" 
              FOREIGN KEY ("service_id") 
              REFERENCES services(id);
            END IF;
          END IF;
        END
        $$;
      `);
      
      console.log('Fixed service reference in order_items table if needed');
    } catch (error) {
      console.error('Error in migration:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No specific down migration needed as this is a fix
  }
} 
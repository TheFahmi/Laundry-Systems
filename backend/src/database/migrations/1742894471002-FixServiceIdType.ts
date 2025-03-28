import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixServiceIdType1742894471002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // First, check the current data type of service_id
      const columnTypeInfo = await queryRunner.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items' 
        AND column_name = 'service_id'
      `);
      
      if (columnTypeInfo.length === 0) {
        console.log('service_id column not found');
        return;
      }
      
      const currentDataType = columnTypeInfo[0].data_type;
      console.log(`Current service_id column data type: ${currentDataType}`);
      
      // Drop existing foreign key constraint if it exists
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_order_items_service'
          ) THEN
            ALTER TABLE order_items 
            DROP CONSTRAINT "FK_order_items_service";
          END IF;
        END $$;
      `);
      
      // If the column is not already UUID, alter it
      if (currentDataType !== 'uuid') {
        // First, get a valid service ID to use as default
        const services = await queryRunner.query(`
          SELECT id FROM services LIMIT 1
        `);
        
        const defaultUuid = services.length > 0 
          ? services[0].id 
          : '00000000-0000-0000-0000-000000000000';
        
        // Update any existing rows with invalid UUIDs to use the default
        await queryRunner.query(`
          UPDATE order_items 
          SET service_id = '${defaultUuid}'
          WHERE service_id IS NULL 
             OR service_id = '' 
             OR service_id = '0' 
             OR NOT service_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        `);
        
        // Alter the column type to UUID
        await queryRunner.query(`
          ALTER TABLE order_items 
          ALTER COLUMN service_id TYPE UUID USING service_id::uuid,
          ALTER COLUMN service_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
          ALTER COLUMN service_id SET NOT NULL
        `);
        
        console.log('Changed service_id column type to UUID');
      }
      
      // Re-add the foreign key constraint
      await queryRunner.query(`
        ALTER TABLE order_items
        ADD CONSTRAINT "FK_order_items_service"
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
      `);
      
      console.log('Added foreign key constraint to service_id');
      
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Drop the foreign key constraint
      await queryRunner.query(`
        ALTER TABLE order_items 
        DROP CONSTRAINT IF EXISTS "FK_order_items_service"
      `);
      
      // Revert the column type to its original type (integer)
      await queryRunner.query(`
        ALTER TABLE order_items 
        ALTER COLUMN service_id TYPE INTEGER USING (service_id::text)::integer,
        ALTER COLUMN service_id DROP DEFAULT,
        ALTER COLUMN service_id DROP NOT NULL
      `);
    } catch (error) {
      console.error('Error in down migration:', error);
      throw error;
    }
  }
} 
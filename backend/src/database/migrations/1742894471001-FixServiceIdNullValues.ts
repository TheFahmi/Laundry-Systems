import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixServiceIdNullValues1742894471001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // First, check the data type of service_id
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
      
      const dataType = columnTypeInfo[0].data_type;
      console.log(`service_id column data type: ${dataType}`);
      
      // First, check if there are any NULL values in service_id
      const nullItems = await queryRunner.query(`
        SELECT COUNT(*) FROM order_items 
        WHERE service_id IS NULL
      `);
      
      const nullCount = parseInt(nullItems[0].count, 10);
      console.log(`Found ${nullCount} order items with NULL service_id`);
      
      if (nullCount > 0) {
        // Update any NULL service_id values based on data type
        let defaultValue;
        
        if (dataType === 'integer' || dataType === 'bigint') {
          // If it's a numeric type, use a default ID like 0 or 1
          // First, check if there's a valid service we can reference
          const services = await queryRunner.query(`
            SELECT id FROM services LIMIT 1
          `);
          
          if (services.length > 0) {
            defaultValue = services[0].id;
          } else {
            defaultValue = 0; // Default to 0 if no services found
          }
          
          await queryRunner.query(`
            UPDATE order_items 
            SET service_id = ${defaultValue} 
            WHERE service_id IS NULL
          `);
        } else if (dataType === 'character varying' || dataType === 'text' || dataType === 'uuid') {
          // For string or UUID types
          const services = await queryRunner.query(`
            SELECT id FROM services LIMIT 1
          `);
          
          if (services.length > 0) {
            defaultValue = services[0].id;
          } else {
            defaultValue = '00000000-0000-0000-0000-000000000000'; // Default UUID
          }
          
          await queryRunner.query(`
            UPDATE order_items 
            SET service_id = '${defaultValue}' 
            WHERE service_id IS NULL
          `);
        }
        
        console.log(`Updated ${nullCount} order items with default service_id: ${defaultValue}`);
      }
      
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
      
      // Modify the column to prevent future NULL values and add foreign key constraint
      const columnCheck = await queryRunner.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items' 
        AND column_name = 'service_id'
      `);
      
      if (columnCheck.length > 0 && columnCheck[0].is_nullable === 'YES') {
        let defaultClause;
        
        if (dataType === 'integer' || dataType === 'bigint') {
          defaultClause = 'SET DEFAULT 0';
        } else if (dataType === 'character varying' || dataType === 'text' || dataType === 'uuid') {
          defaultClause = "SET DEFAULT '00000000-0000-0000-0000-000000000000'";
        } else {
          console.log(`Unsupported data type ${dataType} for setting default`);
          return;
        }
        
        // First set the column as NOT NULL with default
        await queryRunner.query(`
          ALTER TABLE order_items 
          ALTER COLUMN service_id SET NOT NULL,
          ALTER COLUMN service_id ${defaultClause}
        `);
        
        // Then add the foreign key constraint
        await queryRunner.query(`
          ALTER TABLE order_items
          ADD CONSTRAINT "FK_order_items_service"
          FOREIGN KEY (service_id)
          REFERENCES services(id)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
        `);
        
        console.log('Modified service_id column to prevent NULL values and added foreign key constraint');
      }
    } catch (error) {
      console.error('Error in migration:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Drop the foreign key constraint first
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
      
      // Then revert the column constraints
      await queryRunner.query(`
        ALTER TABLE order_items 
        ALTER COLUMN service_id DROP NOT NULL,
        ALTER COLUMN service_id DROP DEFAULT
      `);
    } catch (error) {
      console.error('Error in down migration:', error);
    }
  }
} 
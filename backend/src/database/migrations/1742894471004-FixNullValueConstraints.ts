import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class FixNullValueConstraints1742894471004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Get all tables with their primary key columns
      const tables = await queryRunner.query(`
        SELECT 
          tc.table_name, 
          kc.column_name
        FROM 
          information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kc 
            ON kc.table_name = tc.table_name AND kc.table_schema = tc.table_schema
            AND kc.constraint_name = tc.constraint_name
        WHERE 
          tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      `);
      
      console.log(`Found ${tables.length} tables with primary keys`);
      
      // For each table, check and fix NULL values in primary key columns
      for (const table of tables) {
        const tableName = table.table_name;
        const columnName = table.column_name;
        
        console.log(`Checking ${tableName}.${columnName} for NULL values...`);
        
        // Count NULL values
        const nullCountResult = await queryRunner.query(`
          SELECT COUNT(*) FROM "${tableName}" 
          WHERE "${columnName}" IS NULL
        `);
        
        const nullCount = parseInt(nullCountResult[0].count, 10);
        
        if (nullCount > 0) {
          console.log(`Found ${nullCount} NULL values in ${tableName}.${columnName}`);
          
          // Check column data type to determine how to fix
          const columnTypeResult = await queryRunner.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}' 
            AND column_name = '${columnName}'
          `);
          
          const dataType = columnTypeResult[0].data_type;
          console.log(`Column ${tableName}.${columnName} data type: ${dataType}`);
          
          // Fix NULL values based on data type
          if (dataType === 'uuid' || dataType.includes('char')) {
            // For UUID or character types, generate a UUID
            await queryRunner.query(`
              CREATE OR REPLACE FUNCTION fix_null_ids_${tableName}() RETURNS void AS $$
              DECLARE
                rec RECORD;
              BEGIN
                FOR rec IN SELECT ctid FROM "${tableName}" WHERE "${columnName}" IS NULL LOOP
                  UPDATE "${tableName}" 
                  SET "${columnName}" = '${uuidv4()}'
                  WHERE ctid = rec.ctid;
                END LOOP;
              END;
              $$ LANGUAGE plpgsql;
              
              SELECT fix_null_ids_${tableName}();
            `);
          } else if (dataType === 'integer' || dataType === 'bigint') {
            // For numeric types, generate a sequence
            await queryRunner.query(`
              DO $$ 
              DECLARE
                max_id integer;
              BEGIN
                -- Get the maximum ID value
                EXECUTE 'SELECT COALESCE(MAX("${columnName}"), 0) FROM "${tableName}"' INTO max_id;
                
                -- Update NULL IDs with incrementing values
                EXECUTE 'UPDATE "${tableName}" SET "${columnName}" = id_val.new_id 
                        FROM (
                          SELECT ctid, ROW_NUMBER() OVER () + ' || max_id || ' as new_id 
                          FROM "${tableName}" 
                          WHERE "${columnName}" IS NULL
                        ) as id_val 
                        WHERE "${tableName}".ctid = id_val.ctid';
              END $$;
            `);
          }
          
          console.log(`Fixed ${nullCount} NULL values in ${tableName}.${columnName}`);
          
          // Set NOT NULL constraint
          await queryRunner.query(`
            ALTER TABLE "${tableName}" 
            ALTER COLUMN "${columnName}" SET NOT NULL
          `);
          
          console.log(`Added NOT NULL constraint to ${tableName}.${columnName}`);
        } else {
          console.log(`No NULL values found in ${tableName}.${columnName}`);
          
          // Ensure the column has NOT NULL constraint
          const columnInfo = await queryRunner.query(`
            SELECT is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
            AND column_name = '${columnName}'
          `);
          
          if (columnInfo[0].is_nullable === 'YES') {
            await queryRunner.query(`
              ALTER TABLE "${tableName}" 
              ALTER COLUMN "${columnName}" SET NOT NULL
            `);
            console.log(`Added NOT NULL constraint to ${tableName}.${columnName}`);
          } else {
            console.log(`${tableName}.${columnName} already has NOT NULL constraint`);
          }
        }
      }
      
    } catch (error) {
      console.error('Error fixing NULL value constraints:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('This migration cannot be safely reverted');
  }
} 
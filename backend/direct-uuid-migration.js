require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function runDirectMigration() {
  console.log('Starting direct UUID migration...');
  
  // Create PostgreSQL client
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'laundry'
  });
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database.');

    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Step 1: Identify and drop all foreign key constraints
      console.log('Identifying and dropping foreign key constraints...');
      
      const fkConstraintsQuery = `
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
      `;
      
      const { rows: fkConstraints } = await client.query(fkConstraintsQuery);
      
      for (const fk of fkConstraints) {
        await client.query(`ALTER TABLE "${fk.table_name}" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`);
        console.log(`Dropped foreign key: ${fk.constraint_name} from table ${fk.table_name}`);
      }
      
      // Step 2: Get list of all tables
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          AND table_name NOT LIKE 'typeorm%'
          AND table_name NOT LIKE 'pg_%'
      `;
      
      const { rows: tables } = await client.query(tablesQuery);
      const tableNames = tables.map(t => t.table_name);
      
      console.log('Tables to update:', tableNames);
      
      // Step 3: Process each table
      for (const tableName of tableNames) {
        console.log(`\nProcessing table: ${tableName}`);
        
        // Check if table has id column and get its data type
        const columnsQuery = `
          SELECT column_name, data_type, udt_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'id'
        `;
        
        const { rows: columns } = await client.query(columnsQuery, [tableName]);
        
        if (columns.length === 0) {
          console.log(`Table ${tableName} doesn't have an id column, skipping.`);
          continue;
        }
        
        const idColumn = columns[0];
        console.log(`  ID column type: ${idColumn.data_type} (${idColumn.udt_name})`);
        
        // Create mapping table with appropriate type for old_id
        let oldIdType = 'VARCHAR(255)';
        if (idColumn.data_type === 'integer' || idColumn.data_type === 'bigint') {
          oldIdType = idColumn.data_type.toUpperCase();
        } else if (idColumn.udt_name === 'uuid') {
          oldIdType = 'UUID';
        }
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS "${tableName}_id_mapping" (
            old_id ${oldIdType},
            new_id UUID,
            PRIMARY KEY (old_id)
          )
        `);
        
        // Add temporary UUID column
        await client.query(`
          ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "temp_uuid" UUID
        `);
        
        // Generate UUIDs for each record
        const { rows: records } = await client.query(`SELECT id FROM "${tableName}"`);
        console.log(`  Found ${records.length} records to update.`);
        
        for (const record of records) {
          if (record.id === null) {
            console.log(`  Warning: Skipping null ID in table ${tableName}`);
            continue;
          }
          
          const newUuid = uuidv4();
          
          // Update temp UUID field
          await client.query(`
            UPDATE "${tableName}" SET "temp_uuid" = $1 WHERE id = $2
          `, [newUuid, record.id]);
          
          // Insert into mapping table - handling different ID types
          try {
            await client.query(`
              INSERT INTO "${tableName}_id_mapping" (old_id, new_id)
              VALUES ($1, $2)
            `, [record.id, newUuid]);
          } catch (error) {
            console.error(`  Error creating mapping for ${tableName} ID ${record.id}:`, error.message);
          }
        }
        
        console.log(`  Generated UUIDs for all records in ${tableName}.`);
      }
      
      // Step 4: Find and update foreign key relationships
      console.log('\nIdentifying and updating foreign key relationships...');
      
      // Get column types for all tables
      const columnTypesQuery = `
        SELECT 
          table_name, 
          column_name, 
          data_type, 
          udt_name 
        FROM 
          information_schema.columns 
        WHERE 
          table_schema = 'public'
      `;
      
      const { rows: columnTypesList } = await client.query(columnTypesQuery);
      
      // Create column type lookup map
      const columnTypes = {};
      for (const column of columnTypesList) {
        if (!columnTypes[column.table_name]) {
          columnTypes[column.table_name] = {};
        }
        columnTypes[column.table_name][column.column_name] = {
          data_type: column.data_type,
          udt_name: column.udt_name
        };
      }
      
      for (const fk of fkConstraints) {
        const { table_name, column_name, foreign_table_name } = fk;
        
        // Skip if referencing table or referenced table wasn't processed
        if (!tableNames.includes(table_name) || !tableNames.includes(foreign_table_name)) {
          console.log(`  Skipping ${table_name}.${column_name} -> ${foreign_table_name} relationship.`);
          continue;
        }
        
        // Get the column data type
        const columnType = columnTypes[table_name] && columnTypes[table_name][column_name]
          ? columnTypes[table_name][column_name]
          : { data_type: 'unknown', udt_name: 'unknown' };
          
        console.log(`  Processing foreign key ${table_name}.${column_name} (${columnType.data_type}) -> ${foreign_table_name}`);
        
        // Add temporary UUID column for the foreign key
        await client.query(`
          ALTER TABLE "${table_name}" ADD COLUMN IF NOT EXISTS "${column_name}_uuid" UUID
        `);
        
        // Get records with foreign keys - exclude empty strings
        const { rows: records } = await client.query(`
          SELECT id, "${column_name}" 
          FROM "${table_name}" 
          WHERE "${column_name}" IS NOT NULL
        `);
        
        console.log(`  Found ${records.length} foreign key values to update.`);
        
        // Update each record
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const record of records) {
          // Skip if the foreign key is null
          if (record[column_name] === null) {
            skippedCount++;
            continue;
          }
          
          // Skip empty strings for non-integer types
          if (record[column_name] === '' && 
              columnType.data_type !== 'integer' && 
              columnType.data_type !== 'bigint') {
            skippedCount++;
            continue;
          }
          
          // Get the new UUID from mapping table
          try {
            const { rows: mappingRows } = await client.query(`
              SELECT new_id FROM "${foreign_table_name}_id_mapping" 
              WHERE old_id = $1
            `, [record[column_name]]);
            
            if (mappingRows && mappingRows.length > 0) {
              const newUuid = mappingRows[0].new_id;
              
              // Update the foreign key reference
              await client.query(`
                UPDATE "${table_name}" SET "${column_name}_uuid" = $1 
                WHERE id = $2
              `, [newUuid, record.id]);
              
              updatedCount++;
            } else {
              console.log(`    Warning: No mapping found for ${column_name}=${record[column_name]} in table ${table_name}`);
              skippedCount++;
            }
          } catch (error) {
            console.error(`    Error processing foreign key: ${table_name}.${column_name}=${record[column_name]}:`, error.message);
            skippedCount++;
          }
        }
        
        console.log(`  Updated ${updatedCount} foreign keys, skipped ${skippedCount} records in ${table_name}.${column_name}`);
      }
      
      // Step 5: Update table schemas to use UUID
      console.log('\nUpdating table schemas to use UUID primary keys...');
      
      for (const tableName of tableNames) {
        // Check if the table has already been processed
        const { rows: columns } = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'temp_uuid'
        `, [tableName]);
        
        if (columns.length === 0) {
          console.log(`  Skipping ${tableName} - no temp_uuid column found.`);
          continue;
        }
        
        // Drop sequences if they exist
        const { rows: sequences } = await client.query(`
          SELECT pg_get_serial_sequence($1, 'id') as sequence_name
        `, [tableName]);
        
        if (sequences[0] && sequences[0].sequence_name) {
          await client.query(`DROP SEQUENCE IF EXISTS ${sequences[0].sequence_name} CASCADE`);
          console.log(`  Dropped sequence ${sequences[0].sequence_name}`);
        }
        
        // Drop primary key constraints
        const { rows: pkConstraints } = await client.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = $1 AND constraint_type = 'PRIMARY KEY'
        `, [tableName]);
        
        if (pkConstraints.length > 0) {
          for (const pk of pkConstraints) {
            await client.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT "${pk.constraint_name}"`);
            console.log(`  Dropped primary key ${pk.constraint_name} from ${tableName}`);
          }
        }
        
        // Drop the old ID column and rename the temp_uuid to id
        await client.query(`ALTER TABLE "${tableName}" DROP COLUMN "id" CASCADE`);
        await client.query(`ALTER TABLE "${tableName}" RENAME COLUMN "temp_uuid" TO "id"`);
        
        // Add primary key constraint
        await client.query(`ALTER TABLE "${tableName}" ADD PRIMARY KEY ("id")`);
        console.log(`  Updated ${tableName} to use UUID primary key`);
      }
      
      // Step 6: Update foreign key columns and recreate constraints
      console.log('\nFinalizing foreign key columns and recreating constraints...');
      
      for (const fk of fkConstraints) {
        const { table_name, column_name, foreign_table_name } = fk;
        
        try {
          // Skip if either table wasn't processed
          if (!tableNames.includes(table_name) || !tableNames.includes(foreign_table_name)) {
            console.log(`  Skipping ${table_name}.${column_name} -> ${foreign_table_name}`);
            continue;
          }
          
          // Check if temporary foreign key column exists
          const { rows: tempColumns } = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
          `, [table_name, `${column_name}_uuid`]);
          
          if (tempColumns.length === 0) {
            console.log(`  Skipping ${table_name}.${column_name} - no UUID column found`);
            continue;
          }
          
          // Make sure all values are valid UUIDs or NULL
          await client.query(`
            UPDATE "${table_name}" 
            SET "${column_name}_uuid" = NULL 
            WHERE "${column_name}_uuid" IS NOT NULL AND NOT "${column_name}_uuid"::TEXT ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          `);
          
          // For safety, check if the source table exists
          const { rows: sourceTableCheck } = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_name = $1
            ) as exists
          `, [foreign_table_name]);
          
          if (!sourceTableCheck[0].exists) {
            console.log(`  Source table ${foreign_table_name} doesn't exist, skipping constraint`);
            continue;
          }
          
          // Drop old foreign key column
          await client.query(`ALTER TABLE "${table_name}" DROP COLUMN "${column_name}" CASCADE`);
          
          // Rename UUID column
          await client.query(`
            ALTER TABLE "${table_name}" RENAME COLUMN "${column_name}_uuid" TO "${column_name}"
          `);
          
          // Add foreign key constraint with better error handling
          try {
            await client.query(`
              ALTER TABLE "${table_name}" ADD CONSTRAINT "FK_${table_name}_${column_name}"
              FOREIGN KEY ("${column_name}") REFERENCES "${foreign_table_name}"("id") ON DELETE CASCADE
            `);
            console.log(`  Added foreign key constraint for ${table_name}.${column_name}`);
          } catch (constraintError) {
            console.error(`  Error adding constraint for ${table_name}.${column_name}:`, constraintError.message);
            console.log(`  Setting invalid references to NULL and retrying...`);
            
            // Set invalid references to NULL
            await client.query(`
              UPDATE "${table_name}" t1
              SET "${column_name}" = NULL
              WHERE "${column_name}" IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM "${foreign_table_name}" t2 WHERE t2.id = t1."${column_name}"
              )
            `);
            
            // Try adding the constraint again
            try {
              await client.query(`
                ALTER TABLE "${table_name}" ADD CONSTRAINT "FK_${table_name}_${column_name}"
                FOREIGN KEY ("${column_name}") REFERENCES "${foreign_table_name}"("id") ON DELETE CASCADE
              `);
              console.log(`  Successfully added constraint after fixing invalid references`);
            } catch (retryError) {
              console.error(`  Still unable to add constraint for ${table_name}.${column_name}:`, retryError.message);
            }
          }
        } catch (error) {
          console.error(`  Error processing ${table_name}.${column_name}:`, error.message);
        }
      }
      
      // Step 7: Cleanup mapping tables
      console.log('\nCleaning up temporary mapping tables...');
      
      for (const tableName of tableNames) {
        await client.query(`DROP TABLE IF EXISTS "${tableName}_id_mapping"`);
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('\nUUID migration completed successfully!');
      
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error during migration, changes rolled back:', error);
      throw error;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    // Always close client
    await client.end();
    console.log('Database connection closed.');
  }
}

runDirectMigration()
  .then(() => {
    console.log('Direct migration process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during direct migration:', error);
    process.exit(1);
  }); 
import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class FixPrimaryKeyTypes1743516000001 implements MigrationInterface {
    name = 'FixPrimaryKeyTypes1743516000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // Ensure UUID extension is installed
            await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

            // Drop foreign key constraints first
            const foreignKeysResult = await queryRunner.query(`
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
                AND tc.table_schema = 'public'
            `);

            // Drop all foreign key constraints
            for (const fk of foreignKeysResult) {
                await queryRunner.query(`
                    ALTER TABLE "${fk.table_name}" 
                    DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"
                `);
                console.log(`Dropped foreign key: ${fk.constraint_name} from table ${fk.table_name}`);
            }

            // Get all tables with their primary key columns
            const tables = await queryRunner.query(`
                SELECT 
                    tc.table_name, 
                    kc.column_name
                FROM 
                    information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kc 
                        ON kc.table_name = tc.table_name 
                        AND kc.table_schema = tc.table_schema
                        AND kc.constraint_name = tc.constraint_name
                WHERE 
                    tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = 'public'
            `);

            // Process each table
            for (const table of tables) {
                const tableName = table.table_name;
                const columnName = table.column_name;

                // Skip TypeORM migration tables
                if (tableName.startsWith('typeorm_')) {
                    continue;
                }

                // Get the current data type of the primary key
                const columnInfo = await queryRunner.query(`
                    SELECT data_type, udt_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = $1 
                    AND column_name = $2
                `, [tableName, columnName]);

                if (columnInfo.length === 0) {
                    console.log(`Column ${columnName} not found in table ${tableName}`);
                    continue;
                }

                const currentDataType = columnInfo[0].udt_name;

                // Skip if already UUID
                if (currentDataType === 'uuid') {
                    console.log(`Table ${tableName} already has UUID primary key`);
                    continue;
                }

                console.log(`Converting ${tableName}.${columnName} from ${currentDataType} to UUID`);

                // Create temporary column for UUID
                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    ADD COLUMN temp_id UUID DEFAULT uuid_generate_v4()
                `);

                // Update temp_id for all existing rows
                await queryRunner.query(`
                    UPDATE "${tableName}" 
                    SET temp_id = uuid_generate_v4()
                `);

                // Create mapping table for old to new IDs
                await queryRunner.query(`
                    CREATE TABLE "${tableName}_id_mapping" (
                        old_id ${currentDataType},
                        new_id UUID,
                        PRIMARY KEY (old_id)
                    )
                `);

                // Store the ID mappings
                await queryRunner.query(`
                    INSERT INTO "${tableName}_id_mapping" (old_id, new_id)
                    SELECT "${columnName}", temp_id 
                    FROM "${tableName}"
                `);

                // Drop the primary key constraint
                const pkConstraintName = await queryRunner.query(`
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_schema = 'public' 
                    AND table_name = $1 
                    AND constraint_type = 'PRIMARY KEY'
                `, [tableName]);

                if (pkConstraintName.length > 0) {
                    await queryRunner.query(`
                        ALTER TABLE "${tableName}" 
                        DROP CONSTRAINT "${pkConstraintName[0].constraint_name}"
                    `);
                }

                // Drop the old ID column and rename temp_id to id
                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    DROP COLUMN "${columnName}"
                `);

                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    ALTER COLUMN temp_id SET NOT NULL
                `);

                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    ALTER COLUMN temp_id SET DEFAULT uuid_generate_v4()
                `);

                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    RENAME COLUMN temp_id TO "${columnName}"
                `);

                // Add the primary key constraint back
                await queryRunner.query(`
                    ALTER TABLE "${tableName}" 
                    ADD PRIMARY KEY ("${columnName}")
                `);

                console.log(`Converted ${tableName}.${columnName} to UUID`);
            }

            // Update foreign key columns to UUID
            for (const fk of foreignKeysResult) {
                const { table_name, column_name, foreign_table_name } = fk;

                // Skip if either table was skipped
                if (
                    table_name.startsWith('typeorm_') || 
                    foreign_table_name.startsWith('typeorm_')
                ) {
                    continue;
                }

                console.log(`Converting foreign key ${table_name}.${column_name} to UUID`);

                // Add temporary column for the new UUID foreign key
                await queryRunner.query(`
                    ALTER TABLE "${table_name}" 
                    ADD COLUMN temp_fk UUID
                `);

                // Update the temporary column with mapped UUIDs
                await queryRunner.query(`
                    UPDATE "${table_name}" t1
                    SET temp_fk = t2.new_id
                    FROM "${foreign_table_name}_id_mapping" t2
                    WHERE t1."${column_name}"::text = t2.old_id::text
                `);

                // Drop the old foreign key column and rename temp_fk
                await queryRunner.query(`
                    ALTER TABLE "${table_name}" 
                    DROP COLUMN "${column_name}"
                `);

                await queryRunner.query(`
                    ALTER TABLE "${table_name}" 
                    ALTER COLUMN temp_fk SET DEFAULT NULL
                `);

                await queryRunner.query(`
                    ALTER TABLE "${table_name}" 
                    RENAME COLUMN temp_fk TO "${column_name}"
                `);

                // Add the foreign key constraint back
                await queryRunner.query(`
                    ALTER TABLE "${table_name}" 
                    ADD CONSTRAINT "FK_${table_name}_${column_name}" 
                    FOREIGN KEY ("${column_name}") 
                    REFERENCES "${foreign_table_name}"("id") 
                    ON DELETE CASCADE
                `);

                console.log(`Converted foreign key ${table_name}.${column_name} to UUID`);
            }

            // Clean up mapping tables
            for (const table of tables) {
                if (!table.table_name.startsWith('typeorm_')) {
                    await queryRunner.query(`
                        DROP TABLE IF EXISTS "${table.table_name}_id_mapping"
                    `);
                }
            }

            console.log('Successfully converted all primary and foreign keys to UUID');

        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('This migration cannot be reverted as it would lose the UUID mappings');
    }
} 
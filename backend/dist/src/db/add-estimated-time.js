"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function addEstimatedTimeColumn() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST || 'dono-03.danbot.host',
        port: parseInt(process.env.DB_PORT, 10) || 2127,
        user: process.env.DB_USERNAME || 'pterodactyl',
        password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
        database: process.env.DB_DATABASE || 'laundry_db',
    });
    try {
        await client.connect();
        console.log('Database connection established');
        const query = `
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE services ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL;
          RAISE NOTICE 'Column "estimatedTime" added successfully';
        EXCEPTION
          WHEN duplicate_column THEN
            RAISE NOTICE 'Column "estimatedTime" already exists in the table';
        END;
      END $$;
    `;
        await client.query(query);
        console.log('ALTER TABLE statement executed successfully');
        const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services'
      AND column_name = 'estimatedTime'
    `;
        const result = await client.query(checkQuery);
        if (result.rows.length > 0) {
            console.log('Column "estimatedTime" exists in the services table');
        }
        else {
            console.log('Column "estimatedTime" was NOT found in the services table');
        }
    }
    catch (error) {
        console.error('Error adding estimatedTime column:', error);
    }
    finally {
        await client.end();
        console.log('Database connection closed');
    }
}
addEstimatedTimeColumn();
//# sourceMappingURL=add-estimated-time.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function updateServiceTable() {
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
        const checkUnitColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'unit'
    `;
        const unitColumnResult = await client.query(checkUnitColumnQuery);
        if (unitColumnResult.rows.length === 0) {
            console.log('Adding "unit" column to services table...');
            const addUnitColumnQuery = `
        ALTER TABLE services 
        ADD COLUMN unit VARCHAR(50) DEFAULT 'kg' NOT NULL
      `;
            await client.query(addUnitColumnQuery);
            console.log('Column "unit" added successfully');
        }
        else {
            console.log('Column "unit" already exists in services table');
        }
        const checkEstimatedTimeColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'estimatedtime'
    `;
        const estimatedTimeColumnResult = await client.query(checkEstimatedTimeColumnQuery);
        if (estimatedTimeColumnResult.rows.length === 0) {
            console.log('Adding "estimatedTime" column to services table...');
            const addEstimatedTimeColumnQuery = `
        ALTER TABLE services 
        ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
      `;
            await client.query(addEstimatedTimeColumnQuery);
            console.log('Column "estimatedTime" added successfully');
        }
        else {
            console.log('Column "estimatedTime" already exists in services table');
        }
    }
    catch (error) {
        console.error('Error updating service table:', error);
    }
    finally {
        await client.end();
        console.log('Database connection closed');
    }
}
updateServiceTable();
//# sourceMappingURL=update-service-table.js.map
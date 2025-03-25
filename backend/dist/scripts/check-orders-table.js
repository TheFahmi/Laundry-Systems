"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
async function checkOrdersTable() {
    const client = new pg_1.Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '@Gatauu123',
        database: 'laundry_db'
    });
    try {
        await client.connect();
        const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
        console.log('Columns in orders table:', result.rows);
    }
    catch (err) {
        console.error('Error checking orders table:', err);
    }
    finally {
        await client.end();
    }
}
checkOrdersTable();
//# sourceMappingURL=check-orders-table.js.map
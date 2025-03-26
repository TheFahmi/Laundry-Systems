"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const uuid_1 = require("uuid");
const seedServices = [
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Kering',
        description: 'Layanan cuci kering untuk pakaian',
        price: 7000,
        unit: 'kg',
        estimatedTime: 24,
        isActive: true
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Setrika',
        description: 'Layanan cuci dan setrika pakaian',
        price: 10000,
        unit: 'kg',
        estimatedTime: 48,
        isActive: true
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Setrika',
        description: 'Layanan setrika untuk pakaian',
        price: 5000,
        unit: 'kg',
        estimatedTime: 24,
        isActive: true
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Dry Clean',
        description: 'Layanan dry clean untuk pakaian formal',
        price: 15000,
        unit: 'pcs',
        estimatedTime: 72,
        isActive: true
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Express Laundry',
        description: 'Layanan cuci kilat (6 jam)',
        price: 20000,
        unit: 'kg',
        estimatedTime: 6,
        isActive: true
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Sepatu',
        description: 'Layanan cuci untuk sepatu',
        price: 25000,
        unit: 'pair',
        estimatedTime: 48,
        isActive: true
    }
];
async function seedDatabase() {
    console.log('Starting database seed...');
    const dataSource = new typeorm_1.DataSource(Object.assign(Object.assign({}, database_config_1.config), { synchronize: false }));
    try {
        await dataSource.initialize();
        console.log('Database connection established');
        const servicesTable = await dataSource.query(`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      )`);
        if (!servicesTable[0].exists) {
            console.log('Services table does not exist, creating...');
            await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "services" (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "price" DECIMAL(10,2) NOT NULL,
          "unit" VARCHAR(50) NOT NULL,
          "estimatedTime" INTEGER,
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
            console.log('Services table created');
        }
        const existingServices = await dataSource.query('SELECT COUNT(*) FROM services');
        const count = parseInt(existingServices[0].count);
        if (count > 0) {
            console.log(`Found ${count} existing services, skipping seed...`);
        }
        else {
            for (const service of seedServices) {
                await dataSource.query(`INSERT INTO services (id, name, description, price, unit, "estimatedTime", "is_active", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`, [service.id, service.name, service.description, service.price, service.unit, service.estimatedTime, service.isActive]);
            }
            console.log(`Successfully seeded ${seedServices.length} services`);
        }
        await dataSource.destroy();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error during seed process:', error);
        process.exit(1);
    }
}
seedDatabase();
//# sourceMappingURL=seed-runner.js.map
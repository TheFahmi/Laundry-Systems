"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const uuid_1 = require("uuid");
const customer_seed_1 = require("./seeds/customer.seed");
const seedCategories = [
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci',
        description: 'Layanan cuci pakaian'
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Setrika',
        description: 'Layanan setrika pakaian'
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Premium',
        description: 'Layanan premium'
    }
];
const seedServices = [
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Kering',
        description: 'Layanan cuci kering untuk pakaian',
        price: 7000,
        unit: 'kg',
        estimatedTime: 24,
        isActive: true,
        categoryId: seedCategories[0].id
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Setrika',
        description: 'Layanan cuci dan setrika pakaian',
        price: 10000,
        unit: 'kg',
        estimatedTime: 48,
        isActive: true,
        categoryId: seedCategories[0].id
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Setrika',
        description: 'Layanan setrika untuk pakaian',
        price: 5000,
        unit: 'kg',
        estimatedTime: 24,
        isActive: true,
        categoryId: seedCategories[1].id
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Dry Clean',
        description: 'Layanan dry clean untuk pakaian formal',
        price: 15000,
        unit: 'pcs',
        estimatedTime: 72,
        isActive: true,
        categoryId: seedCategories[2].id
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Express Laundry',
        description: 'Layanan cuci kilat (6 jam)',
        price: 20000,
        unit: 'kg',
        estimatedTime: 6,
        isActive: true,
        categoryId: seedCategories[2].id
    },
    {
        id: (0, uuid_1.v4)(),
        name: 'Cuci Sepatu',
        description: 'Layanan cuci untuk sepatu',
        price: 25000,
        unit: 'pair',
        estimatedTime: 48,
        isActive: true,
        categoryId: seedCategories[0].id
    }
];
async function seedDatabase() {
    console.log('Starting database seed...');
    const dataSource = new typeorm_1.DataSource(Object.assign(Object.assign({}, database_config_1.config), { synchronize: false }));
    try {
        await dataSource.initialize();
        console.log('Database connection established');
        const categoriesTable = await dataSource.query(`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_categories'
      )`);
        if (!categoriesTable[0].exists) {
            console.log('Service categories table does not exist, creating...');
            await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "service_categories" (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
            console.log('Service categories table created');
        }
        const existingCategories = await dataSource.query('SELECT COUNT(*) FROM service_categories');
        const categoryCount = parseInt(existingCategories[0].count);
        if (categoryCount > 0) {
            console.log(`Found ${categoryCount} existing service categories, skipping seed...`);
        }
        else {
            for (const category of seedCategories) {
                await dataSource.query(`INSERT INTO service_categories (id, name, description, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`, [category.id, category.name, category.description]);
            }
            console.log(`Successfully seeded ${seedCategories.length} service categories`);
        }
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
          "unit" VARCHAR(50) NOT NULL DEFAULT 'kg',
          "estimatedTime" INTEGER,
          "is_active" BOOLEAN DEFAULT true,
          "category_id" UUID REFERENCES service_categories(id),
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
            console.log('Services table created');
        }
        const existingServices = await dataSource.query('SELECT COUNT(*) FROM services');
        const serviceCount = parseInt(existingServices[0].count);
        if (serviceCount > 0) {
            console.log(`Found ${serviceCount} existing services, skipping seed...`);
        }
        else {
            for (const service of seedServices) {
                await dataSource.query(`INSERT INTO services (id, name, description, price, unit, "estimatedTime", "is_active", "category_id", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`, [service.id, service.name, service.description, service.price, service.unit, service.estimatedTime, service.isActive, service.categoryId]);
            }
            console.log(`Successfully seeded ${seedServices.length} services`);
        }
        console.log('Checking and seeding customers...');
        const customersTable = await dataSource.query(`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      )`);
        if (!customersTable[0].exists) {
            console.log('Customers table does not exist, creating...');
            await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "phone" VARCHAR(20),
          "address" TEXT,
          "email" VARCHAR(255),
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
            console.log('Customers table created');
        }
        await (0, customer_seed_1.seedCustomers)(dataSource);
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
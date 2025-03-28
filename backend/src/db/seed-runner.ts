import { DataSource } from 'typeorm';
import { config } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';
import { seedCustomers } from './seeds/customer.seed';

// Add category seed data
const seedCategories = [
  {
    id: uuidv4(),
    name: 'Cuci',
    description: 'Layanan cuci pakaian'
  },
  {
    id: uuidv4(),
    name: 'Setrika',
    description: 'Layanan setrika pakaian'
  },
  {
    id: uuidv4(),
    name: 'Premium',
    description: 'Layanan premium'
  }
];

// Update service seed data to include categoryId
const seedServices = [
  {
    id: uuidv4(),
    name: 'Cuci Kering',
    description: 'Layanan cuci kering untuk pakaian',
    price: 7000,
    unit: 'kg',
    estimatedTime: 24,
    isActive: true,
    categoryId: seedCategories[0].id
  },
  {
    id: uuidv4(),
    name: 'Cuci Setrika',
    description: 'Layanan cuci dan setrika pakaian',
    price: 10000,
    unit: 'kg',
    estimatedTime: 48,
    isActive: true,
    categoryId: seedCategories[0].id
  },
  {
    id: uuidv4(),
    name: 'Setrika',
    description: 'Layanan setrika untuk pakaian',
    price: 5000,
    unit: 'kg',
    estimatedTime: 24,
    isActive: true,
    categoryId: seedCategories[1].id
  },
  {
    id: uuidv4(),
    name: 'Dry Clean',
    description: 'Layanan dry clean untuk pakaian formal',
    price: 15000,
    unit: 'pcs',
    estimatedTime: 72,
    isActive: true,
    categoryId: seedCategories[2].id
  },
  {
    id: uuidv4(),
    name: 'Express Laundry',
    description: 'Layanan cuci kilat (6 jam)',
    price: 20000,
    unit: 'kg',
    estimatedTime: 6,
    isActive: true,
    categoryId: seedCategories[2].id
  },
  {
    id: uuidv4(),
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
  
  // Initialize database connection
  const dataSource = new DataSource({
    ...config,
    synchronize: false,
  } as any);
  
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
    // Check if service_categories table exists
    const categoriesTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_categories'
      )`
    );
    
    if (!categoriesTable[0].exists) {
      console.log('Service categories table does not exist, creating...');
      
      // Create service_categories table if it doesn't exist
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
    
    // Check if we already have categories
    const existingCategories = await dataSource.query('SELECT COUNT(*) FROM service_categories');
    const categoryCount = parseInt(existingCategories[0].count);
    
    if (categoryCount > 0) {
      console.log(`Found ${categoryCount} existing service categories, skipping seed...`);
    } else {
      // Insert category seed data
      for (const category of seedCategories) {
        await dataSource.query(
          `INSERT INTO service_categories (id, name, description, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
           [category.id, category.name, category.description]
        );
      }
      
      console.log(`Successfully seeded ${seedCategories.length} service categories`);
    }
    
    // Continue with services table
    // Check if services table exists
    const servicesTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      )`
    );
    
    if (!servicesTable[0].exists) {
      console.log('Services table does not exist, creating...');
      
      // Create services table if it doesn't exist
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
    
    // Check if we already have services
    const existingServices = await dataSource.query('SELECT COUNT(*) FROM services');
    const serviceCount = parseInt(existingServices[0].count);
    
    if (serviceCount > 0) {
      console.log(`Found ${serviceCount} existing services, skipping seed...`);
    } else {
      // Insert seed data
      for (const service of seedServices) {
        await dataSource.query(
          `INSERT INTO services (id, name, description, price, unit, "estimatedTime", "is_active", "category_id", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
           [service.id, service.name, service.description, service.price, service.unit, service.estimatedTime, service.isActive, service.categoryId]
        );
      }
      
      console.log(`Successfully seeded ${seedServices.length} services`);
    }
    
    // Seed customers
    console.log('Checking and seeding customers...');
    // Check if customers table exists
    const customersTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      )`
    );

    if (!customersTable[0].exists) {
      console.log('Customers table does not exist, creating...');
      
      // Create customers table if it doesn't exist
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
          "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

    // Call the customer seed function
    await seedCustomers(dataSource);
    
    // Close the connection
    await dataSource.destroy();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 
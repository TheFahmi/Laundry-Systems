import { DataSource } from 'typeorm';
import { config } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';

// Services data to seed
const seedServices = [
  {
    id: uuidv4(),
    name: 'Cuci Kering',
    description: 'Layanan cuci kering untuk pakaian',
    price: 7000,
    unit: 'kg',
    estimatedTime: 24,
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Cuci Setrika',
    description: 'Layanan cuci dan setrika pakaian',
    price: 10000,
    unit: 'kg',
    estimatedTime: 48,
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Setrika',
    description: 'Layanan setrika untuk pakaian',
    price: 5000,
    unit: 'kg',
    estimatedTime: 24,
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Dry Clean',
    description: 'Layanan dry clean untuk pakaian formal',
    price: 15000,
    unit: 'pcs',
    estimatedTime: 72,
    isActive: true
  },
  {
    id: uuidv4(),
    name: 'Express Laundry',
    description: 'Layanan cuci kilat (6 jam)',
    price: 20000,
    unit: 'kg',
    estimatedTime: 6,
    isActive: true
  },
  {
    id: uuidv4(),
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
  
  // Initialize database connection
  const dataSource = new DataSource({
    ...config,
    synchronize: false,
  } as any);
  
  try {
    await dataSource.initialize();
    console.log('Database connection established');
    
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
          "unit" VARCHAR(50) NOT NULL,
          "estimatedTime" INTEGER,
          "is_active" BOOLEAN DEFAULT true,
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('Services table created');
    }
    
    // Check if we already have services
    const existingServices = await dataSource.query('SELECT COUNT(*) FROM services');
    const count = parseInt(existingServices[0].count);
    
    if (count > 0) {
      console.log(`Found ${count} existing services, skipping seed...`);
    } else {
      // Insert seed data
      for (const service of seedServices) {
        await dataSource.query(
          `INSERT INTO services (id, name, description, price, unit, "estimatedTime", "is_active", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
           [service.id, service.name, service.description, service.price, service.unit, service.estimatedTime, service.isActive]
        );
      }
      
      console.log(`Successfully seeded ${seedServices.length} services`);
    }
    
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
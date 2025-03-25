import { DataSource } from 'typeorm';
import { UpdateCustomIdFormats1720281600000 } from './1720281600000-UpdateCustomIdFormats';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'laundry',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();

  // Jalankan migrasi secara manual
  const migration = new UpdateCustomIdFormats1720281600000();
  console.log('Menjalankan migrasi: UpdateCustomIdFormats');
  
  try {
    await migration.up(dataSource.createQueryRunner());
    console.log('Migrasi berhasil dijalankan');
  } catch (error) {
    console.error('Terjadi error saat menjalankan migrasi:', error);
  } finally {
    await dataSource.destroy();
  }
}

runMigration()
  .then(() => console.log('Proses migrasi selesai'))
  .catch(error => console.error('Gagal menjalankan migrasi:', error)); 
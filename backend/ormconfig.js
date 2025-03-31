const { SnakeNamingStrategy } = require('typeorm-naming-strategies');
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy()
}); 
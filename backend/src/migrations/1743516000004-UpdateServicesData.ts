import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServicesData1743516000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update the categories to use Indonesian names
    await queryRunner.query(`
      UPDATE service_categories 
      SET name = 'Cuci', description = 'Layanan cuci pakaian'
      WHERE name = 'Wash & Fold';
      
      UPDATE service_categories 
      SET name = 'Setrika', description = 'Layanan setrika pakaian'
      WHERE name = 'Dry Cleaning';
      
      UPDATE service_categories 
      SET name = 'Premium', description = 'Layanan premium dan express'
      WHERE name = 'Express Service';
    `);

    // Then, delete existing services
    await queryRunner.query(`DELETE FROM services`);

    // Insert new services with Indonesian names and proper pricing
    await queryRunner.query(`
      INSERT INTO services (name, description, price, pricemodel, processing_time_hours, category, is_active)
      VALUES 
        ('Cuci Reguler', 'Layanan cuci standar dengan pengeringan', 7000, 'per_kg', 24, 'Cuci', true),
        ('Cuci Express', 'Layanan cuci cepat, selesai dalam 6 jam', 12000, 'per_kg', 6, 'Premium', true),
        ('Setrika', 'Layanan setrika untuk pakaian', 5000, 'per_kg', 24, 'Setrika', true),
        ('Cuci Setrika', 'Layanan cuci dan setrika lengkap', 10000, 'per_kg', 48, 'Cuci', true),
        ('Dry Cleaning', 'Layanan cuci kering untuk pakaian khusus', 20000, 'per_piece', 72, 'Premium', true),
        ('Cuci Sepatu', 'Layanan cuci khusus untuk sepatu', 35000, 'per_piece', 24, 'Premium', true),
        ('Cuci Tas', 'Layanan cuci khusus untuk tas', 50000, 'per_piece', 48, 'Premium', true),
        ('Cuci Karpet', 'Layanan cuci untuk karpet dan permadani', 25000, 'per_kg', 72, 'Premium', true),
        ('Cuci Gordyn', 'Layanan cuci untuk gordyn dan vitrage', 15000, 'per_kg', 72, 'Premium', true),
        ('Cuci Bed Cover', 'Layanan cuci untuk bed cover dan sprei', 12000, 'per_kg', 48, 'Cuci', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to original categories
    await queryRunner.query(`
      UPDATE service_categories 
      SET name = 'Wash & Fold', description = 'Regular laundry service with washing and folding'
      WHERE name = 'Cuci';
      
      UPDATE service_categories 
      SET name = 'Dry Cleaning', description = 'Professional dry cleaning service for delicate items'
      WHERE name = 'Setrika';
      
      UPDATE service_categories 
      SET name = 'Express Service', description = 'Same day or next day service with priority handling'
      WHERE name = 'Premium';
    `);

    // Delete the new services
    await queryRunner.query(`DELETE FROM services`);

    // Restore original services
    await queryRunner.query(`
      INSERT INTO services (name, description, price, pricemodel, processing_time_hours, category)
      VALUES 
        ('Regular Wash & Fold', 'Standard laundry service', 5.00, 'per_kg', 24, 'Wash & Fold'),
        ('Express Wash & Fold', 'Same day laundry service', 8.00, 'per_kg', 8, 'Express Service'),
        ('Dry Cleaning - Suits', 'Professional dry cleaning for suits', 15.00, 'per_piece', 48, 'Dry Cleaning'),
        ('Dry Cleaning - Dresses', 'Professional dry cleaning for dresses', 12.00, 'per_piece', 48, 'Dry Cleaning'),
        ('Bedding & Linens', 'Washing and folding for large items', 10.00, 'per_kg', 24, 'Wash & Fold');
    `);
  }
} 
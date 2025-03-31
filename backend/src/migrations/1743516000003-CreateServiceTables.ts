import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateServiceTables1743516000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create service_categories table
    await queryRunner.createTable(
      new Table({
        name: 'service_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create services table
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'pricemodel',
            type: 'varchar',
            length: '50',
            default: "'per_kg'",
          },
          {
            name: 'processing_time_hours',
            type: 'integer',
            default: 24,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert some default service categories
    await queryRunner.query(`
      INSERT INTO service_categories (name, description)
      VALUES 
        ('Wash & Fold', 'Regular laundry service with washing and folding'),
        ('Dry Cleaning', 'Professional dry cleaning service for delicate items'),
        ('Express Service', 'Same day or next day service with priority handling');
    `);

    // Insert some default services
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('services');
    await queryRunner.dropTable('service_categories');
  }
} 
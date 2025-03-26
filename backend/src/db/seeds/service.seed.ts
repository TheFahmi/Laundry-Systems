import { DataSource } from 'typeorm';
import { Service } from '../../modules/service/entities/service.entity';
import { v4 as uuidv4 } from 'uuid';

export const seedServices = async (dataSource: DataSource): Promise<void> => {
  const serviceRepository = dataSource.getRepository(Service);
  
  // Check if services already exist
  const existingCount = await serviceRepository.count();
  if (existingCount > 0) {
    console.log('Services already seeded, skipping...');
    return;
  }
  
  // Create default services
  const defaultServices = [
    {
      id: uuidv4(),
      name: 'Cuci Setrika Regular',
      price: 7000,
      description: 'Layanan cuci dan setrika regular, estimasi 2-3 hari',
      isActive: true,
      estimatedTime: 3 * 24 * 60, // 3 days in minutes
      category: 'Regular'
    },
    {
      id: uuidv4(),
      name: 'Cuci Setrika Express',
      price: 12000,
      description: 'Layanan cuci dan setrika express, estimasi 1 hari',
      isActive: true,
      estimatedTime: 1 * 24 * 60, // 1 day in minutes
      category: 'Express'
    },
    {
      id: uuidv4(),
      name: 'Cuci Kering',
      price: 5000,
      description: 'Layanan cuci kering tanpa setrika',
      isActive: true,
      estimatedTime: 1 * 24 * 60, // 1 day in minutes
      category: 'Regular'
    },
    {
      id: uuidv4(),
      name: 'Cuci Sepatu',
      price: 35000,
      description: 'Layanan cuci sepatu, estimasi 2 hari',
      isActive: true,
      estimatedTime: 2 * 24 * 60, // 2 days in minutes
      category: 'Special'
    },
    {
      id: uuidv4(),
      name: 'Cuci Selimut',
      price: 30000,
      description: 'Layanan cuci selimut',
      isActive: true,
      estimatedTime: 3 * 24 * 60, // 3 days in minutes
      category: 'Special'
    },
    {
      id: uuidv4(),
      name: 'Cuci Gorden',
      price: 25000,
      description: 'Layanan cuci gorden',
      isActive: true,
      estimatedTime: 3 * 24 * 60, // 3 days in minutes
      category: 'Special'
    },
  ];
  
  // Save services to database
  for (const serviceData of defaultServices) {
    await serviceRepository.save(serviceData);
  }
  
  console.log(`Seeded ${defaultServices.length} services successfully`);
}; 
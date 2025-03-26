import { DataSource } from 'typeorm';
import { Service } from '../../modules/service/entities/service.entity';
import { ServiceCategory } from '../../modules/service-category/entities/service-category.entity';
import { v4 as uuidv4 } from 'uuid';

export async function seedServices(dataSource: DataSource) {
  const serviceRepository = dataSource.getRepository(Service);
  const categoryRepository = dataSource.getRepository(ServiceCategory);
  
  console.log('Starting service seed...');
  
  // Check if we already have services
  const count = await serviceRepository.count();
  if (count > 0) {
    console.log(`Database already has ${count} services. Skipping service seed.`);
    return;
  }
  
  // First check if we have categories
  const categories = await categoryRepository.find();
  
  // If no categories exist, create them first
  let washCategory: ServiceCategory;
  let ironingCategory: ServiceCategory;
  let premiumCategory: ServiceCategory;
  
  if (categories.length === 0) {
    console.log('No service categories found. Creating categories first...');
    
    washCategory = categoryRepository.create({
      name: 'Cuci',
      description: 'Layanan cuci pakaian'
    });
    
    ironingCategory = categoryRepository.create({
      name: 'Setrika',
      description: 'Layanan setrika pakaian'
    });
    
    premiumCategory = categoryRepository.create({
      name: 'Premium',
      description: 'Layanan premium'
    });
    
    await categoryRepository.save([washCategory, ironingCategory, premiumCategory]);
    console.log('Service categories created.');
  } else {
    console.log('Using existing service categories.');
    // Use existing categories
    washCategory = categories.find(c => c.name === 'Cuci') || categories[0];
    ironingCategory = categories.find(c => c.name === 'Setrika') || categories[0];
    premiumCategory = categories.find(c => c.name === 'Premium') || categories[0];
  }
  
  // Create services
  const services = [
    serviceRepository.create({
      id: uuidv4(),
      name: 'Cuci Kering',
      description: 'Layanan cuci kering untuk pakaian',
      price: 7000,
      unit: 'kg',
      estimatedTime: 24,
      isActive: true,
      categoryId: washCategory.id
    }),
    serviceRepository.create({
      id: uuidv4(),
      name: 'Cuci Setrika',
      description: 'Layanan cuci dan setrika pakaian',
      price: 10000,
      unit: 'kg',
      estimatedTime: 48,
      isActive: true,
      categoryId: washCategory.id
    }),
    serviceRepository.create({
      id: uuidv4(),
      name: 'Setrika',
      description: 'Layanan setrika untuk pakaian',
      price: 5000,
      unit: 'kg',
      estimatedTime: 24,
      isActive: true,
      categoryId: ironingCategory.id
    }),
    serviceRepository.create({
      id: uuidv4(),
      name: 'Dry Clean',
      description: 'Layanan dry clean untuk pakaian formal',
      price: 15000,
      unit: 'pcs',
      estimatedTime: 72,
      isActive: true,
      categoryId: premiumCategory.id
    }),
    serviceRepository.create({
      id: uuidv4(),
      name: 'Express Laundry',
      description: 'Layanan cuci kilat (6 jam)',
      price: 20000,
      unit: 'kg',
      estimatedTime: 6,
      isActive: true,
      categoryId: premiumCategory.id
    }),
    serviceRepository.create({
      id: uuidv4(),
      name: 'Cuci Sepatu',
      description: 'Layanan cuci untuk sepatu',
      price: 25000,
      unit: 'pair',
      estimatedTime: 48,
      isActive: true,
      categoryId: washCategory.id
    })
  ];
  
  // Save all services to database
  await serviceRepository.save(services);
  
  console.log(`Created ${services.length} services`);
} 
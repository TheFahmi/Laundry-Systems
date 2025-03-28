import { DataSource } from 'typeorm';
import { PriceModel, Service } from '../../modules/service/entities/service.entity';
import { ServiceCategory } from '../../modules/service-category/entities/service-category.entity';

export const seedServices = async (dataSource: DataSource) => {
  const serviceRepository = dataSource.getRepository(Service);
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  // Get categories
  const washCategory = await categoryRepository.findOne({ where: { name: 'Wash' } });
  const ironingCategory = await categoryRepository.findOne({ where: { name: 'Ironing' } });
  const premiumCategory = await categoryRepository.findOne({ where: { name: 'Premium' } });

  if (!washCategory || !ironingCategory || !premiumCategory) {
    throw new Error('Categories not found. Please run category seeds first.');
  }

  // Create services
  const services: Partial<Service>[] = [
    {
      name: 'Regular Wash',
      description: 'Standard washing service',
      price: 15000,
      priceModel: PriceModel.PER_KG,
      processingTimeHours: 2,
      isActive: true,
      category: washCategory.name
    },
    {
      name: 'Express Wash',
      description: 'Fast washing service (3-hour completion)',
      price: 25000,
      priceModel: PriceModel.PER_KG,
      processingTimeHours: 1,
      isActive: true,
      category: washCategory.name
    },
    {
      name: 'Regular Ironing',
      description: 'Standard ironing service',
      price: 10000,
      priceModel: PriceModel.PER_PIECE,
      processingTimeHours: 1,
      isActive: true,
      category: ironingCategory.name
    },
    {
      name: 'Premium Wash',
      description: 'Premium washing with special treatment',
      price: 35000,
      priceModel: PriceModel.PER_KG,
      processingTimeHours: 3,
      isActive: true,
      category: premiumCategory.name
    },
    {
      name: 'Premium Dry Clean',
      description: 'Premium dry cleaning service',
      price: 45000,
      priceModel: PriceModel.PER_PIECE,
      processingTimeHours: 4,
      isActive: true,
      category: premiumCategory.name
    },
    {
      name: 'Quick Wash',
      description: 'Quick washing service (2-hour completion)',
      price: 20000,
      priceModel: PriceModel.PER_KG,
      processingTimeHours: 1,
      isActive: true,
      category: washCategory.name
    }
  ];

  // Create service entities
  const serviceEntities = services.map(service => serviceRepository.create(service));

  // Save all services
  await serviceRepository.save(serviceEntities);
}; 
import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../modules/service-category/entities/service-category.entity';

export const seedServiceCategories = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  // Create categories
  const categories: Partial<ServiceCategory>[] = [
    {
      name: 'Wash',
      description: 'All washing services'
    },
    {
      name: 'Ironing',
      description: 'All ironing services'
    },
    {
      name: 'Premium',
      description: 'Premium laundry services'
    }
  ];

  // Create category entities
  const categoryEntities = categories.map(category => categoryRepository.create(category));

  // Save all categories
  await categoryRepository.save(categoryEntities);
}; 
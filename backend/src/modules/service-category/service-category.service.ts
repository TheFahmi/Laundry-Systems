import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  async findAll(): Promise<ServiceCategory[]> {
    return this.serviceCategoryRepository.find({ relations: ['services'] });
  }

  async findOne(id: number): Promise<ServiceCategory> {
    const category = await this.serviceCategoryRepository.findOne({ 
      where: { id },
      relations: ['services'] 
    });
    
    if (!category) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }
    
    return category;
  }

  async create(category: ServiceCategory): Promise<ServiceCategory> {
    return this.serviceCategoryRepository.save(category);
  }

  async update(id: number, updateData: ServiceCategory): Promise<ServiceCategory> {
    await this.findOne(id);
    await this.serviceCategoryRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.serviceCategoryRepository.remove(category);
  }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from '../service/entities/service.entity';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoryService {
  constructor(
    @InjectRepository(ServiceCategory)
    private serviceCategoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceCategoryDto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    const category = this.serviceCategoryRepository.create(createServiceCategoryDto);
    return this.serviceCategoryRepository.save(category);
  }

  async findAll(options: { page?: number; limit?: number } = {}): Promise<{ items: ServiceCategory[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.serviceCategoryRepository.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
    });
    
    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<ServiceCategory> {
    const category = await this.serviceCategoryRepository.findOne({ 
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }
    
    return category;
  }

  async findServices(id: number): Promise<Service[]> {
    const category = await this.findOne(id);
    
    return this.serviceRepository.find({
      where: { 
        category: category.name
      },
      order: {
        name: 'ASC'
      }
    });
  }

  async update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    
    Object.assign(category, updateServiceCategoryDto);
    
    return this.serviceCategoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.serviceCategoryRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }
  }
} 
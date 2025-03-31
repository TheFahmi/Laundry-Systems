import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async findAll(options: { 
    page?: number; 
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean; 
  } = {}): Promise<{ 
    items: Service[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, search, category, isActive } = options;
    const skip = (page - 1) * limit;

    try {
      const queryBuilder = this.serviceRepository.createQueryBuilder('service');
      
      // Apply filters
      if (search) {
        queryBuilder.andWhere('(service.name ILIKE :search OR service.description ILIKE :search)', {
          search: `%${search}%`,
        });
      }
      
      if (category) {
        queryBuilder.andWhere('service.category = :category', { category });
      }
      
      if (isActive !== undefined) {
        queryBuilder.andWhere('service.isActive = :isActive', { isActive });
      }
      
      // Get total count
      const total = await queryBuilder.getCount();
      
      // Apply pagination and get results
      const items = await queryBuilder
        .orderBy('service.name', 'ASC')
        .skip(skip)
        .take(limit)
        .getMany();

      return {
        items,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id }
      });
      
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      
      return service;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    
    Object.assign(service, updateServiceDto);
    
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      // Get distinct categories from the services table
      const result = await this.serviceRepository
        .createQueryBuilder('service')
        .select('DISTINCT service.category', 'category')
        .where('service.category IS NOT NULL')
        .andWhere('service.category != :empty', { empty: '' })
        .orderBy('service.category', 'ASC')
        .getRawMany();
      
      // Extract and return the categories
      return result.map(item => item.category);
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  async save(serviceData: Partial<Service>): Promise<Service> {
    try {
      // If the service has an ID, try to find it first
      if (serviceData.id) {
        const existingService = await this.serviceRepository.findOne({
          where: { id: serviceData.id }
        });
        
        if (existingService) {
          // Update existing service
          Object.assign(existingService, serviceData);
          const result = await this.serviceRepository.save(existingService);
          return result;
        }
      }
      
      // Create new service
      const newService = this.serviceRepository.create(serviceData);
      const result = await this.serviceRepository.save(newService);
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  }
} 
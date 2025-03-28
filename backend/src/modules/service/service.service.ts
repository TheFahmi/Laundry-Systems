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

  async findAll(options: { page?: number; limit?: number } = {}): Promise<{ 
    items: Service[]; 
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    try {
      const [items, total] = await this.serviceRepository.findAndCount({
        skip,
        take: limit,
        order: { name: 'ASC' }
      });

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
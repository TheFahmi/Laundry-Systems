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

  async findAll(options: { page?: number; limit?: number } = {}): Promise<{ items: Service[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.serviceRepository.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
    });
    
    // Map database column names to entity property names
    const mappedItems = items.map(item => {
      // If needed, convert is_active to isActive
      if (item.hasOwnProperty('is_active') && !item.hasOwnProperty('isActive')) {
        const itemWithCorrectProps = {
          ...item,
          isActive: (item as any).is_active
        };
        delete (itemWithCorrectProps as any).is_active;
        return itemWithCorrectProps;
      }
      return item;
    });
    
    return {
      items: mappedItems,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return service;
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
} 
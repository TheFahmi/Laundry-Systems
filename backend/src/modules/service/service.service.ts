import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({ relations: ['category'] });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({ 
      where: { id },
      relations: ['category'] 
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return service;
  }

  async create(service: Service): Promise<Service> {
    return this.serviceRepository.save(service);
  }

  async update(id: number, updateData: Service): Promise<Service> {
    await this.findOne(id);
    await this.serviceRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
  }
} 
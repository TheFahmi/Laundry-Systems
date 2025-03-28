import { DataSource } from 'typeorm';
import { Customer } from './modules/customer/entities/customer.entity';
import { Service } from './modules/service/entities/service.entity';
import { ServiceCategory } from './modules/service-category/entities/service-category.entity';
import { Order } from './modules/order/entities/order.entity';
import { OrderItem } from './modules/order/entities/order-item.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'laundry',
  synchronize: true,
  logging: true,
  entities: [Customer, Service, ServiceCategory, Order, OrderItem],
  subscribers: [],
  migrations: [],
}); 
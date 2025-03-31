import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { WorkOrder } from '../order/entities/work-order.entity';
import { CalendarEventDto, CalendarEventType, CalendarQueryDto } from './dto/calendar.dto';
import { endOfDay, parseISO, startOfDay, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    
    @InjectRepository(WorkOrder)
    private readonly workOrderRepository: Repository<WorkOrder>,
  ) {}

  /**
   * Get calendar events based on filters
   */
  async getEvents(query: CalendarQueryDto): Promise<CalendarEventDto[]> {
    try {
      const { startDate, endDate, type } = query;
      
      // Determine date range
      let start: Date;
      let end: Date;
      
      if (startDate && endDate) {
        // Use provided date range
        start = startOfDay(parseISO(startDate));
        end = endOfDay(parseISO(endDate));
      } else if (startDate) {
        // Just use the start date and extend to a month
        start = startOfDay(parseISO(startDate));
        end = endOfDay(addDays(start, 30));
      } else if (endDate) {
        // Use the end date and go back a month
        end = endOfDay(parseISO(endDate));
        start = startOfDay(subDays(end, 30));
      } else {
        // Default: current month
        const today = new Date();
        start = startOfMonth(today);
        end = endOfMonth(today);
      }
      
      this.logger.debug(`Fetching calendar events from ${start.toISOString()} to ${end.toISOString()}`);
      
      // Collect events based on type filter
      const events: CalendarEventDto[] = [];
      
      // If no type filter or filter includes orders
      if (!type || type === CalendarEventType.ORDER) {
        const orderEvents = await this.getOrderEvents(start, end);
        events.push(...orderEvents);
      }
      
      // If no type filter or filter includes payments
      if (!type || type === CalendarEventType.PAYMENT) {
        const paymentEvents = await this.getPaymentEvents(start, end);
        events.push(...paymentEvents);
      }
      
      // If no type filter or filter includes work orders
      if (!type || type === CalendarEventType.WORK_ORDER) {
        const workOrderEvents = await this.getWorkOrderEvents(start, end);
        events.push(...workOrderEvents);
      }
      
      // Sort events by date
      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      this.logger.error(`Error fetching calendar events: ${error.message}`, error.stack);
      return [];
    }
  }
  
  /**
   * Get events from orders
   */
  private async getOrderEvents(start: Date, end: Date): Promise<CalendarEventDto[]> {
    try {
      const orders = await this.orderRepository.find({
        where: [
          { createdAt: Between(start, end) },
          { pickupDate: Between(start, end) },
          { deliveryDate: Between(start, end) },
        ],
        select: ['id', 'orderNumber', 'status', 'createdAt', 'pickupDate', 'deliveryDate', 'totalAmount'],
      });
      
      const events: CalendarEventDto[] = [];
      
      // Create events for order creation
      orders.forEach(order => {
        // Order creation event
        if (order.createdAt >= start && order.createdAt <= end) {
          events.push({
            id: `order-created-${order.id}`,
            title: `Order ${order.orderNumber}`,
            date: order.createdAt.toISOString(),
            type: CalendarEventType.ORDER,
            status: order.status,
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              action: 'created',
            },
          });
        }
        
        // Order pickup event
        if (order.pickupDate && order.pickupDate >= start && order.pickupDate <= end) {
          events.push({
            id: `order-pickup-${order.id}`,
            title: `Pickup: ${order.orderNumber}`,
            date: order.pickupDate.toISOString(),
            type: CalendarEventType.ORDER,
            status: order.status,
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              action: 'pickup',
            },
          });
        }
        
        // Order delivery event
        if (order.deliveryDate && order.deliveryDate >= start && order.deliveryDate <= end) {
          events.push({
            id: `order-delivery-${order.id}`,
            title: `Delivery: ${order.orderNumber}`,
            date: order.deliveryDate.toISOString(),
            type: CalendarEventType.DELIVERY,
            status: order.status,
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              action: 'delivery',
            },
          });
        }
      });
      
      return events;
    } catch (error) {
      this.logger.error(`Error fetching order events: ${error.message}`, error.stack);
      return [];
    }
  }
  
  /**
   * Get events from payments
   */
  private async getPaymentEvents(start: Date, end: Date): Promise<CalendarEventDto[]> {
    try {
      const payments = await this.paymentRepository.find({
        where: {
          createdAt: Between(start, end),
        },
        relations: ['order'],
        select: ['id', 'amount', 'status', 'createdAt'],
      });
      
      return payments.map(payment => ({
        id: `payment-${payment.id}`,
        title: payment.order 
          ? `Payment for ${payment.order.orderNumber}`
          : `Payment #${payment.id.substring(0, 8)}`,
        date: payment.createdAt.toISOString(),
        type: CalendarEventType.PAYMENT,
        status: payment.status,
        amount: payment.amount,
        entityId: payment.id,
        metadata: {
          orderId: payment.order?.id,
          orderNumber: payment.order?.orderNumber,
        },
      }));
    } catch (error) {
      this.logger.error(`Error fetching payment events: ${error.message}`, error.stack);
      return [];
    }
  }
  
  /**
   * Get events from work orders
   */
  private async getWorkOrderEvents(start: Date, end: Date): Promise<CalendarEventDto[]> {
    try {
      const workOrders = await this.workOrderRepository.find({
        where: [
          { createdAt: Between(start, end) },
          { startTime: Between(start, end) },
          { endTime: Between(start, end) },
        ],
        relations: ['order'],
        select: ['id', 'workOrderNumber', 'status', 'createdAt', 'startTime', 'endTime', 'assignedTo'],
      });
      
      const events: CalendarEventDto[] = [];
      
      workOrders.forEach(workOrder => {
        // Work order creation
        if (workOrder.createdAt >= start && workOrder.createdAt <= end) {
          events.push({
            id: `work-order-created-${workOrder.id}`,
            title: `Work Order: ${workOrder.workOrderNumber}`,
            date: workOrder.createdAt.toISOString(),
            type: CalendarEventType.WORK_ORDER,
            status: workOrder.status,
            entityId: workOrder.id,
            metadata: {
              workOrderNumber: workOrder.workOrderNumber,
              orderNumber: workOrder.order?.orderNumber,
              assignedTo: workOrder.assignedTo,
              action: 'created',
            },
          });
        }
        
        // Work order start
        if (workOrder.startTime && workOrder.startTime >= start && workOrder.startTime <= end) {
          events.push({
            id: `work-order-start-${workOrder.id}`,
            title: `Start: ${workOrder.workOrderNumber}`,
            date: workOrder.startTime.toISOString(),
            type: CalendarEventType.WORK_ORDER,
            status: workOrder.status,
            entityId: workOrder.id,
            metadata: {
              workOrderNumber: workOrder.workOrderNumber,
              orderNumber: workOrder.order?.orderNumber,
              assignedTo: workOrder.assignedTo,
              action: 'start',
            },
          });
        }
        
        // Work order end
        if (workOrder.endTime && workOrder.endTime >= start && workOrder.endTime <= end) {
          events.push({
            id: `work-order-end-${workOrder.id}`,
            title: `Complete: ${workOrder.workOrderNumber}`,
            date: workOrder.endTime.toISOString(),
            type: CalendarEventType.WORK_ORDER,
            status: workOrder.status,
            entityId: workOrder.id,
            metadata: {
              workOrderNumber: workOrder.workOrderNumber,
              orderNumber: workOrder.order?.orderNumber,
              assignedTo: workOrder.assignedTo,
              action: 'complete',
            },
          });
        }
      });
      
      return events;
    } catch (error) {
      this.logger.error(`Error fetching work order events: ${error.message}`, error.stack);
      return [];
    }
  }
} 
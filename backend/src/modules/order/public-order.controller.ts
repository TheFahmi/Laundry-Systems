import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { TrackOrderDto, TrackOrderResponseDto } from './dto/track-order.dto';
import { Public } from '../auth/decorators/public.decorator';
import { OrderStatus } from './entities/order.entity';

@ApiTags('public/orders')
@Controller('public/orders')
export class PublicOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('track')
  @Public()
  @ApiOperation({ summary: 'Track an order by order number' })
  @ApiResponse({ status: 200, description: 'Return the order tracking information', type: TrackOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid order number format' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrder(@Body() trackOrderDto: TrackOrderDto): Promise<TrackOrderResponseDto> {
    try {
      // Validate order number format
      const orderNumberRegex = /^ORD-\d{8}-\d{5}$/;
      if (!orderNumberRegex.test(trackOrderDto.orderNumber)) {
        throw new BadRequestException('Invalid order number format. Expected format: ORD-YYYYMMDD-XXXXX');
      }

      // Get order details
      const order = await this.orderService.findByOrderNumber(trackOrderDto.orderNumber);
      
      // Check if order has payments
      const paymentStatus = order.payments && order.payments.length > 0 
        ? order.payments.every(p => p.status === 'completed') ? 'completed' : 'partial'
        : 'pending';

      // Calculate estimated delivery date if not set in database
      let deliveryDate = order.deliveryDate;
      
      if (!deliveryDate) {
        // Get the maximum processing time from order items
        let maxProcessingDays = 2; // Default 2 days
        
        if (order.items && order.items.length > 0) {
          // Find service with longest processing time
          for (const item of order.items) {
            const serviceDuration = this.getServiceProcessingDays(item.serviceName);
            if (serviceDuration > maxProcessingDays) {
              maxProcessingDays = serviceDuration;
            }
          }
        }
        
        // Calculate estimated date based on order creation date
        const estimatedDate = new Date(order.createdAt);
        estimatedDate.setDate(estimatedDate.getDate() + maxProcessingDays);
        
        // Adjust based on current status
        if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.WASHING) {
          // Reduce estimate by 1 day if already processing
          estimatedDate.setDate(estimatedDate.getDate() - 1);
        } else if (order.status === OrderStatus.DRYING || order.status === OrderStatus.FOLDING) {
          // Reduce estimate further if already in later stages
          estimatedDate.setDate(estimatedDate.getDate() - 1.5);
        } else if (order.status === OrderStatus.READY || order.status === OrderStatus.DELIVERED) {
          // If ready or delivered, use current date
          estimatedDate.setDate(new Date().getDate());
        }
        
        deliveryDate = estimatedDate;
      }

      // Return formatted response
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || 'Customer',
        status: order.status,
        totalAmount: +order.totalAmount,
        createdAt: order.createdAt,
        deliveryDate: deliveryDate,
        paymentStatus: paymentStatus
      };
    } catch (error) {
      if (error.status === 404) {
        throw new BadRequestException('Order not found');
      }
      throw error;
    }
  }
  
  /**
   * Helper method to get the processing time for a service in days
   */
  private getServiceProcessingDays(serviceName: string): number {
    // Map service names to processing times in days
    const serviceMap: Record<string, number> = {
      'Cuci Reguler': 2,
      'Cuci Setrika Reguler': 2,
      'Cuci Express': 1,
      'Cuci Setrika Express': 1, 
      'Dry Cleaning': 3,
      'Premium Laundry': 2.5,
      'Cuci Selimut/Bed Cover': 3,
      'Cuci Sepatu': 2
    };
    
    // Try to match exactly, if not found, try partial matching
    if (serviceMap[serviceName] !== undefined) {
      return serviceMap[serviceName];
    }
    
    // Partial matching
    if (serviceName.includes('Express')) return 1;
    if (serviceName.includes('Dry Cleaning')) return 3;
    if (serviceName.includes('Premium')) return 2.5;
    if (serviceName.includes('Selimut') || serviceName.includes('Bed Cover')) return 3;
    if (serviceName.includes('Sepatu')) return 2;
    
    // Default case
    return 2;
  }
} 
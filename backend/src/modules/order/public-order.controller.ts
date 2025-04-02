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

      // Get order details with all relations
      const order = await this.orderService.findByOrderNumber(trackOrderDto.orderNumber);
      
      // Check if order has payments
      const paymentStatus = order.payments && order.payments.length > 0 
        ? order.payments.every(p => p.status === 'completed') ? 'completed' : 'partial'
        : 'pending';

      // Calculate estimated delivery date if not set in database
      let deliveryDate = order.deliveryDate;
      
      if (!deliveryDate) {
        // Default processing time
        let maxProcessingDays = 2; // Default: 2 days
        
        console.log('Calculating delivery date from order items...');
        
        // Verify order has items
        if (order.items && order.items.length > 0) {
          console.log(`Found ${order.items.length} items in order`);
          
          // Log all service names for debugging
          const serviceNames = order.items.map(item => item.serviceName || 'Unknown service');
          console.log('Services in order:', serviceNames);
          
          // Find the service with the longest processing time
          for (const item of order.items) {
            // Skip items without serviceName
            if (!item.serviceName) {
              console.log('Item has no service name, skipping');
              continue;
            }
            
            const serviceDuration = this.getServiceProcessingDays(item.serviceName);
            console.log(`Service "${item.serviceName}" has duration: ${serviceDuration} days`);
            
            if (serviceDuration > maxProcessingDays) {
              maxProcessingDays = serviceDuration;
              console.log(`New max processing time: ${maxProcessingDays} days from "${item.serviceName}"`);
            }
          }
        } else {
          console.log('No items found in order, using default processing time');
        }
        
        console.log(`Final max processing time: ${maxProcessingDays} days`);
        
        // Calculate estimated date based on order creation date
        const estimatedDate = new Date(order.createdAt);
        estimatedDate.setDate(estimatedDate.getDate() + maxProcessingDays);
        
        // Adjust based on current status
        if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.WASHING) {
          // If already processing, reduce the estimate (assume 1 day already passed)
          const adjustedDate = new Date(estimatedDate);
          adjustedDate.setDate(adjustedDate.getDate() - 1);
          console.log(`Order is in ${order.status} status, adjusting date by -1 day`);
          deliveryDate = adjustedDate;
        } else if (order.status === OrderStatus.DRYING || order.status === OrderStatus.FOLDING) {
          // If in later stages, reduce more (assume 1.5 days already passed)
          const adjustedDate = new Date(estimatedDate);
          // Set hours for half-day calculations
          adjustedDate.setHours(adjustedDate.getHours() - 36); // 1.5 days = 36 hours
          console.log(`Order is in ${order.status} status, adjusting date by -1.5 days`);
          deliveryDate = adjustedDate;
        } else if (order.status === OrderStatus.READY || order.status === OrderStatus.DELIVERED) {
          // If ready or delivered, use current date
          console.log(`Order is ${order.status}, using current date`);
          deliveryDate = new Date();
        } else {
          // New orders get the full estimated time
          console.log(`Order is ${order.status}, using full estimated time`);
          deliveryDate = estimatedDate;
        }
      } else {
        console.log('Using delivery date from database:', deliveryDate);
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
        paymentStatus: paymentStatus,
        items: order.items ? order.items.map(item => ({
          id: item.id,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })) : []
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      if (error.status === 404) {
        throw new BadRequestException('Order not found');
      }
      throw error;
    }
  }
  
  /**
   * Helper method to get the processing time for a service in days
   * This maps service names to their processing times
   */
  private getServiceProcessingDays(serviceName: string): number {
    // Map common service names to processing times in days
    const serviceMap: Record<string, number> = {
      // Regular services (2 days)
      'Cuci Reguler': 2,
      'Cuci Setrika Reguler': 2,
      'Cuci Kering Reguler': 2,
      'Laundry Regular': 2,
      'Regular Wash': 2,
      'Regular Wash & Iron': 2,
      
      // Express services (1 day)
      'Cuci Express': 1,
      'Cuci Setrika Express': 1,
      'Express Laundry': 1,
      'Express Wash': 1,
      'Express Wash & Iron': 1,
      
      // Super express services (0.5 day / 12 hours)
      'Cuci Super Express': 0.5,
      'Super Express': 0.5,
      'Same Day Service': 0.5,
      
      // Special services (3 days)
      'Dry Cleaning': 3,
      'Premium Laundry': 2.5,
      'Cuci Selimut': 3,
      'Cuci Bed Cover': 3,
      'Cuci Karpet': 3,
      'Cuci Gorden': 3,
      'Cuci Sepatu': 2,
      'Cuci Tas': 2.5
    };
    
    // Try to match exactly, if not found, try partial matching
    if (serviceMap[serviceName] !== undefined) {
      return serviceMap[serviceName];
    }
    
    // Partial matching for generic service types
    const serviceNameLower = serviceName.toLowerCase();
    
    if (serviceNameLower.includes('express') && serviceNameLower.includes('super')) return 0.5;
    if (serviceNameLower.includes('express')) return 1;
    if (serviceNameLower.includes('dry cleaning')) return 3;
    if (serviceNameLower.includes('premium')) return 2.5;
    if (serviceNameLower.includes('selimut') || serviceNameLower.includes('bed cover')) return 3;
    if (serviceNameLower.includes('karpet') || serviceNameLower.includes('carpet')) return 3;
    if (serviceNameLower.includes('gorden') || serviceNameLower.includes('curtain')) return 3;
    if (serviceNameLower.includes('sepatu') || serviceNameLower.includes('shoes')) return 2;
    if (serviceNameLower.includes('tas') || serviceNameLower.includes('bag')) return 2.5;
    
    // Default case - if no match found, assume regular service (2 days)
    console.log(`No match found for service: "${serviceName}", using default (2 days)`);
    return 2;
  }
} 
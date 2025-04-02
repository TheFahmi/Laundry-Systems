import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { TrackOrderDto, TrackOrderResponseDto } from './dto/track-order.dto';
import { Public } from '../auth/decorators/public.decorator';

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

      // Return formatted response
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || 'Customer',
        status: order.status,
        totalAmount: +order.totalAmount,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate,
        paymentStatus: paymentStatus
      };
    } catch (error) {
      if (error.status === 404) {
        throw new BadRequestException('Order not found');
      }
      throw error;
    }
  }
} 
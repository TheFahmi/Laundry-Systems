import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import { CalendarEventDto, CalendarQueryDto } from './dto/calendar.dto';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({
    summary: 'Get calendar events',
    description: 'Returns events for the calendar view filtered by date range and type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for events (ISO 8601 format)',
    example: '2024-03-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for events (ISO 8601 format)',
    example: '2024-03-31',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Event type filter (order, payment, work-order, or delivery)',
    example: 'work-order',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [CalendarEventDto],
  })
  async getEvents(@Query() query: CalendarQueryDto): Promise<{ data: CalendarEventDto[] }> {
    const events = await this.calendarService.getEvents(query);
    return { data: events };
  }
} 
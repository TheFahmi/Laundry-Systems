import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ReportService } from './report.service';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  private readonly logger = new Logger(ReportController.name);
  
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({
    summary: 'Generate a business report',
    description: 'Generates a comprehensive business report including revenue, orders, and service statistics',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for custom report (ISO 8601 format)',
    example: '2024-03-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for custom report (ISO 8601 format)',
    example: '2024-03-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'reportType',
    required: false,
    enum: ReportType,
    description: 'Type of report to generate',
    example: ReportType.MONTHLY,
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        period: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date-time' },
            end: { type: 'string', format: 'date-time' },
          },
        },
        totalOrders: { type: 'number', example: 150 },
        totalRevenue: { type: 'number', example: 7500000 },
        totalWeight: { type: 'number', example: 300.5 },
        averageOrderValue: { type: 'number', example: 50000 },
        topServices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              serviceName: { type: 'string', example: 'Cuci Express' },
              totalOrders: { type: 'number', example: 45 },
              totalRevenue: { type: 'number', example: 2250000 },
              totalWeight: { type: 'number', example: 150.5 },
            },
          },
        },
        dailyRevenue: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2024-03-01' },
              revenue: { type: 'number', example: 250000 },
              orders: { type: 'number', example: 5 },
              weight: { type: 'number', example: 10.5 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Start date and end date are required for custom reports' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
      },
    },
  })
  async generateReport(@Query() generateReportDto: GenerateReportDto) {
    try {
      this.logger.log(`Generating report with params: ${JSON.stringify(generateReportDto)}`);
      const reportData = await this.reportService.generateReport(generateReportDto);
      this.logger.debug('Report data generated successfully');
      
      // Return data in a consistent format
      return {
        data: reportData,
        statusCode: 200,
        message: 'Success',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
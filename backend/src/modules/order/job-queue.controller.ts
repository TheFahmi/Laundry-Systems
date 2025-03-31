import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { JobQueueService } from './job-queue.service';
import { DailyJobQueue } from './entities/daily-job-queue.entity';
import { CreateJobQueueDto, UpdateJobQueueDto, DailyJobQueueQueryDto, PrintJobQueueDto } from './dto/job-queue.dto';

@ApiTags('job-queue')
@Controller('job-queue')
@UseGuards(JwtAuthGuard)
export class JobQueueController {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job queue entry' })
  @ApiResponse({ status: 201, description: 'The job queue entry has been created successfully.' })
  create(@Body() createJobQueueDto: CreateJobQueueDto): Promise<DailyJobQueue> {
    return this.jobQueueService.create(createJobQueueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job queue entries for a specific date' })
  @ApiResponse({ status: 200, description: 'Return job queue entries for the specified date.' })
  async findAll(@Query() query: DailyJobQueueQueryDto): Promise<{ data: DailyJobQueue[] }> {
    const items = await this.jobQueueService.findAll(query.date);
    return { data: items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job queue entry by ID' })
  @ApiResponse({ status: 200, description: 'Return the job queue entry.' })
  findOne(@Param('id') id: string): Promise<DailyJobQueue> {
    return this.jobQueueService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job queue entry' })
  @ApiResponse({ status: 200, description: 'The job queue entry has been updated successfully.' })
  update(
    @Param('id') id: string,
    @Body() updateJobQueueDto: UpdateJobQueueDto
  ): Promise<DailyJobQueue> {
    return this.jobQueueService.update(id, updateJobQueueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job queue entry' })
  @ApiResponse({ status: 200, description: 'The job queue entry has been deleted successfully.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.jobQueueService.remove(id);
  }

  @Get('print/daily')
  @ApiOperation({ summary: 'Get job queue data for printing' })
  @ApiResponse({ status: 200, description: 'Return job queue data formatted for printing.' })
  async getForPrinting(@Query() query: PrintJobQueueDto): Promise<{ data: any[] }> {
    const items = await this.jobQueueService.getJobQueueForPrinting(query.date, query.status);
    return { data: items };
  }
} 
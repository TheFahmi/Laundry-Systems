import { IsOptional, IsString, IsDateString, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Start date for the report period',
    required: false,
    type: String,
    format: 'date-time',
    example: '2024-03-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.reportType === ReportType.CUSTOM)
  startDate?: string;

  @ApiProperty({
    description: 'End date for the report period',
    required: false,
    type: String,
    format: 'date-time',
    example: '2024-03-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.reportType === ReportType.CUSTOM)
  endDate?: string;

  @ApiProperty({
    description: 'Type of report to generate',
    required: false,
    enum: ReportType,
    enumName: 'ReportType',
    example: ReportType.MONTHLY,
  })
  @IsOptional()
  @IsEnum(ReportType, {
    message: 'reportType must be one of: daily, weekly, monthly, custom',
  })
  reportType?: ReportType;
} 
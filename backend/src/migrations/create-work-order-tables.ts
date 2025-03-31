import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkOrderTables1712026999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create work_orders table
    await queryRunner.createTable(
      new Table({
        name: 'work_orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            name: 'job_queue_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_order_number',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'completed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'assigned_to',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'int',
            default: 3,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'current_step',
            type: 'enum',
            enum: ['sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check'],
            isNullable: true,
            default: "'sorting'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create foreign key for order_id
    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      })
    );

    // Create foreign key for job_queue_id
    await queryRunner.createForeignKey(
      'work_orders',
      new TableForeignKey({
        columnNames: ['job_queue_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'daily_job_queues',
        onDelete: 'SET NULL',
      })
    );

    // Create work_order_steps table
    await queryRunner.createTable(
      new Table({
        name: 'work_order_steps',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'work_order_id',
            type: 'uuid',
          },
          {
            name: 'step_type',
            type: 'enum',
            enum: ['sorting', 'washing', 'drying', 'folding', 'ironing', 'packaging', 'quality_check'],
          },
          {
            name: 'sequence_number',
            type: 'int',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'completed', 'skipped'],
            default: "'pending'",
          },
          {
            name: 'assigned_to',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create foreign key for work_order_id
    await queryRunner.createForeignKey(
      'work_order_steps',
      new TableForeignKey({
        columnNames: ['work_order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'work_orders',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop work_order_steps table
    await queryRunner.dropTable('work_order_steps', true);
    
    // Drop work_orders table
    await queryRunner.dropTable('work_orders', true);
  }
} 
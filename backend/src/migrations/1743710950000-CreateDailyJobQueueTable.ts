import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDailyJobQueueTable1743710950000 implements MigrationInterface {
    name = 'CreateDailyJobQueueTable1743710950000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "daily_job_queues" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "order_id" uuid NOT NULL,
                "scheduled_date" date NOT NULL,
                "queue_position" integer NOT NULL,
                "estimated_completion_time" TIMESTAMP,
                "actual_completion_time" TIMESTAMP,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_daily_job_queues" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "daily_job_queues" 
            ADD CONSTRAINT "FK_daily_job_queues_orders" 
            FOREIGN KEY ("order_id") REFERENCES "orders"("id") 
            ON DELETE CASCADE
        `);
        
        // Create a unique constraint for order_id and scheduled_date
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_daily_job_queues_order_date" 
            ON "daily_job_queues" ("order_id", "scheduled_date")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_daily_job_queues_order_date"`);
        await queryRunner.query(`ALTER TABLE "daily_job_queues" DROP CONSTRAINT "FK_daily_job_queues_orders"`);
        await queryRunner.query(`DROP TABLE "daily_job_queues"`);
    }
} 
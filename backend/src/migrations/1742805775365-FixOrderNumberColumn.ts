import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOrderNumberColumn1742805775365 implements MigrationInterface {
    name = 'FixOrderNumberColumn1742805775365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Only check for the delivery_date column since the others already exist
        const deliveryDateExists = await queryRunner.hasColumn('orders', 'delivery_date');
        if (!deliveryDateExists) {
            await queryRunner.query(`ALTER TABLE "orders" ADD "delivery_date" TIMESTAMP NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove only the delivery_date column
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivery_date"`);
    }
} 
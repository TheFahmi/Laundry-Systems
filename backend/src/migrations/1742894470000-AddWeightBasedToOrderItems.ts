import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeightBasedToOrderItems1742894470000 implements MigrationInterface {
    name = 'AddWeightBasedToOrderItems1742894470000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add weight_based column to order_items table
        await queryRunner.query(`ALTER TABLE "order_items" ADD "weight_based" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove weight_based column from order_items table
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "weight_based"`);
    }
} 
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeightBasedColumnOnly1742894471000 implements MigrationInterface {
    name = 'AddWeightBasedColumnOnly1742894471000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to add it
        const columns = await queryRunner.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'weight_based'`
        );
        
        if (columns.length === 0) {
            await queryRunner.query(`ALTER TABLE "order_items" ADD "weight_based" boolean DEFAULT false`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists before trying to remove it
        const columns = await queryRunner.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'weight_based'`
        );
        
        if (columns.length > 0) {
            await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "weight_based"`);
        }
    }
} 
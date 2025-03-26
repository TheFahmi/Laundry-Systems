import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddMissingServiceColumns1711505600000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateCustomIdFormats1720281600000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}

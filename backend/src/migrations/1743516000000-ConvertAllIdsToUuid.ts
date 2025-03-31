import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class ConvertAllIdsToUuid1743516000000 implements MigrationInterface {
    name = 'ConvertAllIdsToUuid1743516000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Disabling this migration as it's causing issues
        console.log('This migration has been temporarily disabled to avoid UUID conversion errors.');
        return;
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Disabling this migration as it's causing issues
        console.log('This migration down method has been temporarily disabled.');
        return;
    }
} 
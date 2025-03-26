import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class ConsolidateFixScripts1711600000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private fixServiceColumns;
    private fixPaymentEnums;
    private fixOrderColumns;
    private fixEmptyPrices;
    private fixOrderItems;
    private fixOrderNumbers;
    private fixOrderTotals;
    private fixPaymentDisplay;
    private fixPaymentIDs;
    private fixReferenceNumbers;
    private fixRelations;
    private fixRemainingOrderColumns;
    private fixServiceCategory;
    private fixTotalAmounts;
    private fixTotalWeights;
    private fixTransactions;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingServiceColumns1711505600000 = void 0;
class AddMissingServiceColumns1711505600000 {
    async up(queryRunner) {
        const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
        if (!unitColumnExists) {
            await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "unit" VARCHAR(50) DEFAULT 'kg' NOT NULL
      `);
            console.log('Added "unit" column to services table');
        }
        const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
        if (!estimatedTimeColumnExists) {
            await queryRunner.query(`
        ALTER TABLE services 
        ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
      `);
            console.log('Added "estimatedTime" column to services table');
        }
    }
    async down(queryRunner) {
        const estimatedTimeColumnExists = await queryRunner.hasColumn('services', 'estimatedTime');
        if (estimatedTimeColumnExists) {
            await queryRunner.query(`ALTER TABLE services DROP COLUMN "estimatedTime"`);
        }
        const unitColumnExists = await queryRunner.hasColumn('services', 'unit');
        if (unitColumnExists) {
            await queryRunner.query(`ALTER TABLE services DROP COLUMN "unit"`);
        }
    }
}
exports.AddMissingServiceColumns1711505600000 = AddMissingServiceColumns1711505600000;
//# sourceMappingURL=1711505600000-AddMissingServiceColumns.js.map
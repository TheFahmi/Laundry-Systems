"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedServices = void 0;
const service_entity_1 = require("../../modules/service/entities/service.entity");
const uuid_1 = require("uuid");
const seedServices = async (dataSource) => {
    const serviceRepository = dataSource.getRepository(service_entity_1.Service);
    const existingCount = await serviceRepository.count();
    if (existingCount > 0) {
        console.log('Services already seeded, skipping...');
        return;
    }
    const defaultServices = [
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Setrika Regular',
            price: 7000,
            description: 'Layanan cuci dan setrika regular, estimasi 2-3 hari',
            isActive: true,
            estimatedTime: 3 * 24 * 60,
            category: 'Regular'
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Setrika Express',
            price: 12000,
            description: 'Layanan cuci dan setrika express, estimasi 1 hari',
            isActive: true,
            estimatedTime: 1 * 24 * 60,
            category: 'Express'
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Kering',
            price: 5000,
            description: 'Layanan cuci kering tanpa setrika',
            isActive: true,
            estimatedTime: 1 * 24 * 60,
            category: 'Regular'
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Sepatu',
            price: 35000,
            description: 'Layanan cuci sepatu, estimasi 2 hari',
            isActive: true,
            estimatedTime: 2 * 24 * 60,
            category: 'Special'
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Selimut',
            price: 30000,
            description: 'Layanan cuci selimut',
            isActive: true,
            estimatedTime: 3 * 24 * 60,
            category: 'Special'
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Cuci Gorden',
            price: 25000,
            description: 'Layanan cuci gorden',
            isActive: true,
            estimatedTime: 3 * 24 * 60,
            category: 'Special'
        },
    ];
    for (const serviceData of defaultServices) {
        await serviceRepository.save(serviceData);
    }
    console.log(`Seeded ${defaultServices.length} services successfully`);
};
exports.seedServices = seedServices;
//# sourceMappingURL=service.seed.js.map
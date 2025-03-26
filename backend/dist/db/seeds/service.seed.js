"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedServices = void 0;
const service_entity_1 = require("../../modules/service/entities/service.entity");
const service_category_entity_1 = require("../../modules/service-category/entities/service-category.entity");
const uuid_1 = require("uuid");
async function seedServices(dataSource) {
    const serviceRepository = dataSource.getRepository(service_entity_1.Service);
    const categoryRepository = dataSource.getRepository(service_category_entity_1.ServiceCategory);
    console.log('Starting service seed...');
    const count = await serviceRepository.count();
    if (count > 0) {
        console.log(`Database already has ${count} services. Skipping service seed.`);
        return;
    }
    const categories = await categoryRepository.find();
    let washCategory;
    let ironingCategory;
    let premiumCategory;
    if (categories.length === 0) {
        console.log('No service categories found. Creating categories first...');
        washCategory = categoryRepository.create({
            name: 'Cuci',
            description: 'Layanan cuci pakaian'
        });
        ironingCategory = categoryRepository.create({
            name: 'Setrika',
            description: 'Layanan setrika pakaian'
        });
        premiumCategory = categoryRepository.create({
            name: 'Premium',
            description: 'Layanan premium'
        });
        await categoryRepository.save([washCategory, ironingCategory, premiumCategory]);
        console.log('Service categories created.');
    }
    else {
        console.log('Using existing service categories.');
        washCategory = categories.find(c => c.name === 'Cuci') || categories[0];
        ironingCategory = categories.find(c => c.name === 'Setrika') || categories[0];
        premiumCategory = categories.find(c => c.name === 'Premium') || categories[0];
    }
    const services = [
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Cuci Kering',
            description: 'Layanan cuci kering untuk pakaian',
            price: 7000,
            unit: 'kg',
            estimatedTime: 24,
            isActive: true,
            categoryId: washCategory.id
        }),
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Cuci Setrika',
            description: 'Layanan cuci dan setrika pakaian',
            price: 10000,
            unit: 'kg',
            estimatedTime: 48,
            isActive: true,
            categoryId: washCategory.id
        }),
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Setrika',
            description: 'Layanan setrika untuk pakaian',
            price: 5000,
            unit: 'kg',
            estimatedTime: 24,
            isActive: true,
            categoryId: ironingCategory.id
        }),
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Dry Clean',
            description: 'Layanan dry clean untuk pakaian formal',
            price: 15000,
            unit: 'pcs',
            estimatedTime: 72,
            isActive: true,
            categoryId: premiumCategory.id
        }),
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Express Laundry',
            description: 'Layanan cuci kilat (6 jam)',
            price: 20000,
            unit: 'kg',
            estimatedTime: 6,
            isActive: true,
            categoryId: premiumCategory.id
        }),
        serviceRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Cuci Sepatu',
            description: 'Layanan cuci untuk sepatu',
            price: 25000,
            unit: 'pair',
            estimatedTime: 48,
            isActive: true,
            categoryId: washCategory.id
        })
    ];
    await serviceRepository.save(services);
    console.log(`Created ${services.length} services`);
}
exports.seedServices = seedServices;
//# sourceMappingURL=service.seed.js.map
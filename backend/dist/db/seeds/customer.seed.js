"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCustomers = void 0;
const customer_entity_1 = require("../../modules/customer/customer.entity");
const uuid_1 = require("uuid");
async function seedCustomers(dataSource) {
    const customerRepository = dataSource.getRepository(customer_entity_1.Customer);
    console.log('Starting customer seed...');
    const count = await customerRepository.count();
    if (count > 0) {
        console.log(`Database already has ${count} customers. Skipping customer seed.`);
        return;
    }
    const customers = [
        customerRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'John Doe',
            phone: '081234567890',
            address: 'Jl. Sudirman No. 123, Jakarta',
            email: 'john.doe@example.com'
        }),
        customerRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Jane Smith',
            phone: '085678901234',
            address: 'Jl. Thamrin No. 456, Jakarta',
            email: 'jane.smith@example.com'
        }),
        customerRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Ahmad Rahman',
            phone: '089876543210',
            address: 'Jl. Gatot Subroto No. 789, Jakarta',
            email: 'ahmad.rahman@example.com'
        }),
        customerRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Siti Aminah',
            phone: '087654321098',
            address: 'Jl. Kuningan No. 111, Jakarta',
            email: 'siti.aminah@example.com'
        }),
        customerRepository.create({
            id: (0, uuid_1.v4)(),
            name: 'Budi Santoso',
            phone: '082345678901',
            address: 'Jl. Menteng No. 222, Jakarta',
            email: 'budi.santoso@example.com'
        })
    ];
    await customerRepository.save(customers);
    console.log(`Created ${customers.length} customers`);
}
exports.seedCustomers = seedCustomers;
//# sourceMappingURL=customer.seed.js.map
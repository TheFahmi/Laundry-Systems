"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const payment_entity_1 = require("../payment/entities/payment.entity");
const service_entity_1 = require("../service/entities/service.entity");
const uuid_1 = require("uuid");
let OrderService = class OrderService {
    constructor(orderRepository, paymentRepository, orderItemRepository, serviceRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.orderItemRepository = orderItemRepository;
        this.serviceRepository = serviceRepository;
    }
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `ORD-${year}${month}${day}-${random}`;
    }
    async create(createOrderDto) {
        try {
            console.log('Starting order creation with data:', JSON.stringify(createOrderDto));
            const orderId = (0, uuid_1.v4)();
            console.log('Generated order ID:', orderId);
            const orderNumber = await this.generateOrderNumber();
            console.log('Generated order number:', orderNumber);
            let totalAmount = createOrderDto.totalAmount;
            if (createOrderDto.total !== undefined) {
                totalAmount = createOrderDto.total;
            }
            if (!totalAmount && createOrderDto.items && Array.isArray(createOrderDto.items)) {
                totalAmount = this.calculateTotalAmount(createOrderDto.items);
            }
            totalAmount = totalAmount || 0;
            console.log('Calculated total amount:', totalAmount);
            const orderData = {
                id: orderId,
                orderNumber,
                customerId: createOrderDto.customerId,
                status: order_entity_1.OrderStatus.NEW,
                totalAmount,
                totalWeight: 0,
                notes: createOrderDto.notes || '',
                specialRequirements: createOrderDto.specialRequirements || '',
                pickupDate: createOrderDto.pickupDate || null,
                deliveryDate: createOrderDto.deliveryDate || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
                const totalWeight = createOrderDto.items.reduce((sum, item) => {
                    if (item.weightBased) {
                        const weight = parseFloat(String(item.weight || item.quantity || '0').replace(',', '.'));
                        return sum + (isNaN(weight) ? 0 : weight);
                    }
                    return sum;
                }, 0);
                orderData.totalWeight = totalWeight;
                console.log(`Calculated total weight for order: ${totalWeight} kg`);
            }
            console.log('Creating order with data:', JSON.stringify(orderData));
            const order = this.orderRepository.create(orderData);
            console.log('Saving order to database...');
            const savedOrder = await this.orderRepository.save(order);
            console.log('Order saved successfully with ID:', savedOrder.id);
            let items = [];
            if (createOrderDto.items && Array.isArray(createOrderDto.items)) {
                console.log('Processing order items:', JSON.stringify(createOrderDto.items));
                for (const item of createOrderDto.items) {
                    const { weightBased, ...itemData } = item;
                    try {
                        let serviceName = itemData.serviceName;
                        if (!serviceName && itemData.serviceId) {
                            try {
                                const serviceId = String(itemData.serviceId);
                                const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
                                if (service) {
                                    serviceName = service.name;
                                    console.log(`Found service name from database: ${serviceName} for ID: ${serviceId}`);
                                }
                            }
                            catch (serviceError) {
                                console.error(`Error finding service name for ID ${itemData.serviceId}:`, serviceError);
                                serviceName = `Service ${itemData.serviceId}`;
                            }
                        }
                        let quantity;
                        let actualQuantity;
                        if (weightBased) {
                            const rawWeight = parseFloat(String(itemData.weight || itemData.quantity || 0.5).replace(',', '.'));
                            const itemWeight = Math.max(rawWeight, 0.1);
                            quantity = 1;
                            savedOrder.totalWeight = Number((parseFloat(savedOrder.totalWeight.toString()) + itemWeight).toFixed(2));
                            await this.orderRepository.save(savedOrder);
                            console.log(`Processing WEIGHT-BASED item: ${rawWeight} kg → ${itemWeight} kg (stored as weight)`);
                            console.log(`Updated order totalWeight to: ${savedOrder.totalWeight} kg`);
                            const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
                            const subtotal = price * itemWeight;
                            const result = await this.orderItemRepository.query(`INSERT INTO order_items 
                (order_id, service_id, service_name, quantity, weight, price, subtotal, unit_price, total_price, notes, created_at, updated_at) 
                VALUES($1, $2, $3, $4::decimal, $5::decimal, $6::decimal, $7::decimal, $8::decimal, $9::decimal, $10, NOW(), NOW()) 
                RETURNING *`, [
                                savedOrder.id,
                                String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'),
                                serviceName,
                                quantity.toString(),
                                itemWeight.toString(),
                                price.toString(),
                                subtotal.toString(),
                                price.toString(),
                                subtotal.toString(),
                                `Weight: ${itemWeight} kg`
                            ]);
                            console.log(`Created weight-based item using raw query:`, result && result[0] ? result[0] : 'No result');
                            if (result && result.length > 0) {
                                const savedItem = this.orderItemRepository.create(result[0]);
                                items.push(savedItem);
                            }
                        }
                        else {
                            const parsedQuantity = parseInt(String(itemData.quantity || 1));
                            quantity = Math.max(parsedQuantity, 1);
                            actualQuantity = quantity;
                            console.log(`Processing PIECE-BASED item: ${quantity} pcs`);
                            const price = parseFloat(String(itemData.price || 0).replace(',', '.'));
                            const subtotal = price * quantity;
                            const orderItem = this.orderItemRepository.create({
                                orderId: savedOrder.id,
                                serviceId: String(itemData.serviceId || '00000000-0000-0000-0000-000000000000'),
                                serviceName: serviceName,
                                quantity,
                                price,
                                subtotal,
                                unitPrice: price,
                                totalPrice: subtotal,
                                notes: null
                            });
                            const savedItem = await this.orderItemRepository.save(orderItem);
                            console.log(`Saved piece-based item:`, savedItem);
                            items.push(savedItem);
                        }
                    }
                    catch (itemError) {
                        console.error(`Error saving order item:`, itemError);
                        throw new common_1.BadRequestException(`Failed to create order item: ${itemError.message}`);
                    }
                }
                savedOrder.items = items;
            }
            if (createOrderDto.payment) {
                try {
                    console.log('Creating payment record with data:', JSON.stringify(createOrderDto.payment));
                    const paymentId = (0, uuid_1.v4)();
                    const payment = this.paymentRepository.create({
                        id: paymentId,
                        orderId: savedOrder.id,
                        customerId: savedOrder.customerId,
                        amount: createOrderDto.payment.amount,
                        paymentMethod: createOrderDto.payment.method,
                        status: payment_entity_1.PaymentStatus.COMPLETED,
                        notes: `Payment for order ${savedOrder.orderNumber}`,
                        transactionId: `CHANGE-${createOrderDto.payment.change}`
                    });
                    await this.paymentRepository.save(payment);
                    console.log('Payment record created successfully with ID:', payment.id);
                }
                catch (paymentError) {
                    console.error('Error creating payment record:', paymentError);
                }
            }
            return { data: savedOrder };
        }
        catch (error) {
            console.error(`Error creating order:`, error);
            console.error('Error stack:', error.stack);
            throw new common_1.BadRequestException(`Failed to create order: ${error.message}`);
        }
    }
    calculateTotalAmount(items) {
        if (!items || !Array.isArray(items))
            return 0;
        console.log("Calculating total amount from:", items);
        return items.reduce((total, item) => {
            if (item.weightBased) {
                const weight = parseFloat(String(item.weight || item.quantity || 0.5).replace(',', '.'));
                const price = parseFloat(String(item.price || 0).replace(',', '.'));
                const itemTotal = price * weight;
                console.log(`Weight-based item subtotal: Price ${price} × Weight ${weight} = ${itemTotal}`);
                return total + Number(itemTotal);
            }
            const quantity = parseInt(String(item.quantity || 1));
            const price = parseFloat(String(item.price || 0).replace(',', '.'));
            const itemTotal = price * quantity;
            console.log(`Piece-based item subtotal: Price ${price} × Quantity ${quantity} = ${itemTotal}`);
            return total + Number(itemTotal);
        }, 0);
    }
    async findAll({ page = 1, limit = 10, status }) {
        const query = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.items', 'orderItems')
            .leftJoinAndSelect('orderItems.service', 'service')
            .select([
            'order',
            'customer',
            'orderItems.id',
            'orderItems.orderId',
            'orderItems.serviceId',
            'orderItems.serviceName',
            'orderItems.quantity',
            'orderItems.weight',
            'orderItems.unitPrice',
            'orderItems.totalPrice',
            'orderItems.createdAt',
            'orderItems.updatedAt',
            'service'
        ]);
        if (status) {
            query.andWhere('order.status = :status', { status });
        }
        const [items, total] = await query
            .orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.service', 'payments'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.orderRepository.findOne({
            where: { orderNumber },
            relations: ['customer', 'items', 'items.service', 'payments'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with order number ${orderNumber} not found`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        const { items, ...orderData } = updateOrderDto;
        this.orderRepository.merge(order, orderData);
        const updatedOrder = await this.orderRepository.save(order);
        if (items && items.length > 0) {
            await this.orderItemRepository.delete({ orderId: id });
            const orderItems = items.map(item => this.orderItemRepository.create({
                orderId: id,
                serviceId: String(item.serviceId || '00000000-0000-0000-0000-000000000000'),
                serviceName: item.serviceName || `Service ${item.serviceId || 'Unknown'}`,
                quantity: item.quantity,
                price: item.price || 0,
                subtotal: (item.price || 0) * item.quantity,
                unitPrice: item.price || 0,
                totalPrice: (item.price || 0) * item.quantity
            }));
            const savedItems = await this.orderItemRepository.save(orderItems);
            updatedOrder.items = savedItems;
        }
        return updatedOrder;
    }
    async updateStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        return this.orderRepository.save(order);
    }
    async remove(id) {
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
    }
    async createDefaultPayment(order) {
        try {
            const totalAmount = this.calculateTotalAmount(order.items);
            const paymentId = (0, uuid_1.v4)();
            const payment = this.paymentRepository.create({
                id: paymentId,
                orderId: order.id,
                customerId: order.customerId,
                amount: totalAmount,
                paymentMethod: payment_entity_1.PaymentMethod.CASH,
                status: payment_entity_1.PaymentStatus.PENDING,
                transactionId: `TRX-${Date.now()}`
            });
            return await this.paymentRepository.save(payment);
        }
        catch (error) {
            console.error('Error creating default payment:', error);
            return null;
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(3, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
//# sourceMappingURL=order.service.js.map
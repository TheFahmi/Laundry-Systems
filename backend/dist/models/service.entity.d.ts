export declare enum PriceModel {
    PER_KG = "per_kg",
    PER_PIECE = "per_piece",
    FLAT_RATE = "flat_rate"
}
export declare class Service {
    id: string;
    name: string;
    description: string;
    price: number;
    priceModel: PriceModel;
    isActive: boolean;
    processingTimeHours: number;
    category: string;
    additionalRequirements: any;
    createdAt: Date;
    updatedAt: Date;
}

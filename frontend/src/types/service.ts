// Enum for service price models
export enum ServicePriceModel {
  PER_UNIT = 'per_unit',
  PER_KG = 'per_kg',
  PER_PIECE = 'per_piece',
  FLAT_RATE = 'flat_rate'
}

// Enum for service categories
export enum ServiceCategory {
  UNCATEGORIZED = 'uncategorized',
  CUCI = 'cuci',
  SETRIKA = 'setrika',
  LAUNDRY = 'laundry',
  DRY_CLEAN = 'dry clean',
  EXPRESS = 'express',
  PREMIUM = 'premium',
  LAINNYA = 'lainnya'
}

// Service interface
export interface Service {
  id?: string;
  name: string;
  description?: string;
  price: number;
  priceModel?: ServicePriceModel;
  estimatedTime?: number; // in hours
  processingTimeHours?: number; // explicitly from API
  category?: string;
  isActive?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy properties for backward compatibility
  priceUnit?: 'item' | 'kg';
  estimatedDuration?: number;
  unit?: string;
}

// Default services
export const defaultServices: Partial<Service>[] = [
  {
    name: 'Cuci Reguler',
    description: 'Layanan cuci standar dengan pengeringan',
    price: 7000,
    priceModel: ServicePriceModel.PER_KG,
    estimatedTime: 24,
    category: ServiceCategory.CUCI
  },
  {
    name: 'Cuci Express',
    description: 'Layanan cuci cepat, selesai dalam 6 jam',
    price: 12000,
    priceModel: ServicePriceModel.PER_KG,
    estimatedTime: 6,
    category: ServiceCategory.CUCI
  },
  {
    name: 'Setrika',
    description: 'Layanan setrika untuk pakaian',
    price: 5000,
    priceModel: ServicePriceModel.PER_KG,
    estimatedTime: 24,
    category: ServiceCategory.SETRIKA
  },
  {
    name: 'Cuci Setrika',
    description: 'Layanan cuci dan setrika lengkap',
    price: 10000,
    priceModel: ServicePriceModel.PER_KG,
    estimatedTime: 48,
    category: ServiceCategory.CUCI
  },
  {
    name: 'Dry Cleaning',
    description: 'Layanan cuci kering untuk pakaian khusus',
    price: 20000,
    priceModel: ServicePriceModel.PER_PIECE,
    estimatedTime: 72,
    category: ServiceCategory.PREMIUM
  },
  {
    name: 'Cuci Sepatu',
    description: 'Layanan cuci khusus untuk sepatu',
    price: 35000,
    priceModel: ServicePriceModel.PER_PIECE,
    estimatedTime: 24,
    category: ServiceCategory.LAINNYA
  },
  {
    name: 'Cuci Tas',
    description: 'Layanan cuci khusus untuk tas',
    price: 50000,
    priceModel: ServicePriceModel.PER_PIECE,
    estimatedTime: 48,
    category: ServiceCategory.LAINNYA
  }
];

// Category labels in Indonesian
export const categoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.UNCATEGORIZED]: 'Tanpa Kategori',
  [ServiceCategory.CUCI]: 'Cuci',
  [ServiceCategory.SETRIKA]: 'Setrika',
  [ServiceCategory.LAUNDRY]: 'Laundry',
  [ServiceCategory.DRY_CLEAN]: 'Dry Clean',
  [ServiceCategory.EXPRESS]: 'Express',
  [ServiceCategory.PREMIUM]: 'Premium',
  [ServiceCategory.LAINNYA]: 'Lainnya'
};

// Price model labels in Indonesian
export const priceModelLabels: Record<ServicePriceModel, string> = {
  [ServicePriceModel.PER_UNIT]: 'Per Unit',
  [ServicePriceModel.PER_KG]: 'Per Kilogram',
  [ServicePriceModel.PER_PIECE]: 'Per Item',
  [ServicePriceModel.FLAT_RATE]: 'Harga Tetap'
}; 
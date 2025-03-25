import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: 'item' | 'kg';
  estimatedDuration: number; // dalam jam
  category: string;
  imageUrl?: string;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  priceUnit: 'item' | 'kg';
  subtotal: number;
}

export interface DeliveryDetails {
  type: 'pickup' | 'delivery';
  address?: string;
  date: Date;
  timeSlot: string;
  notes?: string;
}

export type OrderStatus = 
  | 'draft'
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'in-delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id?: string;
  customerId?: string;
  items: OrderItem[];
  delivery: DeliveryDetails;
  status: OrderStatus;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderState {
  currentOrder: Order;
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;

  // Aksi untuk order saat ini
  addItem: (service: Service, quantity: number) => void;
  removeItem: (serviceId: string) => void;
  updateItemQuantity: (serviceId: string, quantity: number) => void;
  setDeliveryDetails: (details: DeliveryDetails) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'transfer') => void;
  resetCurrentOrder: () => void;
  calculateTotal: () => void;

  // Aksi untuk order di server
  placeOrder: () => Promise<void>;
  fetchOrderHistory: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

// Initial state untuk order
const initialOrder: Order = {
  items: [],
  delivery: {
    type: 'pickup',
    date: new Date(),
    timeSlot: '09:00 - 12:00',
  },
  status: 'draft',
  total: 0,
};

// Membuat store Zustand
export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        currentOrder: { ...initialOrder },
        orderHistory: [],
        isLoading: false,
        error: null,

        addItem: (service, quantity) => {
          const { currentOrder } = get();
          const existingItemIndex = currentOrder.items.findIndex(
            item => item.serviceId === service.id
          );

          let newItems;
          
          if (existingItemIndex >= 0) {
            // Update item yang sudah ada
            newItems = [...currentOrder.items];
            const existingItem = newItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              subtotal: service.price * newQuantity
            };
          } else {
            // Tambahkan item baru
            newItems = [
              ...currentOrder.items,
              {
                serviceId: service.id,
                serviceName: service.name,
                quantity,
                price: service.price,
                priceUnit: service.priceUnit,
                subtotal: service.price * quantity
              }
            ];
          }

          set(state => ({
            currentOrder: {
              ...state.currentOrder,
              items: newItems
            }
          }));
          
          get().calculateTotal();
        },

        removeItem: (serviceId) => {
          set(state => ({
            currentOrder: {
              ...state.currentOrder,
              items: state.currentOrder.items.filter(item => item.serviceId !== serviceId)
            }
          }));
          
          get().calculateTotal();
        },

        updateItemQuantity: (serviceId, quantity) => {
          const { currentOrder } = get();
          const itemIndex = currentOrder.items.findIndex(item => item.serviceId === serviceId);
          
          if (itemIndex >= 0) {
            const newItems = [...currentOrder.items];
            const item = newItems[itemIndex];
            
            newItems[itemIndex] = {
              ...item,
              quantity,
              subtotal: item.price * quantity
            };
            
            set(state => ({
              currentOrder: {
                ...state.currentOrder,
                items: newItems
              }
            }));
            
            get().calculateTotal();
          }
        },

        setDeliveryDetails: (details) => {
          set(state => ({
            currentOrder: {
              ...state.currentOrder,
              delivery: details
            }
          }));
        },

        setPaymentMethod: (method) => {
          set(state => ({
            currentOrder: {
              ...state.currentOrder,
              paymentMethod: method
            }
          }));
        },

        resetCurrentOrder: () => {
          set({ currentOrder: { ...initialOrder } });
        },

        calculateTotal: () => {
          const { currentOrder } = get();
          const total = currentOrder.items.reduce(
            (sum, item) => sum + item.subtotal, 
            0
          );
          
          // Tambahkan biaya pengiriman jika dipilih
          const deliveryFee = currentOrder.delivery.type === 'delivery' ? 20000 : 0;
          
          set(state => ({
            currentOrder: {
              ...state.currentOrder,
              total: total + deliveryFee
            }
          }));
        },

        placeOrder: async () => {
          const { currentOrder } = get();
          
          set({ isLoading: true, error: null });
          
          try {
            // Simulasi API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dalam implementasi nyata, kirim ke API
            // const response = await fetch('/api/orders', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(currentOrder)
            // });
            
            const placedOrder = {
              ...currentOrder,
              id: `ORD-${Date.now()}`,
              status: 'placed' as OrderStatus,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            set(state => ({
              orderHistory: [placedOrder, ...state.orderHistory],
              currentOrder: { ...initialOrder },
              isLoading: false
            }));
            
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to place order' 
            });
          }
        },

        fetchOrderHistory: async () => {
          set({ isLoading: true, error: null });
          
          try {
            // Simulasi API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dalam implementasi nyata, ambil dari API
            // const response = await fetch('/api/orders/history');
            // const data = await response.json();
            
            // Contoh data statis untuk simulasi
            const mockOrders = [
              {
                id: 'ORD-123456',
                items: [
                  {
                    serviceId: 'svc-1',
                    serviceName: 'Cuci & Setrika Reguler',
                    quantity: 3,
                    price: 25000,
                    priceUnit: 'kg' as const,
                    subtotal: 75000
                  }
                ],
                delivery: {
                  type: 'pickup' as const,
                  date: new Date(),
                  timeSlot: '14:00 - 17:00'
                },
                status: 'completed' as OrderStatus,
                total: 75000,
                paymentMethod: 'cash' as const,
                paymentStatus: 'paid' as const,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
              }
            ];
            
            set({ 
              orderHistory: mockOrders,
              isLoading: false 
            });
            
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch order history' 
            });
          }
        },

        cancelOrder: async (orderId) => {
          set({ isLoading: true, error: null });
          
          try {
            // Simulasi API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dalam implementasi nyata, kirim ke API
            // await fetch(`/api/orders/${orderId}/cancel`, {
            //   method: 'POST'
            // });
            
            set(state => ({
              orderHistory: state.orderHistory.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'cancelled' as OrderStatus, updatedAt: new Date() } 
                  : order
              ),
              isLoading: false
            }));
            
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : `Failed to cancel order ${orderId}` 
            });
          }
        }
      }),
      {
        name: 'laundry-order-storage',
        partialize: (state) => ({ 
          currentOrder: state.currentOrder,
          orderHistory: state.orderHistory 
        }),
      }
    )
  )
);

export default useOrderStore; 
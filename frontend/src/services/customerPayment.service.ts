import { apiClient } from '@/lib/api-client';
import { Payment, PaymentFilter, PaymentResponse } from "@/types/payment";

export interface Payment {
  id: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentListResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
}

interface GetCustomerPaymentsParams {
  page?: number;
  limit?: number;
  filter?: PaymentFilter;
}

interface GetPaymentDetailsParams {
  id: string;
}

/**
 * Get customer payments from the API
 */
export async function getCustomerPayments({ 
  page = 1, 
  limit = 10, 
  filter 
}: GetCustomerPaymentsParams): Promise<PaymentResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filter parameters if provided
    if (filter) {
      if (filter.status) queryParams.append('status', filter.status);
      if (filter.paymentMethod) queryParams.append('paymentMethod', filter.paymentMethod);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
    }
    
    // Step 1: First try to get payments from the payments API
    const paymentsResponse = await fetch(`/api/customers/payments?${queryParams.toString()}`);
    const paymentsData = await paymentsResponse.json();
    
    // If we have payment items and they're not empty, return them
    if (paymentsResponse.ok && paymentsData?.items && paymentsData.items.length > 0) {
      return paymentsData;
    }
    
    // Step 2: If no payments found or error, try to get them from orders
    console.log("No payments found in payments API, trying orders API");
    
    // Prepare order query params - include payments flag is important
    const orderQueryParams = new URLSearchParams();
    orderQueryParams.append('page', page.toString());
    orderQueryParams.append('limit', limit.toString());
    orderQueryParams.append('include_payments', 'true');
    
    // Add status filter if available
    if (filter?.status) {
      // Map payment status to order status if needed
      const statusMap: Record<string, string> = {
        'completed': 'completed',
        'pending': 'processing',
        // Add more mappings as needed
      };
      const orderStatus = statusMap[filter.status] || filter.status;
      orderQueryParams.append('status', orderStatus);
    }
    
    const ordersResponse = await fetch(`/api/customers/orders?${orderQueryParams.toString()}`);
    
    if (!ordersResponse.ok) {
      // If both endpoints fail, return empty result with proper pagination
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
    
    const ordersData = await ordersResponse.json();
    
    // If no orders found
    if (!ordersData?.items || ordersData.items.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    }
    
    // Extract payment data from orders
    const paymentsFromOrders: Payment[] = [];
    
    ordersData.items.forEach((order: any) => {
      // Check if order has a payment or payments array
      if (order.payment) {
        // Single payment object
        const payment = {
          ...order.payment,
          orderNumber: order.orderNumber,
          orderId: order.id,
          orderStatus: order.status
        };
        paymentsFromOrders.push(payment);
      } else if (order.payments && Array.isArray(order.payments)) {
        // Multiple payments
        order.payments.forEach((payment: any) => {
          paymentsFromOrders.push({
            ...payment,
            orderNumber: order.orderNumber,
            orderId: order.id,
            orderStatus: order.status
          });
        });
      }
    });
    
    // Apply additional filters that couldn't be applied at API level
    let filteredPayments = paymentsFromOrders;
    
    if (filter) {
      if (filter.paymentMethod) {
        filteredPayments = filteredPayments.filter(p => 
          p.paymentMethod?.toLowerCase() === filter.paymentMethod?.toLowerCase()
        );
      }
      
      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        filteredPayments = filteredPayments.filter(p => 
          new Date(p.createdAt) >= startDate
        );
      }
      
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filteredPayments = filteredPayments.filter(p => 
          new Date(p.createdAt) <= endDate
        );
      }
    }
    
    // Return formatted response
    return {
      items: filteredPayments,
      total: filteredPayments.length,
      page,
      limit
    };
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    // Return empty result with proper pagination on error
    return {
      items: [],
      total: 0,
      page,
      limit
    };
  }
}

/**
 * Get payment details by ID
 */
export async function getPaymentDetails({ id }: GetPaymentDetailsParams): Promise<Payment | null> {
  try {
    // First try to get payment from payments API
    const response = await fetch(`/api/customers/payments/${id}`);
    
    // If payment found, return it
    if (response.ok) {
      const payment = await response.json();
      return payment;
    }
    
    // If payment not found in payments API, it might be an order payment
    // Try to find the payment from an order
    
    // Extract possible orderId from payment ID format if applicable
    let orderId = '';
    if (id.startsWith('pay-mock-ord-')) {
      // Extract order ID from payment ID: pay-mock-ord-123 -> mock-ord-123
      orderId = id.replace('pay-', '');
    }
    
    // If we have an orderId, try to get the order with its payment
    if (orderId) {
      const orderResponse = await fetch(`/api/customers/orders/${orderId}?include_payments=true`);
      
      if (orderResponse.ok) {
        const order = await orderResponse.json();
        
        // Check if order has payment data
        if (order.payment && order.payment.id === id) {
          // Return payment with order context
          return {
            ...order.payment,
            orderNumber: order.orderNumber,
            orderId: order.id,
            orderStatus: order.status
          };
        }
        
        // Check if order has payments array
        if (order.payments && Array.isArray(order.payments)) {
          const payment = order.payments.find((p: any) => p.id === id);
          if (payment) {
            return {
              ...payment,
              orderNumber: order.orderNumber,
              orderId: order.id,
              orderStatus: order.status
            };
          }
        }
      }
    }
    
    // No payment found in either API
    console.log("Payment not found in any endpoint:", id);
    return null;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return null;
  }
}

export class CustomerPaymentService {
  /**
   * Get customer's payment history
   * @param page Page number
   * @param limit Number of items per page
   * @param filters Additional filters
   * @returns List of payments
   */
  static async getCustomerPayments(
    page = 1, 
    limit = 10, 
    filters: Omit<PaymentFilters, 'page' | 'limit'> = {}
  ): Promise<PaymentListResponse> {
    try {
      // Construct query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      // Add filters if provided
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      // First, try to get payments directly from the payments API
      try {
        const response = await apiClient.get(`/api/customers/payments?${queryParams.toString()}`);
        
        // Check if we got actual payment data or empty array
        if (response.data && 
            response.data.items && 
            Array.isArray(response.data.items) && 
            response.data.items.length > 0) {
          console.log("Found payments from payment API:", response.data.items.length);
          return response.data;
        }
        
        console.log("No payments found in payment API, trying to get from orders...");
      } catch (err) {
        console.log("Error fetching from payments API, trying orders API instead:", err);
      }
      
      // If no payments found or error, try to get payments from orders
      try {
        // Get orders that may contain payment information
        const ordersResponse = await apiClient.get('/api/customers/orders?include_payments=true');
        
        if (ordersResponse.data && 
            ordersResponse.data.items && 
            Array.isArray(ordersResponse.data.items)) {
          
          // Extract payment data from orders
          const paymentsFromOrders = [];
          
          for (const order of ordersResponse.data.items) {
            if (order.payments && Array.isArray(order.payments)) {
              // Add order information to each payment
              const orderPayments = order.payments.map((payment: any) => ({
                ...payment,
                orderId: order.id,
                orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8)}`
              }));
              
              paymentsFromOrders.push(...orderPayments);
            } else if (order.payment) {
              // Single payment case
              paymentsFromOrders.push({
                ...order.payment,
                orderId: order.id,
                orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8)}`
              });
            }
          }
          
          // Filter if needed
          let filteredPayments = paymentsFromOrders;
          
          if (filters.status) {
            const statusList = filters.status.split(',');
            filteredPayments = filteredPayments.filter(payment => 
              statusList.includes(payment.status.toLowerCase())
            );
          }
          
          if (filters.method) {
            filteredPayments = filteredPayments.filter(payment => 
              payment.paymentMethod.toLowerCase() === filters.method?.toLowerCase()
            );
          }
          
          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
          
          console.log(`Found ${filteredPayments.length} payments from orders, returning ${paginatedPayments.length} for current page`);
          
          return {
            items: paginatedPayments,
            total: filteredPayments.length,
            page,
            limit
          };
        }
      } catch (err) {
        console.error("Error fetching from orders API:", err);
      }
      
      // If we still don't have payments, return empty response
      return {
        items: [],
        total: 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Failed to fetch customer payments:', error);
      throw error;
    }
  }

  /**
   * Get payment details
   * @param paymentId Payment ID
   * @returns Payment details
   */
  static async getPaymentDetails(paymentId: string): Promise<Payment> {
    try {
      // First try to get from payment API
      try {
        const response = await apiClient.get(`/api/customers/payments/${paymentId}`);
        return response.data;
      } catch (err) {
        console.log(`Failed to fetch payment details from payments API, trying orders API: ${err}`);
      }
      
      // If not found, try to find in orders
      try {
        // Since we don't know which order has this payment, we need to search
        const ordersResponse = await apiClient.get('/api/customers/orders?include_payments=true');
        
        if (ordersResponse.data && 
            ordersResponse.data.items && 
            Array.isArray(ordersResponse.data.items)) {
          
          for (const order of ordersResponse.data.items) {
            // Check payment array
            if (order.payments && Array.isArray(order.payments)) {
              const foundPayment = order.payments.find((p: any) => p.id === paymentId);
              if (foundPayment) {
                return {
                  ...foundPayment,
                  orderId: order.id,
                  orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8)}`
                };
              }
            }
            // Check single payment
            else if (order.payment && order.payment.id === paymentId) {
              return {
                ...order.payment,
                orderId: order.id,
                orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8)}`
              };
            }
          }
        }
      } catch (err) {
        console.error("Error searching for payment in orders:", err);
      }
      
      throw new Error(`Payment with ID ${paymentId} not found`);
    } catch (error) {
      console.error(`Failed to fetch payment details for ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Make a new payment
   * @param orderId Order ID to pay for
   * @param paymentMethod Payment method
   * @param amount Payment amount
   * @param transactionId Optional transaction ID for online payments
   * @returns Created payment
   */
  static async makePayment(
    orderId: string,
    paymentMethod: string,
    amount: number,
    transactionId?: string
  ): Promise<Payment> {
    try {
      const response = await apiClient.post('/api/customers/payments', {
        orderId,
        paymentMethod,
        amount,
        transactionId,
        status: 'pending' // Initial status, will be updated by backend
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  }
} 
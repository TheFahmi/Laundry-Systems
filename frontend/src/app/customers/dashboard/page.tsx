"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import { ShoppingBag, Clock, CreditCard, Package, Calendar, User } from 'lucide-react';

// Define types
interface Order {
  id: string;
  number: string;
  status: string;
  date: string;
  total: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is a customer
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'customer') {
        router.push('/access-denied');
      } else {
        setIsPageLoading(false);
        // Fetch customer orders (mock data for now)
        setOrders([
          { id: '1', number: 'ORD-001', status: 'In Progress', date: '2023-04-01', total: 50000 },
          { id: '2', number: 'ORD-002', status: 'Completed', date: '2023-03-25', total: 75000 },
          { id: '3', number: 'ORD-003', status: 'Ready for Pickup', date: '2023-03-15', total: 35000 },
        ]);
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>
      
      <div className="mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Welcome Back, {user?.username || 'Customer'}
          </h2>
          <p className="text-gray-600 mb-4">
            Manage your laundry orders and track their status all in one place.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link href="/customer/orders" className="p-4 border rounded-lg hover:bg-blue-50 flex items-center">
              <ShoppingBag className="h-5 w-5 text-blue-500 mr-2" />
              <span>View Orders</span>
            </Link>
            <Link href="/customer/track" className="p-4 border rounded-lg hover:bg-blue-50 flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span>Track Order</span>
            </Link>
            <Link href="/customer/payments" className="p-4 border rounded-lg hover:bg-blue-50 flex items-center">
              <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
              <span>Payments</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                        ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/customer/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500" />
            Service Highlights
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-500 rounded-full p-1 mr-2 mt-0.5">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="font-medium">Premium Dry Cleaning</p>
                <p className="text-sm text-gray-500">Professional care for your delicate fabrics</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-500 rounded-full p-1 mr-2 mt-0.5">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="font-medium">Express Service</p>
                <p className="text-sm text-gray-500">Same-day and next-day service available</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-500 rounded-full p-1 mr-2 mt-0.5">
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <div>
                <p className="font-medium">Free Pickup & Delivery</p>
                <p className="text-sm text-gray-500">For orders above Rp 100.000</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            Upcoming Promotions
          </h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <p className="font-medium text-yellow-800">Weekend Special - 20% OFF</p>
              <p className="text-sm text-yellow-700 mt-1">Valid this Saturday and Sunday</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-800">Refer a Friend</p>
              <p className="text-sm text-blue-700 mt-1">Get Rp 25.000 off your next order</p>
            </div>
          </div>
          <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800">
            View all promotions →
          </button>
        </div>
      </div>
    </div>
  );
} 
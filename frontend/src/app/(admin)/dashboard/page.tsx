'use client';

import { 
  ShoppingCart as ShoppingCartIcon,
  People as UsersIcon,
  CreditCard as CreditCardIcon,
  LocalLaundryService as ServicesIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function DashboardPage() {
  const menuItems = [
    {
      title: 'Orders',
      icon: <ShoppingCartIcon className="w-6 h-6" />,
      href: '/orders',
      color: 'bg-blue-500'
    },
    {
      title: 'Customers',
      icon: <UsersIcon className="w-6 h-6" />,
      href: '/customers',
      color: 'bg-green-500'
    },
    {
      title: 'Payments',
      icon: <CreditCardIcon className="w-6 h-6" />,
      href: '/payments',
      color: 'bg-yellow-500'
    },
    {
      title: 'Services',
      icon: <ServicesIcon className="w-6 h-6" />,
      href: '/services',
      color: 'bg-purple-500'
    }
  ];
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mb-4`}>
              {item.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{item.title}</h2>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Add recent activity content here */}
        </div>
      </div>
    </div>
  );
} 
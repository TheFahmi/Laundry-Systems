import { ActivityItem } from '@/components/dashboard/RecentActivityCard';
import { Notification } from '@/components/notifications/NotificationCenter';

// Helper function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// In-memory storage for notifications and activities
// In a real app, these would be stored in a database and fetched via API
let notifications: Notification[] = [];
let activities: ActivityItem[] = [];

// Mock data for initial load
const initializeMockData = () => {
  const now = Date.now();
  
  // Create mock activities
  activities = [
    {
      id: generateId(),
      type: 'order',
      title: 'Pesanan baru dibuat',
      description: 'Budi Santoso membuat pesanan Cuci Express',
      timestamp: new Date(now - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      amount: 75000,
      status: 'Pending',
      userId: 'user123',
    },
    {
      id: generateId(),
      type: 'payment',
      title: 'Pembayaran diterima',
      description: 'Pembayaran sebesar Rp 150.000 diterima untuk pesanan #12345',
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      amount: 150000,
      status: 'Completed',
      userId: 'user456',
    },
    {
      id: generateId(),
      type: 'customer',
      title: 'Pelanggan baru terdaftar',
      description: 'Dewi Kartika mendaftar sebagai pelanggan baru',
      timestamp: new Date(now - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      userId: 'user789',
    },
    {
      id: generateId(),
      type: 'service',
      title: 'Layanan baru ditambahkan',
      description: 'Layanan "Setrika Express" telah ditambahkan ke daftar layanan',
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: generateId(),
      type: 'order',
      title: 'Pesanan selesai diproses',
      description: 'Pesanan #12346 untuk Ahmad Fauzi telah selesai',
      timestamp: new Date(now - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
      amount: 120000,
      status: 'Completed',
      userId: 'user321',
    },
    {
      id: generateId(),
      type: 'notification',
      title: 'Sistem diperbarui',
      description: 'Sistem Laundry App telah diperbarui ke versi 2.1.0',
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
  ];
  
  // Create mock notifications
  notifications = [
    {
      id: generateId(),
      type: 'order',
      title: 'Pesanan Baru',
      message: 'Pesanan #ORD-1234 telah dibuat oleh Budi Santoso',
      timestamp: new Date(now - 1000 * 60 * 10).toISOString(), // 10 minutes ago
      read: false,
      link: '/orders/1234',
    },
    {
      id: generateId(),
      type: 'payment',
      title: 'Pembayaran Diterima',
      message: 'Pembayaran untuk pesanan #ORD-1234 telah diterima',
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      link: '/payments/5678',
    },
    {
      id: generateId(),
      type: 'customer',
      title: 'Pelanggan Baru',
      message: 'Siti Nurhaliza telah mendaftar sebagai pelanggan baru',
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true,
      link: '/customers/9012',
    },
    {
      id: generateId(),
      type: 'service',
      title: 'Layanan Baru',
      message: 'Layanan Dry Cleaning Express telah ditambahkan',
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      read: true,
      link: '/services',
    },
    {
      id: generateId(),
      type: 'system',
      title: 'Pembaruan Sistem',
      message: 'Sistem telah diperbarui ke versi terbaru',
      timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      read: true,
    },
  ];
};

// Initialize mock data when imported
initializeMockData();

/**
 * Get all recent activities
 */
export const getRecentActivities = (limit?: number): Promise<ActivityItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by timestamp (newest first)
      const sortedActivities = [...activities].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      resolve(limit ? sortedActivities.slice(0, limit) : sortedActivities);
    }, 300); // Simulate API delay
  });
};

/**
 * Get all notifications
 */
export const getNotifications = (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by timestamp (newest first) and unread first
      const sortedNotifications = [...notifications].sort((a, b) => {
        // Unread notifications always come first
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        // Then sort by timestamp
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      resolve(sortedNotifications);
    }, 300); // Simulate API delay
  });
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const unreadCount = notifications.filter(n => !n.read).length;
      resolve(unreadCount);
    }, 100);
  });
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      resolve();
    }, 200);
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map(notification => ({ ...notification, read: true }));
      resolve();
    }, 200);
  });
};

/**
 * Add a new activity
 */
export const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> => {
  return new Promise((resolve) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    
    activities = [newActivity, ...activities];
    resolve(newActivity);
  });
};

/**
 * Add a new notification
 */
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> => {
  return new Promise((resolve) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    notifications = [newNotification, ...notifications];
    resolve(newNotification);
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = [];
      resolve();
    }, 200);
  });
};

/**
 * Record an event that creates both an activity and a notification
 */
export const recordEvent = (
  type: 'order' | 'payment' | 'customer' | 'service' | 'notification',
  data: {
    title: string;
    description: string;
    message: string;
    amount?: number;
    status?: string;
    userId?: string;
    link?: string;
  }
): Promise<{ activity: ActivityItem; notification: Notification }> => {
  return new Promise(async (resolve) => {
    // Create activity
    const activity = await addActivity({
      type,
      title: data.title,
      description: data.description,
      amount: data.amount,
      status: data.status,
      userId: data.userId,
    });
    
    // Create notification
    const notification = await addNotification({
      type: type === 'notification' ? 'system' : type,
      title: data.title,
      message: data.message,
      link: data.link,
    });
    
    resolve({ activity, notification });
  });
};

// Export the service
const activityService = {
  getRecentActivities,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addActivity,
  addNotification,
  clearAllNotifications,
  recordEvent,
};

export default activityService; 
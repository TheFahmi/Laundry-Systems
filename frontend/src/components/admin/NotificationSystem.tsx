'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as AlertIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Tipe data untuk notifikasi
interface Notification {
  id: string;
  type: 'email' | 'sms' | 'staff';
  title: string;
  message: string;
  timestamp: Date;
  status: 'read' | 'unread';
  priority?: 'high' | 'medium' | 'low';
}

// Tipe data untuk saluran notifikasi
interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'staff';
  name: string;
  enabled: boolean;
  icon: React.ReactNode;
}

// Props untuk komponen NotificationSystem
interface NotificationSystemProps {
  onSendNotification?: (data: Record<string, unknown>) => void;
}

export default function NotificationSystem({ onSendNotification }: NotificationSystemProps) {
  // State untuk tab yang aktif
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // State untuk notifikasi
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'email',
      title: 'Konfirmasi Pesanan',
      message: 'Pesanan #ORD-001234 telah dikonfirmasi dan sedang diproses',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 menit yang lalu
      status: 'unread',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'sms',
      title: 'Pesanan Siap Diambil',
      message: 'Pesanan #ORD-001230 telah selesai dan siap untuk diambil',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 jam yang lalu
      status: 'read',
      priority: 'high'
    },
    {
      id: '3',
      type: 'staff',
      title: 'Penugasan Prioritas',
      message: 'Ada 3 pesanan express yang perlu diselesaikan hari ini',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 jam yang lalu
      status: 'unread',
      priority: 'high'
    },
    {
      id: '4',
      type: 'email',
      title: 'Stok Bahan Hampir Habis',
      message: 'Stok deterjen cair tinggal 10%. Segera lakukan pemesanan.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 hari yang lalu
      status: 'read',
      priority: 'medium'
    },
    {
      id: '5',
      type: 'staff',
      title: 'Antrian Pesanan Baru',
      message: '5 pesanan baru masuk dan menunggu konfirmasi',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 menit yang lalu
      status: 'unread',
      priority: 'medium'
    }
  ]);
  
  // State untuk saluran notifikasi
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: 'email', type: 'email', name: 'Email', enabled: true, icon: <EmailIcon /> },
    { id: 'sms', type: 'sms', name: 'SMS', enabled: true, icon: <SmsIcon /> },
    { id: 'staff', type: 'staff', name: 'Staf', enabled: true, icon: <AlertIcon /> }
  ]);
  
  // Menangani perubahan tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  // Menangani penandaan notifikasi sebagai dibaca
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, status: 'read' } : notification
    ));
  };
  
  // Menangani penghapusan notifikasi
  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Menangani perubahan status saluran notifikasi
  const handleChannelToggle = (id: string) => {
    setChannels(channels.map(channel => 
      channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };
  
  // Filter notifikasi berdasarkan tab aktif
  const filteredNotifications = notifications.filter(notification => 
    activeTab === 'all' || notification.type === activeTab
  );
  
  // Hitung notifikasi yang belum dibaca
  const unreadCount = notifications.filter(notification => notification.status === 'unread').length;
  
  // Format waktu notifikasi
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} hari yang lalu`;
    }
  };
  
  // Dapatkan ikon berdasarkan tipe notifikasi
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      case 'staff':
        return <AlertIcon />;
      default:
        return <AlertIcon />;
    }
  };
  
  // Dapatkan warna berdasarkan prioritas
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Sistem Notifikasi
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <AlertIcon />
          </Badge>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab label="Semua" value="all" />
          <Tab
            label="Email"
            value="email"
            icon={<Badge badgeContent={notifications.filter(n => n.type === 'email' && n.status === 'unread').length} color="error" />}
            iconPosition="end"
          />
          <Tab
            label="SMS"
            value="sms"
            icon={<Badge badgeContent={notifications.filter(n => n.type === 'sms' && n.status === 'unread').length} color="error" />}
            iconPosition="end"
          />
          <Tab
            label="Staf"
            value="staff"
            icon={<Badge badgeContent={notifications.filter(n => n.type === 'staff' && n.status === 'unread').length} color="error" />}
            iconPosition="end"
          />
        </Tabs>
        
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      {notification.status === 'unread' && (
                        <Tooltip title="Tandai sudah dibaca">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Hapus notifikasi">
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{
                    bgcolor: notification.status === 'unread' ? 'action.hover' : 'transparent',
                    borderLeft: notification.priority ? `4px solid ${getPriorityColor(notification.priority)}` : undefined
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="subtitle2" 
                          component="span"
                          sx={{ fontWeight: notification.status === 'unread' ? 'bold' : 'normal' }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={notification.message}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada notifikasi
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          )}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Pengaturan Saluran Notifikasi
          </Typography>
          <FormGroup>
            {channels.map((channel) => (
              <FormControlLabel
                key={channel.id}
                control={
                  <Switch
                    checked={channel.enabled}
                    onChange={() => handleChannelToggle(channel.id)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {channel.icon}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {channel.name}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<SettingsIcon />}
          >
            Pengaturan
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => onSendNotification && onSendNotification({})}
          >
            Kirim Notifikasi
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  IconButton,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  DeleteSweep as DeleteAllIcon, 
  CheckCircle as MarkAllReadIcon,
  LocalLaundryService,
  AttachMoney,
  Person,
  Receipt,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import activityService from '@/services/activityService';
import { Notification } from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await activityService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setStatusMessage({
        message: 'Gagal memuat notifikasi',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await activityService.markAllNotificationsAsRead();
      await fetchNotifications();
      setStatusMessage({
        message: 'Semua notifikasi telah ditandai sebagai dibaca',
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      setStatusMessage({
        message: 'Gagal menandai notifikasi',
        type: 'error',
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAllNotifications = async () => {
    setClearingAll(true);
    try {
      await activityService.clearAllNotifications();
      setNotifications([]);
      setStatusMessage({
        message: 'Semua notifikasi telah dihapus',
        type: 'success',
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setStatusMessage({
        message: 'Gagal menghapus notifikasi',
        type: 'error',
      });
    } finally {
      setClearingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await activityService.markNotificationAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setStatusMessage({
        message: 'Gagal menandai notifikasi',
        type: 'error',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <LocalLaundryService sx={{ color: '#4338ca' }} />;
      case 'payment':
        return <AttachMoney sx={{ color: '#047857' }} />;
      case 'customer':
        return <Person sx={{ color: '#0369a1' }} />;
      case 'service':
        return <Receipt sx={{ color: '#7c3aed' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#d97706' }} />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedTab) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Notifikasi</Typography>
        <Box>
          <IconButton 
            onClick={handleMarkAllAsRead} 
            disabled={markingAll || notifications.filter(n => !n.read).length === 0}
            title="Tandai semua telah dibaca"
          >
            {markingAll ? <CircularProgress size={24} /> : <MarkAllReadIcon />}
          </IconButton>
          <IconButton 
            onClick={handleClearAllNotifications} 
            disabled={clearingAll || notifications.length === 0}
            color="error"
            title="Hapus semua notifikasi"
          >
            {clearingAll ? <CircularProgress size={24} /> : <DeleteAllIcon />}
          </IconButton>
        </Box>
      </Box>

      {statusMessage && (
        <Alert 
          severity={statusMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setStatusMessage(null)}
        >
          {statusMessage.message}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="notification tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="all" label={`Semua (${notifications.length})`} />
          <Tab value="unread" label={`Belum Dibaca (${notifications.filter(n => !n.read).length})`} />
          <Tab value="read" label={`Sudah Dibaca (${notifications.filter(n => n.read).length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Tidak ada notifikasi yang tersedia
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    py: 2,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle1" 
                          component="div" 
                          sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistance(new Date(notification.timestamp), new Date(), { 
                            addSuffix: true,
                            locale: id
                          })}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        component="div"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
} 
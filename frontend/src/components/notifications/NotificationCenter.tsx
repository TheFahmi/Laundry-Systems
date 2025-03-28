"use client";

import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  DeleteSweep as ClearAllIcon,
  LocalLaundryService,
  AttachMoney,
  Person,
  Receipt,
  NotificationsActive,
  OpenInNew
} from '@mui/icons-material';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import * as activityService from '@/services/activityService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await activityService.getNotifications();
      // Show only the 5 most recent notifications
      setNotifications(data.slice(0, 5));
      updateUnreadCount();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = async () => {
    try {
      const count = await activityService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    updateUnreadCount();
    // Update unread count every minute
    const interval = setInterval(updateUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await activityService.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await activityService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      handleClose();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await activityService.markNotificationAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
        updateUnreadCount();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    handleClose();
    
    if (notification.link) {
      window.location.href = notification.link;
    }
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
        return <NotificationsActive sx={{ color: '#d97706' }} />;
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleOpen}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 360,
            maxHeight: 'calc(100vh - 100px)'
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 2, 
          pb: 1, 
          borderBottom: '1px solid',
          borderColor: 'divider' 
        }}>
          <Typography variant="h6">Notifikasi</Typography>
          <Box>
            <IconButton size="small" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              <MarkReadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleClearAll} disabled={notifications.length === 0}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {loading ? (
          <MenuItem>
            <ListItemText primary="Loading notifications..." />
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          <Box component="div">
            <List sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', p: 0 }}>
              {notifications.map((notification) => (
                <ListItem 
                  key={notification.id} 
                  sx={{ 
                    px: 2, 
                    py: 1.5,
                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)',
                      width: 40,
                      height: 40
                    }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" noWrap sx={{ color: 'text.primary', mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistance(new Date(notification.timestamp), new Date(), { 
                            addSuffix: true,
                            locale: id
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Link href="/notifications" passHref>
                <Button 
                  fullWidth 
                  size="small"
                  endIcon={<OpenInNew fontSize="small" />}
                  onClick={handleClose}
                >
                  View All Notifications
                </Button>
              </Link>
            </Box>
          </Box>
        )}
      </Menu>
    </>
  );
} 
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
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  LocalLaundryService,
  AttachMoney,
  Person,
  Receipt,
  NotificationsActive,
  MoreVert,
  OpenInNew
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import * as activityService from '@/services/activityService';
import { ActivityItem } from '@/components/dashboard/RecentActivityCard';

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await activityService.getRecentActivities(5);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <LocalLaundryService sx={{ color: '#4338ca' }} />;
      case 'payment':
        return <AttachMoney sx={{ color: '#047857' }} />;
      case 'customer':
        return <Person sx={{ color: '#0369a1' }} />;
      case 'service':
        return <Receipt sx={{ color: '#7c3aed' }} />;
      case 'notification':
        return <NotificationsActive sx={{ color: '#d97706' }} />;
      default:
        return <MoreVert sx={{ color: '#6b7280' }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return 'Pesanan';
      case 'payment': return 'Pembayaran';
      case 'customer': return 'Pelanggan';
      case 'service': return 'Layanan';
      case 'notification': return 'Notifikasi';
      default: return 'Sistem';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'primary';
      case 'payment': return 'success';
      case 'customer': return 'info';
      case 'service': return 'secondary';
      case 'notification': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Aktivitas Terbaru</Typography>
        <Link href="/activities" passHref>
          <Button 
            endIcon={<OpenInNew fontSize="small" />}
            size="small"
          >
            Lihat Semua
          </Button>
        </Link>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Tidak ada aktivitas terbaru
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ overflow: 'auto', flexGrow: 1 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem 
                sx={{ 
                  py: 1.5,
                  cursor: 'default'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper', width: 38, height: 38 }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
                        {activity.title}
                      </Typography>
                      <Chip 
                        label={getTypeLabel(activity.type)} 
                        size="small"
                        color={getTypeColor(activity.type) as any}
                        sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistance(new Date(activity.timestamp), new Date(), { 
                          addSuffix: true,
                          locale: id
                        })}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ 
                    variant: 'body2'
                  }}
                  secondaryTypographyProps={{
                    component: 'div'
                  }}
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
} 
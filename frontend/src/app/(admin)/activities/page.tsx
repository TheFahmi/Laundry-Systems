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
  Chip,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  LocalLaundryService,
  AttachMoney,
  Person,
  Receipt,
  NotificationsActive,
  MoreVert,
  FilterList
} from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import * as activityService from '@/services/activityService';
import { ActivityItem } from '@/components/dashboard/RecentActivityCard';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activityStats, setActivityStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getRecentActivities();
      setActivities(data);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setActivityStats({
        today: data.filter(activity => new Date(activity.timestamp) >= today).length,
        thisWeek: data.filter(activity => new Date(activity.timestamp) >= startOfWeek).length,
        thisMonth: data.filter(activity => new Date(activity.timestamp) >= startOfMonth).length,
        total: data.length
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      setStatusMessage({
        message: 'Gagal memuat aktivitas terbaru',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTypeFilterChange = (event: any) => {
    setTypeFilter(event.target.value);
  };

  const handleDateFilterChange = (event: any) => {
    setDateFilter(event.target.value);
  };

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

  const filterActivities = (activities: ActivityItem[]) => {
    return activities.filter(activity => {
      // Search filter
      const matchesSearch = 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      
      // Date filter
      let matchesDate = true;
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        matchesDate = activityDate >= today;
      } else if (dateFilter === 'thisWeek') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        matchesDate = activityDate >= startOfWeek;
      } else if (dateFilter === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesDate = activityDate >= startOfMonth;
      }
      
      return matchesSearch && matchesType && matchesDate;
    });
  };

  const filteredActivities = filterActivities(activities);

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

  const handleActivityClick = (activity: ActivityItem) => {
    // No action for now since ActivityItem doesn't have a link property
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Aktivitas Terbaru</Typography>
      
      {statusMessage && (
        <Alert 
          severity={statusMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setStatusMessage(null)}
        >
          {statusMessage.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Hari Ini
              </Typography>
              <Typography variant="h4">{activityStats.today}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Minggu Ini
              </Typography>
              <Typography variant="h4">{activityStats.thisWeek}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bulan Ini
              </Typography>
              <Typography variant="h4">{activityStats.thisMonth}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Aktivitas
              </Typography>
              <Typography variant="h4">{activityStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', px: 2, py: 0.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', width: { xs: '100%', sm: '300px' } }}>
            <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <InputBase
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="type-filter-label">Tipe</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Tipe"
                onChange={handleTypeFilterChange}
                startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="order">Pesanan</MenuItem>
                <MenuItem value="payment">Pembayaran</MenuItem>
                <MenuItem value="customer">Pelanggan</MenuItem>
                <MenuItem value="service">Layanan</MenuItem>
                <MenuItem value="notification">Notifikasi</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="date-filter-label">Tanggal</InputLabel>
              <Select
                labelId="date-filter-label"
                value={dateFilter}
                label="Tanggal"
                onChange={handleDateFilterChange}
                startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="today">Hari Ini</MenuItem>
                <MenuItem value="thisWeek">Minggu Ini</MenuItem>
                <MenuItem value="thisMonth">Bulan Ini</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredActivities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Tidak ada aktivitas yang tersedia
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  onClick={() => handleActivityClick(activity)}
                  sx={{ 
                    py: 2,
                    cursor: 'default'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {activity.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getTypeLabel(activity.type)} 
                            size="small"
                            color={getTypeColor(activity.type) as any}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDistance(new Date(activity.timestamp), new Date(), { 
                              addSuffix: true,
                              locale: id
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        component="div"
                        sx={{ mt: 0.5 }}
                      >
                        {activity.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
} 
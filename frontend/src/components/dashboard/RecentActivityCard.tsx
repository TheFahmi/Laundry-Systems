"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import { Box, Avatar, Typography, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { LocalLaundryService, AttachMoney, Person, Receipt, Notifications } from '@mui/icons-material';
import { formatCurrency } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'order' | 'payment' | 'customer' | 'service' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
  userId?: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export default function RecentActivityCard({ 
  activities, 
  loading = false, 
  maxItems = 5,
  showViewAll = true,
  onViewAll
}: RecentActivityCardProps) {
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
        return <Notifications sx={{ color: '#d97706' }} />;
      default:
        return <LocalLaundryService />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'active':
        return 'text-green-600';
      case 'pending':
      case 'processing':
        return 'text-amber-600';
      case 'canceled':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Aktivitas Terbaru</span>
          {showViewAll && (
            <button 
              onClick={onViewAll} 
              className="text-sm text-primary hover:underline"
            >
              Lihat Semua
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="loader"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada aktivitas terbaru
          </div>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {displayedActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <div className="flex justify-between items-start">
                        <Typography component="span" variant="body1" fontWeight="medium">
                          {activity.title}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatDistance(new Date(activity.timestamp), new Date(), { 
                            addSuffix: true,
                            locale: id
                          })}
                        </Typography>
                      </div>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.description}
                        </Typography>
                        {activity.amount !== undefined && (
                          <Typography component="div" variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                            {formatCurrency(activity.amount)}
                          </Typography>
                        )}
                        {activity.status && (
                          <Typography 
                            component="div" 
                            variant="body2" 
                            className={getStatusColor(activity.status)}
                            sx={{ mt: 0.5 }}
                          >
                            {activity.status}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < displayedActivities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
} 
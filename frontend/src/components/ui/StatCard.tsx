import React from 'react';
import { Box, Card, CardContent, Typography, SvgIconProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  iconColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'primary.main',
  trend
}) => {
  const trendColor = trend?.direction === 'up' ? 'success.main' : 'error.main';
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box mr={2}>
            {React.cloneElement(icon, { 
              sx: { color: iconColor },
              fontSize: "large" 
            })}
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            
            {trend && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trendColor,
                  display: 'block',
                  mt: 0.5
                }}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard; 
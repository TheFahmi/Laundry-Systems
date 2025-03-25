'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

export interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete
}) => {
  // Status chip color
  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'on-leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Status chip label
  const getStatusLabel = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'on-leave':
        return 'Cuti';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar 
              src={employee.avatarUrl} 
              alt={employee.name}
              sx={{ width: 64, height: 64, mr: 2 }}
            >
              {employee.name.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                {employee.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {employee.position}
              </Typography>
              
              <Chip 
                label={getStatusLabel(employee.status)} 
                color={getStatusColor(employee.status)} 
                size="small"
              />
            </Box>
          </Box>
          
          <Box>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => onEdit && onEdit(employee)}
            >
              <EditIcon />
            </IconButton>
            
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete && onDelete(employee)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Box mt={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">{employee.email}</Typography>
          </Box>
          
          <Box display="flex" alignItems="center">
            <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">{employee.phone}</Typography>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Bergabung pada: {employee.joinDate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard; 
'use client';

import { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Alert, Chip, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import UpdateIcon from '@mui/icons-material/Update';
import InfoIcon from '@mui/icons-material/Info';
import { createAuthHeaders } from '@/lib/api-utils';

// Status translation mapping
const statusTranslations: Record<string, { label: string, color: string }> = {
  new: { label: 'Baru', color: 'info' },
  processing: { label: 'Diproses', color: 'warning' },
  completed: { label: 'Selesai', color: 'success' },
  picked_up: { label: 'Diambil', color: 'secondary' },
  cancelled: { label: 'Dibatalkan', color: 'error' },
  delivery: { label: 'Dalam Pengiriman', color: 'primary' },
  washing: { label: 'Dicuci', color: 'primary' },
  drying: { label: 'Dikeringkan', color: 'warning' },
  folding: { label: 'Dilipat', color: 'warning' },
  ready: { label: 'Siap Diambil', color: 'success' },
  delivered: { label: 'Terkirim', color: 'default' },
};

interface StatusUpdaterProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
  onRefresh: () => void;
}

export default function StatusUpdater({
  orderId,
  orderNumber,
  currentStatus,
  onStatusUpdate,
  onRefresh
}: StatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Function to generate a cache buster
  const generateCacheBuster = () => {
    return `t=${new Date().getTime()}`;
  };

  // Function to validate and format UUID
  const validateUUID = (id: string): string | null => {
    // Check if it's a valid UUID format (8-4-4-4-12)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(id)) {
      return id.toLowerCase(); // Return lowercase UUID for consistency
    }
    
    // If it's not in UUID format, log and return null
    console.warn('Invalid UUID format:', id);
    return null;
  };

  // Function to get the order UUID from the backend
  const getOrderUUID = async (orderNumber: string): Promise<string> => {
    const headers = createAuthHeaders();
    // Add cache control headers
    const noCacheHeaders = {
      ...headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    console.log(`Fetching order details to get UUID for order number: ${orderNumber}`);
    setDebugInfo(prev => `${prev || ''}\nFetching order UUID for ${orderNumber}...`);
    
    const response = await fetch(`${API_BASE_URL}/orders/number/${orderNumber}?${generateCacheBuster()}`, {
      method: 'GET',
      headers: noCacheHeaders,
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch order details: ${response.status}`, errorText);
      throw new Error(`Failed to fetch order details: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Order data response:', data);
    
    // Extract UUID from the response
    let uuid = null;
    if (data.data) {
      uuid = data.data.id;
    } else if (data.order) {
      uuid = data.order.id;
    } else if (data.id) {
      uuid = data.id;
    }
    
    if (!uuid) {
      throw new Error('Could not find order UUID in response');
    }
    
    // Validate the UUID format
    if (!validateUUID(uuid)) {
      throw new Error(`Invalid UUID format returned from server: ${uuid}`);
    }
    
    return uuid.toLowerCase();
  };

  // Function to update the order status
  const updateStatus = async (newStatus: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
    
    try {
      // Create auth headers
      const headers = createAuthHeaders();
      // Add cache control headers
      const noCacheHeaders = {
        ...headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Log the request for debugging
      const requestInfo = {
        orderId: orderId || 'Will be fetched from API',
        orderNumber,
        currentStatus,
        newStatus,
        endpoint: `/api/orders/${orderNumber}/status`,
        cacheBuster: generateCacheBuster()
      };
      console.log('Updating order status with:', requestInfo);
      setDebugInfo(JSON.stringify(requestInfo, null, 2));
      
      // First ensure we have a valid UUID
      let validOrderId: string;
      
      // Check if we already have a valid UUID in orderId
      const validatedProvidedId = validateUUID(orderId);
      if (validatedProvidedId) {
        validOrderId = validatedProvidedId;
        setDebugInfo(prev => `${prev}\n\nUsing provided order ID: ${validOrderId}`);
      } else {
        // If not, we need to fetch it from the backend by order number
        try {
          validOrderId = await getOrderUUID(orderNumber);
          setDebugInfo(prev => `${prev}\n\nFetched order ID from backend: ${validOrderId}`);
        } catch (error: any) {
          console.error('Error getting order UUID:', error);
          setDebugInfo(prev => `${prev}\n\nError getting order UUID: ${error.message}`);
          throw new Error(`Could not get valid order UUID: ${error.message}`);
        }
      }
      
      // Now we have a valid UUID, let's try to update the status directly on the backend
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const directUrl = `${API_BASE_URL}/orders/${validOrderId}/status?${generateCacheBuster()}`;
        console.log(`Attempting direct backend call to: ${directUrl}`);
        setDebugInfo(prev => `${prev}\n\nCalling backend API: ${directUrl}`);
        
        const backendResponse = await fetch(directUrl, {
          method: 'PATCH',
          headers: {
            ...noCacheHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        const backendText = await backendResponse.text();
        let backendData: { success?: boolean; message?: string; data?: any; } = {};
        
        try {
          backendData = JSON.parse(backendText);
          console.log('Backend direct response:', backendData);
          setDebugInfo(prev => `${prev}\n\nBackend Direct Response:\n${JSON.stringify(backendData, null, 2)}`);
        } catch (e) {
          console.log('Backend response text:', backendText);
          setDebugInfo(prev => `${prev}\n\nBackend Response Text:\n${backendText}`);
          backendData = { message: backendText };
        }
        
        if (backendResponse.ok) {
          // If successful, update the UI
          setSuccess(`Status updated to ${statusTranslations[newStatus]?.label || newStatus} (direct backend)`);
          onStatusUpdate(newStatus);
          
          // Refresh order details after brief delay to allow backend to update
          setTimeout(() => {
            onRefresh();
          }, 500);
          
          return;
        } else {
          setDebugInfo(prev => `${prev}\n\nBackend update failed with status: ${backendResponse.status}`);
          console.warn('Backend update failed, falling back to frontend API');
        }
      } catch (backendErr: any) {
        console.error('Error with direct backend update:', backendErr);
        setDebugInfo(prev => `${prev}\n\nBackend Error: ${backendErr.message}`);
      }
      
      // Fallback: try frontend API route
      console.log('Trying frontend API route as fallback');
      setDebugInfo(prev => `${prev}\n\nFalling back to frontend API route`);
      
      const response = await fetch(`/api/orders/${orderNumber}/status?${generateCacheBuster()}`, {
        method: 'PATCH',
        headers: {
          ...noCacheHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          orderId: validOrderId // Pass the validated UUID explicitly
        }),
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      const responseText = await response.text();
      let responseData: { success?: boolean; message?: string; data?: any; } = {};
      
      try {
        // Try to parse as JSON
        responseData = JSON.parse(responseText);
        console.log('Response data:', responseData);
        setDebugInfo(prev => `${prev}\n\nResponse:\n${JSON.stringify(responseData, null, 2)}`);
      } catch (e) {
        // If not JSON, use text
        console.log('Response text:', responseText);
        setDebugInfo(prev => `${prev}\n\nResponse Text:\n${responseText}`);
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to update status: ${response.status}`);
      }
      
      // If we got here, assume the frontend API call was successful
      setSuccess(`Status updated to ${statusTranslations[newStatus]?.label || newStatus}`);
      onStatusUpdate(newStatus);
      
      // Refresh order details after brief delay
      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status');
      setDebugInfo(prev => `${prev}\n\nError:\n${err.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
        Status Updater Tool
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Current Status:</Typography>
          <Chip 
            size="small"
            label={statusTranslations[currentStatus]?.label || currentStatus}
            color={statusTranslations[currentStatus]?.color as any || 'default'}
          />
          
          <Button 
            startIcon={<RefreshIcon />}
            size="small"
            onClick={onRefresh}
            variant="outlined"
            sx={{ ml: 'auto' }}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ width: '100%', mb: 0.5 }}>Update Status:</Typography>
          
          {Object.entries(statusTranslations).map(([key, { label, color }]) => (
            <Button
              key={key}
              size="small"
              variant={key === currentStatus ? "contained" : "outlined"}
              color={color as any || 'primary'}
              onClick={() => updateStatus(key)}
              disabled={isUpdating || key === currentStatus}
              sx={{ minWidth: '120px' }}
              startIcon={key === currentStatus ? <UpdateIcon /> : undefined}
            >
              {isUpdating && key === currentStatus ? <CircularProgress size={20} /> : label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button 
          size="small" 
          startIcon={<InfoIcon />}
          onClick={() => setShowDebug(!showDebug)}
          sx={{ mb: 1 }}
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </Button>
        
        {showDebug && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
              Order ID: <code>{orderId}</code> {validateUUID(orderId) ? '✅' : '❌'}
            </Typography>
            <Typography variant="caption" component="div">
              Order Number: <code>{orderNumber}</code>
            </Typography>
          </Box>
        )}
        
        {showDebug && debugInfo && (
          <Box 
            sx={{ 
              p: 1, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            {debugInfo}
          </Box>
        )}
        
        {showDebug && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2">Troubleshooting Tips:</Typography>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>Check browser network tab for errors in the request</li>
              <li>The backend requires a valid UUID, not the order number format</li>
              <li>Current error: The backend expects a UUID but received a formatted order number</li>
              <li>This tool will automatically fetch the UUID from the order number</li>
              <li>Make sure the backend API is running at http://localhost:3001</li>
            </ul>
          </Box>
        )}
      </Box>
    </Box>
  );
} 
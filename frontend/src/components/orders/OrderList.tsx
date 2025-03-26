import { Box, Button, TableCell, Table, TableHead, TableBody, TableRow, Paper, TableContainer, Chip } from '@mui/material';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  customerId: string;
  customerName?: string;
  total: number;
  created_at: string;
}

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id.substring(0, 8)}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <Chip label={order.status} color="primary" size="small" />
              </TableCell>
              <TableCell>Rp {order.total.toLocaleString()}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    href={`/orders/${order.id}`}
                  >
                    View
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component={Link}
                    href={`/orders/${order.id}/payment`}
                  >
                    Pay Now
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ... rest of the component 
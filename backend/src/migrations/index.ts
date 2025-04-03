import { CreateWorkOrderTables1712026999999 } from './create-work-order-tables';
import { AddIsDeliveryNeededToOrders1743724000000 } from './1743724000000-AddIsDeliveryNeededToOrders';
import { IntegrateUsersAndCustomers1743770000000 } from './1743770000000-IntegrateUsersAndCustomers';
import { GenerateCustomerUserAccounts1743780000000 } from './1743780000000-GenerateCustomerUserAccounts';

// Export all migrations
export const migrations = [
  CreateWorkOrderTables1712026999999,
  AddIsDeliveryNeededToOrders1743724000000,
  IntegrateUsersAndCustomers1743770000000,
  GenerateCustomerUserAccounts1743780000000
]; 
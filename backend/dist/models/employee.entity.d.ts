export declare enum EmployeeRole {
    ADMIN = "admin",
    MANAGER = "manager",
    LAUNDRY_STAFF = "laundry_staff",
    DELIVERY_STAFF = "delivery_staff",
    CUSTOMER_SERVICE = "customer_service"
}
export declare class Employee {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: EmployeeRole;
    department: string;
    isActive: boolean;
    schedule: any;
    performanceMetrics: any;
    createdAt: Date;
    updatedAt: Date;
}

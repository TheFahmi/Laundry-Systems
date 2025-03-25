export declare enum ExpenseCategory {
    UTILITIES = "utilities",
    SUPPLIES = "supplies",
    RENT = "rent",
    SALARY = "salary",
    MAINTENANCE = "maintenance",
    MARKETING = "marketing",
    OTHER = "other"
}
export declare class Expense {
    id: string;
    title: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    expenseDate: Date;
    receipt: string;
    paidBy: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

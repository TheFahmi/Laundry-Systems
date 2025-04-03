import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment History - Laundry App',
  description: 'View your payment history and transaction details',
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
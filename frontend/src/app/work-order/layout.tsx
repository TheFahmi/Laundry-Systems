import { ReactNode } from 'react';

export default function WorkOrderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {children}
    </div>
  );
} 
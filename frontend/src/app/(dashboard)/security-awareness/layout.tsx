'use client';
import { EmployeeProvider } from '@/context/EmployeeContext';

export default function SecurityAwarenessLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeProvider>{children}</EmployeeProvider>;
}

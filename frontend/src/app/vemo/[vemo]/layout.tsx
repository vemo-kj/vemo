'use client';

import { SummaryProvider } from './context/SummaryContext';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVemoPath = pathname?.startsWith('/vemo/');

  // error 페이지나 404 페이지일 경우 Provider 없이 렌더링
  if (!isVemoPath || pathname === '/500' || pathname === '/404') {
    return children;
  }

  return (
    <div suppressHydrationWarning={true}>
      <SummaryProvider>{children}</SummaryProvider>
    </div>
  );
} 
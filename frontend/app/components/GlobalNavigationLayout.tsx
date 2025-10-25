"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { NavigationProvider } from '../contexts/NavigationContext';

interface GlobalNavigationLayoutProps {
  children: React.ReactNode;
}

const GlobalNavigationLayout: React.FC<GlobalNavigationLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Pages that should NOT have the navigation context (e.g., login, signup, landing)
  const excludedPages = [
    '/login',
    '/sign-up',
    '/signup',
    '/forgot-password',
    '/otp-verification',
    '/privacy',
    '/privacy-policy',
    '/about-us',
  ];
  
  // Check if current page should be excluded from navigation context
  const shouldExclude = excludedPages.some(page => pathname.startsWith(page)) || pathname === '/';
  
  if (shouldExclude) {
    return <>{children}</>;
  }
  
  // Determine initial tab based on current path
  let initialTab = 'explore';
  if (pathname.includes('/cart') || pathname.includes('/check-out') || pathname.includes('/add-to-cart')) {
    initialTab = 'cart';
  } else if (pathname.includes('/user-dashboard/orders')) {
    initialTab = 'orders';
  } else if (pathname.includes('/user-dashboard/profile')) {
    initialTab = 'profile';
  } else if (pathname.includes('/user-dashboard')) {
    initialTab = 'explore';
  }
  
  return (
    <NavigationProvider initialTab={initialTab as any}>
      {children}
    </NavigationProvider>
  );
};

export default GlobalNavigationLayout;

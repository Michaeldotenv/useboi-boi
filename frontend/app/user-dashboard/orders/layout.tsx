"use client";

import React from 'react';
import { NavigationProvider } from '@/app/contexts/NavigationContext';
import GlobalBottomNavigation from '@/app/components/GlobalBottomNavigation';

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider initialTab="orders">
      {children}
      <GlobalBottomNavigation />
    </NavigationProvider>
  );
}

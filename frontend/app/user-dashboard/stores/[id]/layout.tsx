"use client";

import React from 'react';
import { NavigationProvider } from '@/app/contexts/NavigationContext';
import GlobalBottomNavigation from '@/app/components/GlobalBottomNavigation';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider initialTab="explore">
      {children}
      <GlobalBottomNavigation />
    </NavigationProvider>
  );
}

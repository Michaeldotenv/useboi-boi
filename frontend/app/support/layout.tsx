"use client";

import React from 'react';
import { NavigationProvider } from '@/app/contexts/NavigationContext';
import GlobalBottomNavigation from '@/app/components/GlobalBottomNavigation';

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider initialTab="support">
      {children}
      <GlobalBottomNavigation />
    </NavigationProvider>
  );
}
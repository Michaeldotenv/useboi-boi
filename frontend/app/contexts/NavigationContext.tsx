"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type TabType = 'explore' | 'cart' | 'orders' | 'support' | 'profile';

interface NavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  navigateToTab: (tab: TabType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  initialTab?: TabType;
}

export function NavigationProvider({ children, initialTab = 'explore' }: NavigationProviderProps) {
  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);
  const router = useRouter();
  const pathname = usePathname();

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('boiboi_active_tab') as TabType;
    if (savedTab && ['explore', 'cart', 'orders', 'support', 'profile'].includes(savedTab)) {
      setActiveTabState(savedTab);
    }
  }, []);

  // Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('boiboi_active_tab', activeTab);
  }, [activeTab]);

  // Update active tab based on current pathname
  useEffect(() => {
    if (pathname.includes('/cart') || pathname.includes('/check-out') || pathname.includes('/add-to-cart')) {
      setActiveTabState('cart');
    } else if (pathname.includes('/user-dashboard/profile')) {
      setActiveTabState('profile');
    } else if (pathname === '/user-dashboard' || pathname.includes('/user-dashboard/stores')) {
      // Don't automatically set to explore - let the saved tab state handle it
      // setActiveTabState('explore');
    }
  }, [pathname]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
  };

  const navigateToTab = (tab: TabType) => {
    setActiveTabState(tab);
    
    // Define routes for each tab
    const routes = {
      explore: '/user-dashboard',
      cart: '/cart',
      orders: '/user-dashboard', // Use tab system instead of separate page
      support: '/user-dashboard', // Support can be handled within dashboard
      profile: '/user-dashboard/profile'
    };

    const targetRoute = routes[tab];
    
    // Only navigate if we're not already on the target route
    if (pathname !== targetRoute && !pathname.startsWith(targetRoute)) {
      router.push(targetRoute);
    }
    
    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, navigateToTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

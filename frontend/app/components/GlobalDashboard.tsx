"use client";

import React from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigation } from '../contexts/NavigationContext';
import ExploreTab from './tabs/ExploreTab';
import CartTab from './tabs/CartTab';
import OrdersTab from './tabs/OrdersTab';
import SupportTab from './tabs/SupportTab';
import ProfileTab from './tabs/ProfileTab';
import GlobalBottomNavigation from './GlobalBottomNavigation';

const GlobalDashboard: React.FC = () => {
  const { activeTab } = useNavigation();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'explore':
        return <ExploreTab />;
      case 'cart':
        return <CartTab />;
      case 'orders':
        return <OrdersTab />;
      case 'support':
        return <SupportTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ExploreTab />;
    }
  };

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #F2F2F7 0%, #E5E7EB 50%, #F9FAFB 100%)"
      backgroundAttachment="fixed"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(59, 23, 79, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(107, 42, 143, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box position="relative" zIndex={1}>
        {renderActiveTab()}
      </Box>
    </Box>
  );
};

export default GlobalDashboard;

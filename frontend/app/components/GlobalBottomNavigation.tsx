"use client";

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaCompass,
  FaShoppingCart,
  FaBox,
  FaHeadset,
  FaUser,
} from 'react-icons/fa';
import { useNavigation, TabType } from '../contexts/NavigationContext';
import { useCartStore } from '@/lib/cartStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  tab: TabType;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, tab, isActive, onClick }) => {
  const activeColor = '#3B174F';
  const inactiveColor = '#8E8E93';
  const activeBg = 'rgba(59, 23, 79, 0.1)';
  const hoverBg = 'rgba(59, 23, 79, 0.05)';

  return (
    <VStack
      spacing={1}
      cursor="pointer"
      onClick={onClick}
      py={3}
      px={4}
      borderRadius="20px"
      bg={isActive ? activeBg : 'transparent'}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      _hover={{
        bg: isActive ? activeBg : hoverBg,
        transform: 'translateY(-3px) scale(1.05)',
      }}
      _active={{
        transform: 'translateY(-1px) scale(1.02)',
      }}
      minW="70px"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isActive 
          ? 'rgba(59, 23, 79, 0.1)'
          : 'transparent',
        borderRadius: "20px",
        transition: "all 0.3s ease",
      }}
    >
      <Icon
        as={icon}
        fontSize="22px"
        color={isActive ? activeColor : inactiveColor}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        zIndex={1}
        _groupHover={{
          color: activeColor,
        }}
        style={{
          filter: isActive ? 'drop-shadow(0 0 8px rgba(59, 23, 79, 0.3))' : 'none'
        }}
      />
      <Text
        fontSize="11px"
        fontWeight={isActive ? '700' : '500'}
        color={isActive ? activeColor : inactiveColor}
        textAlign="center"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        zIndex={1}
        letterSpacing="0.5px"
      >
        {label}
      </Text>
      {isActive && (
        <Box
          position="absolute"
          bottom={1}
          left="50%"
          transform="translateX(-50%)"
          width="4px"
          height="4px"
          borderRadius="50%"
          bg={activeColor}
          boxShadow="0 0 8px rgba(59, 23, 79, 0.6)"
        />
      )}
    </VStack>
  );
};

const GlobalBottomNavigation: React.FC = () => {
  const { activeTab, navigateToTab } = useNavigation();
  const navBg = useColorModeValue('white', 'gray.800');
  const navBorder = useColorModeValue('gray.200', 'gray.600');
  const cartQty = useCartStore((s) => s.items.reduce((sum, it) => sum + it.quantity, 0));
  
  // Fetch user data to get customer ID
  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";
  
  // Fetch orders count
  const { data: ordersData } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
  });
  const orders = (ordersData as any)?.data || ordersData || [];
  const ordersCount = orders.length;

  const navItems = [
    { icon: FaCompass, label: 'Explore', tab: 'explore' as TabType },
    { icon: FaShoppingCart, label: 'Cart', tab: 'cart' as TabType },
    { icon: FaBox, label: 'Orders', tab: 'orders' as TabType },
    { icon: FaHeadset, label: 'Support', tab: 'support' as TabType },
    { icon: FaUser, label: 'Profile', tab: 'profile' as TabType },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      borderTop="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      boxShadow="0 -8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
      maxW="100vw"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(59, 23, 79, 0.02)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Flex
        justify="space-around"
        alignItems="center"
        py={2}
        px={2}
        maxW="container.sm"
        mx="auto"
      >
            {navItems.map((item) => {
              const showCartBadge = item.tab === 'cart' && cartQty > 0;
              const showOrdersBadge = item.tab === 'orders' && ordersCount > 0;
              return (
                <Box key={item.tab} position="relative">
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    tab={item.tab}
                    isActive={activeTab === item.tab}
                    onClick={() => navigateToTab(item.tab)}
                  />
                  {showCartBadge && (
                    <Box 
                      position="absolute" 
                      top={0} 
                      right={0} 
                      transform="translate(40%, -20%)" 
                      bg="brand.accent"
                      color="white" 
                      fontSize="10px" 
                      fontWeight="700"
                      px={2} 
                      py={1} 
                      borderRadius="full" 
                      minW="18px" 
                      height="18px"
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 2px 8px rgba(16, 185, 129, 0.4)"
                      border="2px solid white"
                      animation="pulse 2s infinite"
                    >
                      {Math.min(cartQty, 99)}
                    </Box>
                  )}
                  {showOrdersBadge && (
                    <Box 
                      position="absolute" 
                      top={0} 
                      right={0} 
                      transform="translate(40%, -20%)" 
                      bg="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                      color="white" 
                      fontSize="10px" 
                      fontWeight="700"
                      px={2} 
                      py={1} 
                      borderRadius="full" 
                      minW="18px" 
                      height="18px"
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="0 2px 8px rgba(16, 185, 129, 0.4)"
                      border="2px solid white"
                      animation="pulse 2s infinite"
                    >
                      {Math.min(ordersCount, 99)}
                    </Box>
                  )}
                </Box>
              );
            })}
      </Flex>
    </Box>
  );
};

export default GlobalBottomNavigation;
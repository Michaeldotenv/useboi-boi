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
  FaHeart,
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
  const activeColor = '#1a1a1a';
  const inactiveColor = '#6b7280';

  return (
    <VStack
      spacing={1.5}
      cursor="pointer"
      onClick={onClick}
      py={2}
      px={3}
      borderRadius="12px"
      bg="transparent"
      transition="all 0.2s ease"
      position="relative"
      minW="60px"
      _hover={{
        bg: 'gray.50',
      }}
      _active={{
        transform: 'scale(0.95)',
      }}
    >
      <Icon
        as={icon}
        fontSize="20px"
        color={isActive ? activeColor : inactiveColor}
        transition="color 0.2s ease"
      />
      <Text
        fontSize="10px"
        fontWeight={isActive ? '600' : '500'}
        color={isActive ? activeColor : inactiveColor}
        textAlign="center"
        transition="color 0.2s ease"
        letterSpacing="0.3px"
        lineHeight={1.2}
      >
        {label}
      </Text>
      {isActive && (
        <Box
          position="absolute"
          top={-1}
          left="50%"
          transform="translateX(-50%)"
          width="24px"
          height="2px"
          borderRadius="1px"
          bg={activeColor}
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
  // Only count incomplete orders (not completed or cancelled)
  const incompleteOrders = orders.filter((order: any) => {
    const status = (order.status || order.orderProgressStatus || '').toLowerCase();
    return !status.includes('complete') && !status.includes('cancel');
  });
  const ordersCount = incompleteOrders.length;

  const navItems = [
    { icon: FaCompass, label: 'Explore', tab: 'explore' as TabType },
    { icon: FaHeart, label: 'Saved', tab: 'saved' as TabType },
    { icon: FaShoppingCart, label: 'Cart', tab: 'cart' as TabType },
    { icon: FaBox, label: 'Orders', tab: 'orders' as TabType },
    { icon: FaUser, label: 'Profile', tab: 'profile' as TabType },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={100}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      maxW="100vw"
    >
      <Flex
        justify="space-around"
        alignItems="center"
        py={1}
        px={4}
        maxW="container.sm"
        mx="auto"
        height="70px"
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
                      top={-2} 
                      right={0} 
                      transform="translate(30%, 0%)" 
                      bg="red.500"
                      color="white" 
                      fontSize="10px" 
                      fontWeight="600"
                      px={1.5} 
                      py={0.5} 
                      borderRadius="full" 
                      minW="16px" 
                      height="16px"
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid white"
                    >
                      {Math.min(cartQty, 99)}
                    </Box>
                  )}
                  {showOrdersBadge && (
                    <Box 
                      position="absolute" 
                      top={-2} 
                      right={0} 
                      transform="translate(30%, 0%)" 
                      bg="blue.500"
                      color="white" 
                      fontSize="10px" 
                      fontWeight="600"
                      px={1.5} 
                      py={0.5} 
                      borderRadius="full" 
                      minW="16px" 
                      height="16px"
                      textAlign="center"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid white"
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
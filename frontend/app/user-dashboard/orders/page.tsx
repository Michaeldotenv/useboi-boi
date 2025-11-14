"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Link as ChakraLink,
  Button,
  IconButton,
  Divider,
  Flex,
  Grid,
  GridItem,
  Image,
  Avatar,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiPhone } from "react-icons/fi";
import { BiRestaurant } from "react-icons/bi";
import { IoTimeOutline } from "react-icons/io5";
import Wrapper from "../../components/Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../../components/EmptyState";
import { useToast } from "@chakra-ui/react";
import { useCartStore } from "@/lib/cartStore";
import { getAuthToken } from "@/lib/auth";

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { addItem, clearCart } = useCartStore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";

  // Real-time polling for orders (every 15 seconds)
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
    refetchInterval: 15000, // Poll every 15 seconds for real-time updates
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Orders refreshed",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top",
    });
  };

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => api.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel order",
        description: error.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle cancel order
  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  // Handle reorder
  const handleReorder = async (order: any) => {
    try {
      // Clear existing cart
      clearCart();
      
      // Add items from order to cart
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          addItem({
            id: item.itemId || item._id,
            vendorId: order.storeId || order.vendorId,
            name: item.name || 'Item',
            price: item.price || 0,
            image: item.image,
          }, item.quantity || 1);
        }
        
        toast({
          title: "Items added to cart",
          description: "All items from this order have been added to your cart",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate to cart
        router.push("/cart");
      }
    } catch (error) {
      toast({
        title: "Failed to reorder",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Trigger load animation when data is ready
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Parse orders from response
  const orders = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
  
  // Filter orders by status
  const allOrders = [...orders].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const activeOrders = allOrders.filter((o: any) => {
    const status = (o.status || o.orderState || "").toString().toLowerCase();
    return status.includes("progress") || status.includes("rider") || status.includes("pend") || status.includes("ongoing");
  });
  const completedOrders = allOrders.filter((o: any) => {
    const status = (o.status || o.orderState || "").toString().toLowerCase();
    return status.includes("complete");
  });
  const cancelledOrders = allOrders.filter((o: any) => {
    const status = (o.status || o.orderState || "").toString().toLowerCase();
    return status.includes("cancel");
  });

  // Get filtered orders based on selected filter
  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return allOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Stats data for the filter cards
  const statsData = [
    {
      id: "all",
      label: "All Orders",
      count: allOrders.length,
      icon: FiPackage,
      color: "purple",
      bgGradient: "linear(135deg, purple.500, purple.600)",
    },
    {
      id: "active",
      label: "Active",
      count: activeOrders.length,
      icon: FiClock,
      color: "orange",
      bgGradient: "linear(135deg, orange.400, orange.500)",
    },
    {
      id: "completed",
      label: "Completed",
      count: completedOrders.length,
      icon: FiCheckCircle,
      color: "green",
      bgGradient: "linear(135deg, green.400, green.500)",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: cancelledOrders.length,
      icon: FiXCircle,
      color: "red",
      bgGradient: "linear(135deg, red.400, red.500)",
    },
  ];

  // Modern order card component
  const OrderCard = ({ order, index }: { order: any; index: number }) => {
    const rawStatus = (order.status || order.orderState || "").toString().toLowerCase();
    
    const getDisplayStatus = (status: string) => {
      if (status.includes("complete")) return "Delivered";
      if (status.includes("progress") || status.includes("rider") || status.includes("ongoing")) return "In Progress";
      if (status.includes("pend")) return "Pending";
      if (status.includes("cancel")) return "Cancelled";
      return "Active";
    };
    
    const displayStatus = getDisplayStatus(rawStatus);
    
    const statusColors = {
      "Delivered": { dot: "#10B981", bg: "green.50", text: "green.700", badge: "green" },
      "In Progress": { dot: "#F59E0B", bg: "orange.50", text: "orange.700", badge: "orange" },
      "Pending": { dot: "#3B82F6", bg: "blue.50", text: "blue.700", badge: "blue" },
      "Cancelled": { dot: "#EF4444", bg: "red.50", text: "red.700", badge: "red" },
      "Active": { dot: "#3B82F6", bg: "blue.50", text: "blue.700", badge: "blue" },
    };
    
    const colors = statusColors[displayStatus as keyof typeof statusColors] || statusColors["Active"];

    const orderId = order.id || order._id;
    const orderIdDisplay = orderId ? (typeof orderId === 'string' ? orderId.slice(-6).toUpperCase() : orderId.toString().slice(-6)) : 'N/A';
    const storeName = order.store?.name || order.vendorName || order.storeName || "Store";
    const totalPrice = order.price || order.total || 0;
    const cartItems = order.cart?.cartItems || order.cart?.items || order.items || [];
    const itemCount = cartItems.length;
    const deliveryLocation = order.deliveryLocation || "Not specified";
    const apiCode = order.code || order.orderCode || order.completionCode;
    
    const orderCode = (apiCode !== undefined && apiCode !== null)
      ? (() => {
          const codeStr = String(apiCode).trim();
          const isValid = codeStr !== '' && codeStr !== '0' && codeStr !== 'null' && codeStr !== 'undefined';
          return isValid ? codeStr.padStart(4, '0') : null;
        })()
      : null;

    // Get store/vendor image for display
    const storeImage = order.store?.image || order.vendorImage || order.vendor?.image;
    const firstItem = cartItems[0];
    const itemImage = firstItem?.item?.image || firstItem?.image;
    // Prioritize store image, then item image, then fallback
    const displayImage = storeImage || itemImage || "/Food-item-6.jpg";

    return (
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          p={3}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 1px 4px rgba(0, 0, 0, 0.04)"
          _hover={{
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            borderColor: "gray.300",
          }}
          transition="all 0.2s ease"
        >
          {/* Mobile-Optimized Layout */}
          <VStack align="stretch" spacing={3}>
            {/* Top Row: Store Info & Status */}
            <Flex justifyContent="space-between" alignItems="center">
              <HStack spacing={3} flex={1} minW={0}>
                <Box position="relative" flexShrink={0}>
                  <Image
                    src={displayImage}
                    alt={storeName}
                    w="50px"
                    h="50px"
                    borderRadius="10px"
                    objectFit="cover"
                    fallbackSrc="/Food-item-6.jpg"
                  />
                  {orderCode && (
                    <Badge
                      position="absolute"
                      top="-4px"
                      right="-4px"
                      bg="purple.500"
                      color="white"
                      fontSize="8px"
                      fontWeight="700"
                      fontFamily="mono"
                      px={1}
                      py={0.5}
                      borderRadius="3px"
                    >
                      {orderCode}
                    </Badge>
                  )}
                </Box>
                
                <VStack align="start" spacing={0.5} flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="700" color="gray.900" noOfLines={1}>
                    {storeName}
                  </Text>
                  <HStack spacing={2} fontSize="xs" color="gray.500">
                    <HStack spacing={1}>
                      <IoTimeOutline size={10} />
                      <Text>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }) : ""}
                      </Text>
                    </HStack>
                  </HStack>
                  {/* Enhanced rider info display */}
                  {(() => {
                    const riderPhone = order.riderPhone || order.rider?.phoneNumber || order.rider?.phone;
                    const riderName = order.rider?.firstName || order.rider?.name;
                    const riderId = order.riderId || order.rider?.id || order.rider?._id;
                    const orderProgressStatus = order.orderProgressStatus || order.status || '';
                    
                    // Show rider info for in-progress orders
                    const showRiderInfo = (displayStatus === "In Progress" || displayStatus === "Active") && 
                      (riderPhone || riderName || riderId || 
                       orderProgressStatus.includes('rider') ||
                       orderProgressStatus === 'orderAcceptedByRider');

                    if (!showRiderInfo) return null;

                    return (
                      <HStack spacing={1} fontSize="xs" color="blue.600" bg="blue.50" px={2} py={1} borderRadius="6px" mt={1}>
                        <FiPhone size={10} />
                        <Text fontWeight="600" noOfLines={1}>
                          {riderPhone ? (
                            `${riderName || 'Rider'} - ${riderPhone}`
                          ) : riderName ? (
                            `${riderName} - Contact pending`
                          ) : riderId ? (
                            `Rider assigned - Contact pending`
                          ) : (
                            'Finding rider...'
                          )}
                        </Text>
                      </HStack>
                    );
                  })()}
                </VStack>
              </HStack>
              
              <Badge 
                colorScheme={colors.badge} 
                fontSize="xs" 
                fontWeight="600"
                borderRadius="full"
                px={2}
                py={1}
                flexShrink={0}
              >
                {displayStatus}
              </Badge>
            </Flex>
            
            {/* Bottom Row: Items & Price & Actions */}
            <Flex justifyContent="space-between" alignItems="center">
              <VStack align="start" spacing={0.5} flex={1} minW={0}>
                {/* Items Summary */}
                {itemCount > 0 && (
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    {cartItems.slice(0, 1).map((item: any) => 
                      `${item.quantity || 1}x ${item.name || item.title || item.item?.name || 'Item'}`
                    )}
                    {cartItems.length > 1 && ` +${cartItems.length - 1} more`}
                  </Text>
                )}
                <Text fontSize="sm" fontWeight="700" color="gray.900">
                  ₦{totalPrice.toLocaleString()}
                </Text>
              </VStack>
              
              {/* Actions */}
              <HStack spacing={2} flexShrink={0}>
                <ChakraLink
                  as={NextLink}
                  href={`/user-dashboard/orders/${orderId}`}
                >
                  <Button
                    size="xs"
                    variant="ghost"
                    color="black"
                    fontWeight="600"
                    borderRadius="6px"
                    px={3}
                    py={1.5}
                    fontSize="xs"
                    _hover={{ bg: "gray.50" }}
                  >
                    View
                  </Button>
                </ChakraLink>
                
                {displayStatus === "Delivered" && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="black"
                    fontWeight="600"
                    borderRadius="6px"
                    px={2.5}
                    py={1.5}
                    fontSize="xs"
                    onClick={() => handleReorder(order)}
                    _hover={{ bg: "gray.50" }}
                  >
                    Reorder
                  </Button>
                )}
                
                {(displayStatus === "Pending" || displayStatus === "In Progress") && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="red.500"
                    fontWeight="600"
                    borderRadius="6px"
                    px={2.5}
                    py={1.5}
                    fontSize="xs"
                    onClick={() => handleCancelOrder(orderId)}
                    _hover={{ bg: "red.50" }}
                  >
                    Cancel
                  </Button>
                )}
              </HStack>
            </Flex>
          </VStack>
        </Box>
      </MotionBox>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Box minH="100vh" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Box py={4}>
            <Flex justifyContent="space-between" alignItems="center" mb={6} mt={4}>
              <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="700" color="gray.900">
                My Orders
              </Text>
            </Flex>
            
            <VStack spacing={4} align="stretch">
              <Spinner size="lg" mx="auto" mt={8} />
              <Text textAlign="center" color="gray.500">Loading orders...</Text>
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }
  if (error) {
    return (
      <Box minH="100vh" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Box py={8}>
            <EmptyState
              iconType="error"
              title="Failed to load orders"
              description="There was an error loading your orders. Please try again later."
              actionText="Retry"
              onAction={() => window.location.reload()}
            />
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      <Box maxW="100%" px={0}>
        <Box py={3} px={3}>
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="700" color="gray.900">
                My Orders
              </Text>
              <Text fontSize="xs" color="gray.500">
                {orders.length} order{orders.length !== 1 ? 's' : ''} total
              </Text>
            </VStack>
            <IconButton
              aria-label="Refresh orders"
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              color="gray.500"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              borderRadius="full"
            />
          </Flex>

          {/* Filter Tabs */}
          <HStack 
            spacing={0} 
            mb={4}
            overflowX="auto"
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {statsData.map((stat, index) => (
              <Button
                key={stat.id}
                size="sm"
                variant="ghost"
                bg={selectedFilter === stat.id ? "black" : "transparent"}
                color={selectedFilter === stat.id ? "white" : "gray.500"}
                onClick={() => setSelectedFilter(stat.id)}
                borderRadius={index === 0 ? "16px 6px 6px 16px" : index === statsData.length - 1 ? "6px 16px 16px 6px" : "6px"}
                px={4}
                py={2}
                minW="auto"
                whiteSpace="nowrap"
                fontWeight={selectedFilter === stat.id ? "600" : "500"}
                fontSize="xs"
                _hover={{
                  bg: selectedFilter === stat.id ? "gray.800" : "gray.100"
                }}
                transition="all 0.2s ease"
              >
                {stat.label}
              </Button>
            ))}
          </HStack>

          {orders.length === 0 ? (
            <EmptyState
              iconType="orders"
              title="No orders yet"
              description="You haven't placed any orders yet. Start exploring stores and place your first order!"
              actionText="Explore stores"
              onAction={() => router.push("/explore")}
              variant="illustrated"
            />
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredOrders.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <VStack spacing={3}>
                    <Flex
                      w={12}
                      h={12}
                      borderRadius="full"
                      bg="gray.100"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FiPackage size={24} color="gray.400" />
                    </Flex>
                    <VStack spacing={1}>
                      <Text fontSize="md" fontWeight="600" color="gray.600">
                        No {selectedFilter === "all" ? "" : selectedFilter} orders found
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {selectedFilter === "all" 
                          ? "Start ordering to see your orders here"
                          : `You don't have any ${selectedFilter} orders yet`
                        }
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              ) : (
                <VStack spacing={2} align="stretch">
                  <AnimatePresence mode="wait">
                    {filteredOrders.map((order: any, index: number) => (
                      <OrderCard key={order._id || order.id} order={order} index={index} />
                    ))}
                  </AnimatePresence>
                </VStack>
              )}
            </VStack>
          )}
        </Box>
        <Box mb="5em" />
      </Box>
    </Box>
  );
}



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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Divider,
  Flex,
  chakra,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiClock, FiCheckCircle, FiXCircle, FiPackage } from "react-icons/fi";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../EmptyState";
import { useToast } from "@chakra-ui/react";
import { useCartStore } from "@/lib/cartStore";

const MotionBox = motion(Box);

const OrdersTab: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const { addItem, clearCart } = useCartStore();

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

  // Render order card component
  const OrderCard = ({ order, index }: { order: any; index: number }) => {
    // Handle different status field names from backend
    const rawStatus = (order.status || order.orderState || "").toString().toLowerCase();
    
    // Convert backend status to user-friendly display status
    const getDisplayStatus = (status: string) => {
      if (status.includes("complete")) return "Completed";
      if (status.includes("progress") || status.includes("rider") || status.includes("ongoing")) return "Active";
      if (status.includes("pend")) return "Pending";
      if (status.includes("cancel")) return "Cancelled";
      return "Active"; // Default to Active for any other status
    };
    
    const displayStatus = getDisplayStatus(rawStatus);
    
    const scheme = displayStatus === "Completed"
      ? "green"
      : displayStatus === "Active"
      ? "orange"
      : displayStatus === "Pending"
      ? "orange"
      : displayStatus === "Cancelled"
      ? "red"
      : "gray";

    // Get order ID - backend returns 'id' or '_id'
    const orderId = order.id || order._id;
    const orderIdDisplay = orderId ? (typeof orderId === 'string' ? orderId.slice(-8) : orderId.toString().slice(-8)) : 'N/A';
    
    // Get store name - backend returns store object
    const storeName = order.store?.name || order.vendorName || order.storeName || "Store";
    
    // Get total price - backend returns 'price' not 'total'
    const totalPrice = order.price || order.total || 0;
    
    // Get detailed items - backend returns cart with cartItems or items array
    const cartItems = order.cart?.cartItems || order.cart?.items || order.items || [];
    const itemCount = cartItems.length;
    
    // Get delivery details
    const deliveryLocation = order.deliveryLocation || "Not specified";
    const deliveryInstructions = order.deliveryInstruction || order.deliveryInstructions || "No special instructions";
    const deliveryFee = order.deliveryFee || 0;
    const serviceCharge = order.serviceCharge || 0;
    const couponPrice = order.couponPrice || 0;
    
    // Get order completion code (fallback to local storage if API gives 0)
    const storedCode = (typeof window !== 'undefined' ? localStorage.getItem('boiboi_last_order_code') : null) || '';
    const apiCode = order.code;
    const orderCode = (apiCode && String(apiCode) !== '0' ? String(apiCode) : (storedCode && storedCode !== '0' ? storedCode : null));

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        bg="white"
        borderRadius={{ base: "12px", md: "16px" }}
        p={{ base: 3, md: 5 }}
        border="1px solid"
        borderColor="gray.200"
        position="relative"
        zIndex={4}
        _hover={{
          transform: "translateY(-2px)",
        }}
      >
        <VStack spacing={{ base: 2, md: 3 }} align="stretch">
          {/* Header Row */}
          <Flex justify="space-between" align="flex-start" gap={2}>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="700" color="#000" fontSize={{ base: 'sm', md: 'lg' }} noOfLines={1}>
                #{orderIdDisplay}
              </Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                {storeName}
              </Text>
            </VStack>
            <Badge 
              colorScheme={scheme}
              px={{ base: 2, md: 3 }}
              py={1}
              borderRadius="full"
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="600"
              whiteSpace="nowrap"
            >
              {displayStatus}
            </Badge>
          </Flex>

          <Divider />

          {/* Details Row */}
          <Flex justify="space-between" align="center" gap={2}>
            <VStack align="start" spacing={0}>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : "Unknown date"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ""}
              </Text>
            </VStack>
            <VStack align="end" spacing={1}>
              {orderCode && (displayStatus === "Active" || displayStatus === "Pending") && (
                <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} py={1} fontSize="10px">
                  Code: {orderCode}
                </Badge>
              )}
              {totalPrice > 0 && (
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="800" color="brand.primary">
                ₦{totalPrice.toLocaleString()}
              </Text>
              )}
            </VStack>
          </Flex>

          {/* Detailed Items Preview */}
          {itemCount > 0 && (
            <Box bg="gray.50" p={{ base: 2, md: 3 }} borderRadius="8px">
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.700" fontWeight="600" mb={2}>
                Order Items ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </Text>
              {cartItems.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  {cartItems.slice(0, 3).map((item: any, idx: number) => (
                    <HStack key={idx} spacing={2} justify="space-between">
                      <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1}>
                        • {item.name || item.title || item.item?.name || 'Item'}
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          ×{item.quantity || 1}
                        </Text>
                        <Text fontSize="xs" color="gray.700" fontWeight="600">
                          ₦{((item.price || item.item?.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </Text>
                      </HStack>
                    </HStack>
                  ))}
                  {cartItems.length > 3 && (
                    <Text fontSize="xs" color="brand.primary" fontWeight="500">
                      + {cartItems.length - 3} more item{cartItems.length - 3 > 1 ? 's' : ''}
                    </Text>
                  )}
                </VStack>
              )}
            </Box>
          )}

          {/* Order Details */}
          <Box bg="blue.50" p={{ base: 2, md: 3 }} borderRadius="8px">
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="blue.700" fontWeight="600" mb={2}>
              Order Details
            </Text>
            <VStack align="stretch" spacing={1}>
              {orderCode && (displayStatus === "Active" || displayStatus === "Pending") && (
                <Box bg="purple.100" p={2} borderRadius="6px" mb={1}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="purple.700" fontWeight="600">
                      Completion Code:
                    </Text>
                    <Text fontSize="xs" color="purple.800" fontWeight="800" fontFamily="mono">
                      {orderCode}
                    </Text>
                  </HStack>
                  <Text fontSize="10px" color="purple.600" mt={1}>
                    Give this code to your rider when they arrive
                  </Text>
                </Box>
              )}
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">Delivery Location:</Text>
                <Text fontSize="xs" color="gray.700" fontWeight="500" noOfLines={1}>
                  {deliveryLocation}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">Delivery Instructions:</Text>
                <Text fontSize="xs" color="gray.700" fontWeight="500" noOfLines={1}>
                  {deliveryInstructions}
                </Text>
              </HStack>
              {deliveryFee > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600">Delivery Fee:</Text>
                  <Text fontSize="xs" color="gray.700" fontWeight="600">
                    ₦{deliveryFee.toLocaleString()}
                  </Text>
                </HStack>
              )}
              {serviceCharge > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600">Service Charge:</Text>
                  <Text fontSize="xs" color="gray.700" fontWeight="600">
                    ₦{serviceCharge.toLocaleString()}
                  </Text>
                </HStack>
              )}
              {couponPrice > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="green.600">Coupon Discount:</Text>
                  <Text fontSize="xs" color="green.600" fontWeight="600">
                    -₦{couponPrice.toLocaleString()}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Actions Row */}
          <Flex justify="space-between" align="center" gap={2} pt={2}>
            <ChakraLink
              as={NextLink}
              href={`/user-dashboard/orders/${orderId}`}
              color="brand.primary"
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="600"
              _hover={{ color: "brand.primaryDark", textDecoration: "underline" }}
            >
              View Details →
            </ChakraLink>
            
            <HStack spacing={2}>
              {(displayStatus === "Pending" || displayStatus === "Active") && (
                <Button
                  size={{ base: 'xs', md: 'sm' }}
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleCancelOrder(orderId)}
                  fontSize={{ base: '10px', md: '12px' }}
                >
                  Cancel
                </Button>
              )}
              {displayStatus === "Completed" && (
                <Button
                  size={{ base: 'xs', md: 'sm' }}
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: "brand.primaryDark" }}
                  onClick={() => handleReorder(order)}
                  fontSize={{ base: '10px', md: '12px' }}
                >
                  Reorder
                </Button>
              )}
            </HStack>
          </Flex>
        </VStack>
      </MotionBox>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
        <Wrapper>
          <Box py={4}>
            <Flex justify="space-between" align="center" mb={6} mt={4}>
              <Skeleton height="28px" width="120px" />
              <Skeleton height="36px" width="36px" borderRadius="full" />
            </Flex>
            
            <VStack spacing={3} align="stretch">
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} bg="white" borderRadius="16px" p={5}>
                  <Flex justify="space-between" mb={3}>
                    <Skeleton height="20px" width="100px" />
                    <Skeleton height="24px" width="80px" borderRadius="full" />
                  </Flex>
                  <Skeleton height="16px" width="150px" mb={2} />
                  <Skeleton height="16px" width="200px" />
                </Box>
              ))}
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
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
    <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
      <Wrapper>
        <Box py={4} position="relative" zIndex={1}>
          {/* Header with Refresh */}
          <Flex justify="space-between" align="center" mb={6} mt={4}>
            <HStack spacing={2}>
              <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="700" color="#000">
                My Orders
              </Text>
              {isRefreshing && <Spinner size="sm" color="brand.primary" />}
            </HStack>
            <IconButton
              aria-label="Refresh orders"
              icon={<FiRefreshCw />}
              size={{ base: 'sm', md: 'md' }}
              variant="ghost"
              color="brand.primary"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              _hover={{ bg: "rgba(59, 23, 79, 0.1)" }}
            />
          </Flex>

          
          {orders.length === 0 ? (
            <EmptyState
              iconType="orders"
              title="No orders yet"
              description="You haven't placed any orders yet. Start exploring stores and place your first order!"
              actionText="Explore stores"
              onAction={() => window.location.reload()}
              variant="illustrated"
            />
          ) : (
            <Tabs 
              variant="soft-rounded" 
              colorScheme="purple" 
              index={activeTab} 
              onChange={setActiveTab}
              isFitted={false}
              position="relative"
              zIndex={2}
            >
              <TabList 
                mb={4} 
                overflowX="auto" 
                overflowY="hidden"
                css={{
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
                pb={2}
              >
                <Tab 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={{ base: 3, md: 4 }}
                  minW={{ base: 'auto', md: '100px' }}
                  _selected={{ 
                    bg: 'brand.primary', 
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  All ({allOrders.length})
                </Tab>
                <Tab 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={{ base: 3, md: 4 }}
                  minW={{ base: 'auto', md: '100px' }}
                  _selected={{ 
                    bg: 'orange.500', 
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  Active ({activeOrders.length})
                </Tab>
                <Tab 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={{ base: 3, md: 4 }}
                  minW={{ base: 'auto', md: '100px' }}
                  _selected={{ 
                    bg: 'green.500', 
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  Completed ({completedOrders.length})
                </Tab>
                <Tab 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={{ base: 3, md: 4 }}
                  minW={{ base: 'auto', md: '100px' }}
                  _selected={{ 
                    bg: 'red.500', 
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  Cancelled ({cancelledOrders.length})
                </Tab>
              </TabList>

              <TabPanels>
                {/* All Orders */}
                <TabPanel px={0} position="relative" zIndex={3}>
                  <AnimatePresence mode="wait">
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                      {allOrders.map((order: any, index: number) => (
                        <OrderCard key={order._id} order={order} index={index} />
                      ))}
                    </VStack>
                  </AnimatePresence>
                </TabPanel>

                {/* Active Orders */}
                <TabPanel px={0} position="relative" zIndex={3}>
                  <AnimatePresence mode="wait">
                    {activeOrders.length === 0 ? (
                      <EmptyState
                        iconType="orders"
                        title="No active orders"
                        description="You don't have any active orders at the moment."
                        variant="minimal"
                      />
                    ) : (
                      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        {activeOrders.map((order: any, index: number) => (
                          <OrderCard key={order._id} order={order} index={index} />
                        ))}
                      </VStack>
                    )}
                  </AnimatePresence>
                </TabPanel>

                {/* Completed Orders */}
                <TabPanel px={0} position="relative" zIndex={3}>
                  <AnimatePresence mode="wait">
                    {completedOrders.length === 0 ? (
                      <EmptyState
                        iconType="orders"
                        title="No completed orders"
                        description="You don't have any completed orders yet."
                        variant="minimal"
                      />
                    ) : (
                      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        {completedOrders.map((order: any, index: number) => (
                          <OrderCard key={order._id} order={order} index={index} />
                        ))}
                      </VStack>
                    )}
                  </AnimatePresence>
                </TabPanel>

                {/* Cancelled Orders */}
                <TabPanel px={0} position="relative" zIndex={3}>
                  <AnimatePresence mode="wait">
                    {cancelledOrders.length === 0 ? (
                      <EmptyState
                        iconType="orders"
                        title="No cancelled orders"
                        description="You don't have any cancelled orders."
                        variant="minimal"
                      />
                    ) : (
                      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        {cancelledOrders.map((order: any, index: number) => (
                          <OrderCard key={order._id} order={order} index={index} />
                        ))}
                      </VStack>
                    )}
                  </AnimatePresence>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default OrdersTab;

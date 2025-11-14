"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Button,
  IconButton,
  Flex,
  Image,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiRefreshCw, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiChevronRight } from "react-icons/fi";
import Wrapper from "../../components/Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../../components/EmptyState";
import { useCartStore } from "@/lib/cartStore";
import { getAuthToken } from "@/lib/auth";

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { addItem, clearCart } = useCartStore();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
    setTimeout(() => setIsRefreshing(false), 500);
    toast({
      title: "Refreshed",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => api.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", customerId] });
      toast({
        title: "Order cancelled",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Cancel this order?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleReorder = async (order: any) => {
    try {
      clearCart();
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
          title: "Added to cart",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/cart");
      }
    } catch (error) {
      toast({
        title: "Failed to reorder",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const orders = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
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

  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case "active": return activeOrders;
      case "completed": return completedOrders;
      case "cancelled": return cancelledOrders;
      default: return allOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const filters = [
    { id: "all", label: "All", count: allOrders.length, icon: FiPackage },
    { id: "active", label: "Active", count: activeOrders.length, icon: FiClock },
    { id: "completed", label: "Done", count: completedOrders.length, icon: FiCheckCircle },
    { id: "cancelled", label: "Cancelled", count: cancelledOrders.length, icon: FiXCircle },
  ];

  const OrderCard = ({ order }: { order: any }) => {
    const rawStatus = (order.status || order.orderState || "").toString().toLowerCase();
    
    const getDisplayStatus = (status: string) => {
      if (status.includes("complete")) return "Delivered";
      if (status.includes("progress") || status.includes("rider") || status.includes("ongoing")) return "In Progress";
      if (status.includes("pend")) return "Pending";
      if (status.includes("cancel")) return "Cancelled";
      return "Active";
    };
    
    const displayStatus = getDisplayStatus(rawStatus);
    
    const statusColors: any = {
      "Delivered": { bg: "green.50", text: "green.700", badge: "green" },
      "In Progress": { bg: "orange.50", text: "orange.700", badge: "orange" },
      "Pending": { bg: "blue.50", text: "blue.700", badge: "blue" },
      "Cancelled": { bg: "red.50", text: "red.700", badge: "red" },
      "Active": { bg: "blue.50", text: "blue.700", badge: "blue" },
    };
    
    const colors = statusColors[displayStatus] || statusColors["Active"];
    const orderId = order.id || order._id;
    const storeName = order.store?.name || order.vendorName || order.storeName || "Store";
    const totalPrice = order.price || order.total || 0;
    const cartItems = order.cart?.cartItems || order.cart?.items || order.items || [];
    const storeImage = order.store?.image || order.vendorImage || order.vendor?.image;
    const firstItem = cartItems[0];
    const itemImage = firstItem?.item?.image || firstItem?.image;
    const displayImage = storeImage || itemImage || "/Food-item-6.jpg";

    return (
      <Box
        as={NextLink}
        href={`/user-dashboard/orders/${orderId}`}
        display="block"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="sm"
        border="1px"
        borderColor="gray.100"
        transition="all 0.2s"
        _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      >
        <Flex p={4} gap={3}>
          {/* Image */}
          <Box position="relative" flexShrink={0}>
            <Image
              src={displayImage}
              alt={storeName}
              w="70px"
              h="70px"
              borderRadius="lg"
              objectFit="cover"
              fallbackSrc="/Food-item-6.jpg"
            />
            <Badge
              position="absolute"
              top={-2}
              right={-2}
              colorScheme={colors.badge}
              fontSize="2xs"
              px={2}
              py={0.5}
              borderRadius="md"
            >
              {displayStatus}
            </Badge>
          </Box>

          {/* Content */}
          <VStack align="start" spacing={1} flex={1} minW={0}>
            <Text fontSize="md" fontWeight="700" color="gray.900" noOfLines={1}>
              {storeName}
            </Text>
            
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
              {order.createdAt && ` • ${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </Text>
            
            <Text fontSize="lg" fontWeight="700" color="gray.900" mt={1}>
              ₦{totalPrice.toLocaleString()}
            </Text>
          </VStack>

          {/* Arrow */}
          <Flex align="center" flexShrink={0}>
            <FiChevronRight size={20} color="#9CA3AF" />
          </Flex>
        </Flex>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Flex h="60vh" align="center" justify="center">
            <VStack spacing={3}>
              <Spinner size="lg" color="purple.600" thickness="3px" />
              <Text color="gray.600" fontSize="sm">Loading orders...</Text>
            </VStack>
          </Flex>
        </Wrapper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Box py={8}>
            <EmptyState
              iconType="error"
              title="Failed to load orders"
              description="Please try again"
              actionText="Retry"
              onAction={() => window.location.reload()}
            />
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      <Wrapper>
        <Box py={4}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Text fontSize="2xl" fontWeight="700" color="gray.900">
                My Orders
              </Text>
              <Text fontSize="sm" color="gray.600">
                {orders.length} total order{orders.length !== 1 ? 's' : ''}
              </Text>
            </Box>
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw />}
              size="md"
              variant="ghost"
              colorScheme="purple"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              borderRadius="full"
            />
          </Flex>

          {/* Filter Pills */}
          <HStack 
            spacing={2} 
            mb={5}
            overflowX="auto"
            pb={2}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {filters.map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                leftIcon={<filter.icon size={14} />}
                bg={selectedFilter === filter.id ? "purple.600" : "white"}
                color={selectedFilter === filter.id ? "white" : "gray.700"}
                onClick={() => setSelectedFilter(filter.id)}
                borderRadius="full"
                px={4}
                fontWeight="600"
                fontSize="sm"
                border="1px"
                borderColor={selectedFilter === filter.id ? "purple.600" : "gray.200"}
                _hover={{
                  bg: selectedFilter === filter.id ? "purple.700" : "gray.50"
                }}
                flexShrink={0}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </HStack>

          {/* Orders List */}
          {orders.length === 0 ? (
            <EmptyState
              iconType="orders"
              title="No orders yet"
              description="Start exploring stores and place your first order"
              actionText="Explore Stores"
              onAction={() => router.push("/user-dashboard/stores")}
            />
          ) : filteredOrders.length === 0 ? (
            <Box textAlign="center" py={12}>
              <VStack spacing={3}>
                <Flex
                  w={16}
                  h={16}
                  borderRadius="full"
                  bg="gray.100"
                  align="center"
                  justify="center"
                >
                  <FiPackage size={32} color="#9CA3AF" />
                </Flex>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  No {selectedFilter} orders
                </Text>
                <Text fontSize="sm" color="gray.500">
                  You don't have any {selectedFilter} orders yet
                </Text>
              </VStack>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredOrders.map((order: any) => (
                <OrderCard key={order._id || order.id} order={order} />
              ))}
            </VStack>
          )}
        </Box>
      </Wrapper>
    </Box>
  );
}

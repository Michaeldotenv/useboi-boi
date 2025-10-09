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
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../EmptyState";
import { useToast } from "@chakra-ui/react";
import { useCartStore } from "@/lib/cartStore";

const OrdersTab: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { addItem, clearCart } = useCartStore();

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";

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
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
  });

  // Trigger load animation when data is ready
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  const orders = (data as any)?.data || data || [];

  if (isLoading) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <VStack spacing={4} align="stretch">
              <Spinner size="lg" mx="auto" mt={8} />
              <Text textAlign="center" color="gray.500">Loading your orders...</Text>
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
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
    <Box minH="100vh" bg="#F2F2F7" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
      <Wrapper>
        <Box py={4}>
          <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="700" color="#000" mb={6} mt={4}>
            My Orders
          </Text>
          
          {orders.length === 0 ? (
            <EmptyState
              iconType="orders"
              title="No orders yet"
              description="You haven't placed any orders yet. Start exploring stores and place your first order!"
              actionText="Explore stores"
              onAction={() => {
                // This would be handled by the navigation context
                window.location.reload();
              }}
              variant="illustrated"
            />
          ) : (
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {[...orders]
                .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .map((order: any, index: number) => {
                  const status = (order.status || order.orderState || "").toString().toLowerCase();
                  const scheme = status.includes("complete")
                    ? "green"
                    : status.includes("progress") || status.includes("rider")
                    ? "orange"
                    : status.includes("pend")
                    ? "orange"
                    : status.includes("cancel")
                    ? "red"
                    : "gray";

                  const getStatusColor = (status: string) => {
                    if (status.includes("complete")) return "green.500";
                    if (status.includes("progress") || status.includes("rider")) return "brand.primary";
                    if (status.includes("pend")) return "orange.500";
                    if (status.includes("cancel")) return "red.500";
                    return "gray.500";
                  };

                  return (
                    <Box
                      key={order._id}
                      bg="white"
                      borderRadius="16px"
                      p={{ base: 4, md: 5 }}
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                      }}
                      transition="all 0.3s ease"
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" alignItems="center">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="700" color="#000" fontSize={{ base: 'md', md: 'lg' }}>
                              #{order.orderId || order._id?.slice(-8)}
                            </Text>
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                              {order.vendorName || order.storeName || "Store"}
                            </Text>
                          </VStack>
                          <Badge 
                            colorScheme={scheme}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            {order.status || order.orderState}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between" alignItems="center">
                          <VStack align="start" spacing={1}>
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown date"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}
                            </Text>
                          </VStack>
                          {order.total && (
                            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="700" color="#000">
                              ₦{order.total.toLocaleString()}
                            </Text>
                          )}
                        </HStack>

                        {order.items && order.items.length > 0 && (
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Items: {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </Text>
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <Text key={idx} fontSize="xs" color="gray.500">
                                • {item.name || item.title} (x{item.quantity || 1})
                              </Text>
                            ))}
                            {order.items.length > 2 && (
                              <Text fontSize="xs" color="gray.500">
                                • and {order.items.length - 2} more...
                              </Text>
                            )}
                          </Box>
                        )}

                        <HStack justify="space-between" alignItems="center" pt={2}>
                          <ChakraLink
                            as={NextLink}
                            href={`/user-dashboard/orders/${order._id}`}
                            color="brand.primary"
                            fontSize="sm"
                            fontWeight="600"
                            _hover={{ color: "brand.primaryDark" }}
                          >
                            View Details
                          </ChakraLink>
                          
                          <HStack spacing={2}>
                            {status.includes("complete") && (
                              <Text fontSize="xs" color="green.500" fontWeight="500">
                                ✓ Delivered
                              </Text>
                            )}
                            {status.includes("progress") && (
                              <Text fontSize="xs" color="brand.primary" fontWeight="500">
                                🚚 On the way
                              </Text>
                            )}
                            {status.includes("pend") && (
                              <Text fontSize="xs" color="orange.500" fontWeight="500">
                                ⏳ Processing
                              </Text>
                            )}
                            
                            {/* Action Buttons */}
                            {status.includes("pend") && (
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleCancelOrder(order._id)}
                                ml={2}
                              >
                                Cancel
                              </Button>
                            )}
                            {status.includes("complete") && (
                              <Button
                                size="xs"
                                colorScheme="green"
                                variant="outline"
                                onClick={() => handleReorder(order)}
                                ml={2}
                              >
                                Reorder
                              </Button>
                            )}
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
            </VStack>
          )}
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default OrdersTab;

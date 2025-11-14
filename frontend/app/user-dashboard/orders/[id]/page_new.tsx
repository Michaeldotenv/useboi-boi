"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Image,
  Flex,
  useToast,
  Spinner,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiClock, FiCheckCircle, FiMapPin, FiPhone, FiPackage, FiTruck, FiCopy } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Wrapper from '../../../components/Wrapper';
import { api } from '@/lib/api';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => api.order(params.id),
    enabled: Boolean(params.id),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const order = (orderData as any)?.data || orderData;

  const embeddedItems = order?.items || order?.cart?.cartItems || order?.cart?.items || [];
  const cartIdForOrder = order?.cartId || order?.cart?.id || order?.cart?._id || '';
  const shouldFetchCartItems = embeddedItems.length === 0 && Boolean(cartIdForOrder) && Boolean(order);
  
  const { data: cartItemsData } = useQuery({
    queryKey: ['cart-items', cartIdForOrder],
    queryFn: () => api.cartItems(cartIdForOrder),
    enabled: shouldFetchCartItems,
  });

  const completeOrderMutation = useMutation({
    mutationFn: ({ orderId, code }: { orderId: string; code: string }) => api.completeOrder(orderId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', params.id] });
      toast({
        title: "Order completed",
        description: "Thank you for confirming delivery!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to complete",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Wrapper>
          <Flex h="60vh" align="center" justify="center">
            <VStack spacing={3}>
              <Spinner size="lg" color="purple.600" thickness="3px" />
              <Text color="gray.600" fontSize="sm">Loading order...</Text>
            </VStack>
          </Flex>
        </Wrapper>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Wrapper>
          <Box py={8}>
            <Text textAlign="center" color="gray.600">Order not found</Text>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  const apiCodeRaw = order?.code || order?.orderCode || order?.completionCode;
  const orderCode = (apiCodeRaw !== undefined && apiCodeRaw !== null)
    ? (() => {
        const codeStr = String(apiCodeRaw).trim();
        const isValid = codeStr !== '' && codeStr !== '0' && codeStr !== 'null' && codeStr !== 'undefined';
        return isValid ? codeStr.padStart(4, '0') : null;
      })()
    : null;

  const handleCompleteOrder = async () => {
    if (!orderCode) {
      toast({
        title: "Code not found",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    if (window.confirm("Confirm delivery received?")) {
      setIsCompleting(true);
      try {
        await completeOrderMutation.mutateAsync({ orderId: params.id, code: orderCode });
      } finally {
        setIsCompleting(false);
      }
    }
  };

  const handleCopyCode = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode);
      toast({
        title: "Copied!",
        status: "success",
        duration: 2000,
      });
    }
  };

  const orderProgressStatus = order.orderProgressStatus || order.status || '';
  
  const getOrderStatus = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('complete')) {
      return { label: 'Delivered', color: 'green' };
    }
    if (statusLower.includes('cancel')) {
      return { label: 'Cancelled', color: 'red' };
    }
    if (statusLower.includes('ongoing') || statusLower.includes('rider') || statusLower.includes('vendor')) {
      return { label: 'In Progress', color: 'orange' };
    }
    return { label: 'Processing', color: 'blue' };
  };

  const orderStatus = getOrderStatus(order.status || order.orderProgressStatus || '');
  const fetchedCartItems = (cartItemsData as any)?.data || cartItemsData || [];
  const orderItems = embeddedItems.length > 0 ? embeddedItems : fetchedCartItems;

  const riderPhone = order.riderPhone || order.rider?.phoneNumber || order.rider?.phone;
  const riderName = order.rider?.firstName || order.rider?.name;
  const showRiderInfo = (orderProgressStatus.includes('rider') || orderProgressStatus === 'riderAtUserLocation') && riderPhone;

  return (
    <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      <Wrapper>
        <Box py={4}>
          {/* Header */}
          <HStack spacing={3} mb={5}>
            <IconButton
              aria-label="Back"
              icon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => router.back()}
              size="md"
              borderRadius="full"
            />
            <Box flex={1}>
              <Text fontSize="xl" fontWeight="700" color="gray.900">
                Order Details
              </Text>
              <Text fontSize="sm" color="gray.600">
                {order.store?.name || order.vendorName || "Store"}
              </Text>
            </Box>
          </HStack>

          <VStack spacing={4} align="stretch">
            {/* Delivery Code Card */}
            {orderCode && orderStatus.label !== 'Delivered' && orderStatus.label !== 'Cancelled' && (
              <Box 
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                borderRadius="xl" 
                p={5} 
                color="white"
                boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
              >
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <Icon as={FiPackage} boxSize={5} />
                    <Text fontSize="sm" fontWeight="600">
                      Delivery Code
                    </Text>
                  </HStack>
                  <Flex
                    bg="whiteAlpha.200"
                    borderRadius="lg"
                    p={4}
                    align="center"
                    justify="center"
                    gap={3}
                    w="full"
                  >
                    <Text 
                      fontSize="3xl" 
                      fontWeight="800" 
                      fontFamily="mono"
                      letterSpacing="wider"
                    >
                      {orderCode}
                    </Text>
                    <IconButton
                      aria-label="Copy code"
                      icon={<FiCopy />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      onClick={handleCopyCode}
                      _hover={{ bg: "whiteAlpha.300" }}
                    />
                  </Flex>
                  <Text fontSize="xs" opacity={0.9} textAlign="center">
                    Show this code to your delivery person
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Rider Contact Card */}
            {showRiderInfo && (
              <Box 
                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                borderRadius="xl" 
                p={5} 
                color="white"
                boxShadow="0 10px 30px rgba(16, 185, 129, 0.3)"
              >
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <Icon as={FiPhone} boxSize={5} />
                    <Text fontSize="sm" fontWeight="600">
                      Your Rider
                    </Text>
                  </HStack>
                  <Text fontSize="lg" fontWeight="700">
                    {riderName || 'Rider'}
                  </Text>
                  <Button
                    as="a"
                    href={`tel:${riderPhone}`}
                    bg="whiteAlpha.300"
                    color="white"
                    size="md"
                    w="full"
                    leftIcon={<FiPhone />}
                    _hover={{ bg: "whiteAlpha.400" }}
                  >
                    Call {riderPhone}
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Status Card */}
            <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bg={`${orderStatus.color}.50`}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiTruck} boxSize={6} color={`${orderStatus.color}.500`} />
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="700" color="gray.900">
                      Order Status
                    </Text>
                    <HStack spacing={2} fontSize="xs" color="gray.500">
                      <Icon as={FiClock} boxSize={3} />
                      <Text>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                <Badge 
                  colorScheme={orderStatus.color} 
                  px={3} 
                  py={1.5} 
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="600"
                >
                  {orderStatus.label}
                </Badge>
              </Flex>
              
              <Divider my={4} />
              
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">Total Amount</Text>
                <Text fontSize="2xl" fontWeight="800" color="gray.900">
                  ₦{(order.price || order.totalPrice || 0).toLocaleString()}
                </Text>
              </Flex>
            </Box>

            {/* Order Items */}
            <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
              <HStack spacing={2} mb={4}>
                <Icon as={FiPackage} boxSize={5} color="purple.500" />
                <Text fontSize="md" fontWeight="700" color="gray.900">
                  Order Items ({orderItems.length})
                </Text>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                {orderItems.length > 0 ? orderItems.map((item: any, index: number) => {
                  const itemData = item.item || item;
                  const quantity = item.quantity || 1;
                  const itemPrice = itemData.price || item.price || 0;
                  
                  return (
                    <Flex key={index} justify="space-between" align="center" py={2}>
                      <HStack spacing={3} flex={1}>
                        <Flex
                          w={10}
                          h={10}
                          borderRadius="lg"
                          bg="purple.50"
                          align="center"
                          justify="center"
                        >
                          <Text fontSize="sm" fontWeight="700" color="purple.600">
                            {quantity}×
                          </Text>
                        </Flex>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="600" color="gray.900" noOfLines={1}>
                            {itemData.name || itemData.title || 'Item'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ₦{itemPrice.toLocaleString()} each
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700" color="gray.900">
                        ₦{(itemPrice * quantity).toLocaleString()}
                      </Text>
                    </Flex>
                  );
                }) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                    No items found
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Order Summary */}
            <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
              <Text fontSize="md" fontWeight="700" color="gray.900" mb={4}>
                Order Summary
              </Text>
              
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.600">Subtotal</Text>
                  <Text fontSize="sm" fontWeight="600">
                    ₦{(() => {
                      const subtotal = orderItems.reduce((sum: number, it: any) => {
                        const d = it.item || it;
                        const q = it.quantity || 1;
                        const p = d.price || it.price || 0;
                        return sum + p * q;
                      }, 0);
                      return Number(subtotal || 0).toLocaleString();
                    })()}
                  </Text>
                </Flex>
                
                {order.deliveryFee > 0 && (
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">Delivery Fee</Text>
                    <Text fontSize="sm" fontWeight="600">₦{order.deliveryFee.toLocaleString()}</Text>
                  </Flex>
                )}
                
                {order.serviceCharge > 0 && (
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">Service Charge</Text>
                    <Text fontSize="sm" fontWeight="600">₦{order.serviceCharge.toLocaleString()}</Text>
                  </Flex>
                )}
                
                {order.couponPrice > 0 && (
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="green.600">Discount</Text>
                    <Text fontSize="sm" fontWeight="600" color="green.600">-₦{order.couponPrice.toLocaleString()}</Text>
                  </Flex>
                )}
                
                <Divider />
                
                <Flex justify="space-between">
                  <Text fontSize="md" fontWeight="700">Total</Text>
                  <Text fontSize="md" fontWeight="700" color="gray.900">
                    ₦{(order.price || order.totalPrice || 0).toLocaleString()}
                  </Text>
                </Flex>
              </VStack>
            </Box>
            
            {/* Delivery Info */}
            <Box bg="white" borderRadius="xl" p={5} boxShadow="sm">
              <HStack spacing={2} mb={4}>
                <Icon as={FiMapPin} boxSize={5} color="green.500" />
                <Text fontSize="md" fontWeight="700" color="gray.900">
                  Delivery Information
                </Text>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                {order.deliveryLocation && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Address</Text>
                    <Text fontSize="sm" fontWeight="500" color="gray.800">
                      {order.deliveryLocation}
                    </Text>
                  </Box>
                )}
                
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Payment</Text>
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} boxSize={4} color="green.500" />
                    <Text fontSize="sm" fontWeight="500" color="green.600">
                      Paid via {order.checkoutType === 'wallet' ? 'Wallet' : 'Card'}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>
            
            {/* Confirm Delivery Button */}
            {orderStatus.label !== 'Delivered' && orderStatus.label !== 'Cancelled' && orderProgressStatus === 'riderAtUserLocation' && (
              <Button
                size="lg"
                colorScheme="green"
                leftIcon={<FiCheckCircle />}
                onClick={handleCompleteOrder}
                isLoading={isCompleting}
                loadingText="Confirming..."
                w="full"
                fontWeight="600"
              >
                Confirm Delivery
              </Button>
            )}
          </VStack>
        </Box>
      </Wrapper>
    </Box>
  );
}

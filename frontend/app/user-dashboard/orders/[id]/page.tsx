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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Icon,
  useColorModeValue,
  Container,
  Grid,
  GridItem,
  IconButton,
} from '@chakra-ui/react';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaPhone, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { FiClock, FiCheckCircle, FiMapPin, FiPhone, FiPackage, FiTruck } from 'react-icons/fi';
import { BiRestaurant } from 'react-icons/bi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Wrapper from '../../../components/Wrapper';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

const OrderDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch order details with real-time polling
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => api.order(params.id),
    enabled: Boolean(params.id),
    refetchInterval: 10000, // Poll every 10 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  const order = (orderData as any)?.data || orderData;

  // Pre-fetch cart items if needed (hook must be at top level, before early returns)
  const embeddedItems = order?.items || order?.cart?.cartItems || order?.cart?.items || [];
  const cartIdForOrder = order?.cartId || order?.cart?.id || order?.cart?._id || '';
  const shouldFetchCartItems = embeddedItems.length === 0 && Boolean(cartIdForOrder) && Boolean(order);
  const { data: cartItemsData } = useQuery({
    queryKey: ['cart-items', cartIdForOrder],
    queryFn: () => api.cartItems(cartIdForOrder),
    enabled: shouldFetchCartItems, // Only fetch if we have an order and need to fetch cart items
  });

  // Complete order mutation (hook must be at top level, before early returns)
  const completeOrderMutation = useMutation({
    mutationFn: ({ orderId, code }: { orderId: string; code: string }) => api.completeOrder(orderId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', params.id] });
      toast({
        title: "Order completed",
        description: "Thank you for confirming your order delivery!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to complete order",
        description: error.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Early returns after all hooks
  if (isLoading) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <Flex justifyContent="center" alignItems="center" minH="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="brand.primary" />
                <Text color="gray.600">Loading order details...</Text>
              </VStack>
            </Flex>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <Alert status="error" borderRadius="12px">
              <AlertIcon />
              <Box>
                <AlertTitle>Order not found</AlertTitle>
                <AlertDescription>
                  The order you're looking for doesn't exist or you don't have permission to view it.
                </AlertDescription>
              </Box>
            </Alert>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  // Get order code (computed after early returns, safe because order is guaranteed to exist here)
  const apiCodeRaw = order?.code || order?.orderCode || order?.completionCode;
  const orderCode = (apiCodeRaw !== undefined && apiCodeRaw !== null)
    ? (() => {
        const codeStr = String(apiCodeRaw).trim();
        const isValid = codeStr !== '' && codeStr !== '0' && codeStr !== 'null' && codeStr !== 'undefined';
        if (!isValid) {
          console.warn('⚠️ Order has invalid code:', codeStr);
          return null;
        }
        return codeStr.padStart(4, '0');
      })()
    : null;

  const handleCompleteOrder = async () => {
    if (!orderCode) {
      toast({
        title: "Order code not found",
        description: "Unable to complete order without code",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (window.confirm("Confirm that you have received your order?")) {
      setIsCompleting(true);
      try {
        await completeOrderMutation.mutateAsync({ orderId: params.id, code: orderCode });
      } finally {
        setIsCompleting(false);
      }
    }
  };

  // Get order progress status (more detailed than general status)
  const orderProgressStatus = order.orderProgressStatus || order.status || '';
  
  // Define all order progress stages
  const orderStages = [
    {
      id: 'orderCreated',
      label: 'Order Received',
      sublabel: 'Waiting for vendor to accept your order',
      status: orderProgressStatus === 'orderCreated' || orderProgressStatus === 'orderReceivedByVendor' || orderProgressStatus === 'orderAcceptedByRider' || orderProgressStatus === 'riderAtVendor' || orderProgressStatus === 'riderOnHisWay' || orderProgressStatus === 'riderAtUserLocation'
    },
    {
      id: 'orderReceivedByVendor',
      label: 'Vendor Accepted Order',
      sublabel: 'Vendor has accepted your order',
      status: orderProgressStatus === 'orderReceivedByVendor' || orderProgressStatus === 'orderAcceptedByRider' || orderProgressStatus === 'riderAtVendor' || orderProgressStatus === 'riderOnHisWay' || orderProgressStatus === 'riderAtUserLocation'
    },
    {
      id: 'orderAcceptedByRider',
      label: 'Rider Accepted Order',
      sublabel: 'Rider has accepted your order',
      status: orderProgressStatus === 'orderAcceptedByRider' || orderProgressStatus === 'riderAtVendor' || orderProgressStatus === 'riderOnHisWay' || orderProgressStatus === 'riderAtUserLocation'
    },
    {
      id: 'riderAtVendor',
      label: 'Rider at the Vendor',
      sublabel: 'Rider is at the vendor to pick up your order',
      status: orderProgressStatus === 'riderAtVendor' || orderProgressStatus === 'riderOnHisWay' || orderProgressStatus === 'riderAtUserLocation'
    },
    {
      id: 'riderOnHisWay',
      label: 'Rider on His Way',
      sublabel: 'Rider on his way to deliver your order',
      status: orderProgressStatus === 'riderOnHisWay' || orderProgressStatus === 'riderAtUserLocation'
    },
    {
      id: 'riderAtUserLocation',
      label: 'Rider at your location',
      sublabel: 'Rider is at your location to deliver your order',
      status: orderProgressStatus === 'riderAtUserLocation'
    },
  ];

  const getOrderStatus = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('complete')) {
      return { label: 'Completed', color: 'green', progress: 100 };
    }
    if (statusLower.includes('cancel')) {
      return { label: 'Cancelled', color: 'red', progress: 0 };
    }
    if (statusLower.includes('ongoing') || statusLower.includes('rider') || statusLower.includes('vendor')) {
      return { label: 'In Progress', color: 'orange', progress: 75 };
    }
    return { label: 'Processing', color: 'orange', progress: 25 };
  };

  const orderStatus = getOrderStatus(order.status || order.orderProgressStatus || '');
  // Use fetched cart items if embedded items are not available
  const fetchedCartItems = (cartItemsData as any)?.data || cartItemsData || [];
  const orderItems = embeddedItems.length > 0 ? embeddedItems : fetchedCartItems;

  return (
    <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      <Box maxW="100%" px={0}>
        <Box py={3} px={3}>
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center" mb={5}>
            <HStack spacing={3}>
              <IconButton
                aria-label="Go back"
                icon={<FaArrowLeft />}
                variant="ghost"
                onClick={() => router.back()}
                size="sm"
                borderRadius="full"
                _hover={{ bg: "gray.50" }}
              />
              <VStack alignItems="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color="gray.900">
                  Order Details
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {order.store?.name || order.vendorName || order.storeName || "Store Order"}
                </Text>
              </VStack>
            </HStack>
          </Flex>

          <VStack spacing={4} align="stretch">
            {/* Order Completion Code - Mobile Optimized */}
            {orderCode && orderStatus.label !== 'Completed' && orderStatus.label !== 'Cancelled' && (
              <Box 
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                borderRadius="16px" 
                p={4} 
                color="white"
                boxShadow="0 8px 20px rgba(102, 126, 234, 0.3)"
              >
                <VStack spacing={3}>
                  <HStack spacing={2}>
                    <FiPackage size={16} />
                    <Text fontSize="sm" fontWeight="600">
                      Delivery Code
                    </Text>
                  </HStack>
                  <Box 
                    bg="whiteAlpha.200"
                    borderRadius="12px"
                    p={3}
                    backdropFilter="blur(10px)"
                  >
                    <Text 
                      fontSize="2xl" 
                      fontWeight="800" 
                      fontFamily="mono"
                      letterSpacing="4px"
                      textAlign="center"
                    >
                      {orderCode}
                    </Text>
                  </Box>
                  <Text fontSize="xs" opacity={0.8} textAlign="center">
                    Show this code to your delivery person
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Prominent Rider Contact Card - Shows when rider is assigned */}
            {(() => {
              const riderPhone = order.riderPhone || order.rider?.phoneNumber || order.rider?.phone;
              const riderName = order.rider?.firstName || order.rider?.name;
              const riderLastName = order.rider?.lastName;
              const riderId = order.riderId || order.rider?.id || order.rider?._id;
              
              // Show prominent rider card when rider is actively involved
              const showProminentRiderCard = (
                orderProgressStatus === 'orderAcceptedByRider' ||
                orderProgressStatus === 'riderAtVendor' ||
                orderProgressStatus === 'riderOnHisWay' ||
                orderProgressStatus === 'riderAtUserLocation'
              ) && (riderPhone || riderName || riderId);

              if (!showProminentRiderCard) return null;

              return (
                <Box 
                  bg="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                  borderRadius="16px" 
                  p={4} 
                  color="white"
                  boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
                >
                  <VStack spacing={3}>
                    <HStack spacing={2}>
                      <FiPhone size={16} />
                      <Text fontSize="sm" fontWeight="600">
                        Your Rider
                      </Text>
                    </HStack>
                    
                    {riderPhone ? (
                      <VStack spacing={2}>
                        <Text fontSize="lg" fontWeight="700" textAlign="center">
                          {riderName} {riderLastName}
                        </Text>
                        <Button
                          as="a"
                          href={`tel:${riderPhone}`}
                          bg="whiteAlpha.200"
                          color="white"
                          borderRadius="12px"
                          px={6}
                          py={3}
                          fontSize="md"
                          fontWeight="600"
                          leftIcon={<FiPhone size={16} />}
                          _hover={{ bg: "whiteAlpha.300" }}
                          _active={{ bg: "whiteAlpha.400" }}
                        >
                          Call {riderPhone}
                        </Button>
                      </VStack>
                    ) : (
                      <VStack spacing={2}>
                        <Text fontSize="md" fontWeight="600" textAlign="center">
                          {riderName ? `${riderName} ${riderLastName}` : 'Rider Assigned'}
                        </Text>
                        <Text fontSize="xs" opacity={0.8} textAlign="center">
                          Contact information will be available shortly
                        </Text>
                      </VStack>
                    )}
                  </VStack>
                </Box>
              );
            })()}

            {/* Order Status Card */}
            <Box 
              bg="white" 
              borderRadius="16px" 
              p={4} 
              border="1px solid" 
              borderColor="gray.200"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            >
              <VStack align="stretch" spacing={4}>
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack spacing={3}>
                    <Flex
                      w={10}
                      h={10}
                      borderRadius="10px"
                      bg={`${orderStatus.color}.100`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FiTruck size={18} color={`${orderStatus.color}.500`} />
                    </Flex>
                    <VStack alignItems="start" spacing={0.5}>
                      <Text fontSize="md" fontWeight="700" color="gray.900">
                        Your Order
                      </Text>
                      <HStack spacing={2} fontSize="xs" color="gray.500">
                        <HStack spacing={1}>
                          <FiClock size={10} />
                          <Text>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </HStack>
                  
                  <Badge 
                    colorScheme={orderStatus.color} 
                    px={2} 
                    py={1} 
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="600"
                  >
                    {orderStatus.label}
                  </Badge>
                </Flex>
                
                <Text fontSize="lg" fontWeight="700" color="gray.900" textAlign="center">
                  ₦{(order.price || order.totalPrice || 0).toLocaleString()}
                </Text>
              </VStack>
            </Box>

            {/* Order Items */}
            <Box 
              bg="white" 
              borderRadius="16px" 
              p={4} 
              border="1px solid" 
              borderColor="gray.200"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            >
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <FiPackage size={16} color="#8b5cf6" />
                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                    Order Items ({orderItems.length})
                  </Text>
                </HStack>
                
                <VStack spacing={2} align="stretch">
                  {orderItems.length > 0 ? orderItems.map((item: any, index: number) => {
                    const itemData = item.item || item;
                    const quantity = item.quantity || 1;
                    const itemPrice = itemData.price || item.price || 0;
                    
                    return (
                      <Flex key={index} justifyContent="space-between" alignItems="center" py={2}>
                        <HStack spacing={3} flex={1}>
                          <Flex
                            w={8}
                            h={8}
                            borderRadius="6px"
                            bg="gray.100"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" fontWeight="600" color="gray.600">
                              {quantity}×
                            </Text>
                          </Flex>
                          <VStack alignItems="start" spacing={0} flex={1}>
                            <Text fontSize="xs" fontWeight="600" color="gray.900" noOfLines={1}>
                              {itemData.name || itemData.title || 'Item'}
                            </Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              ₦{itemPrice.toLocaleString()} each
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontSize="xs" fontWeight="600" color="gray.900">
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
              </VStack>
            </Box>

            {/* Order Summary */}
            <Box 
              bg="white" 
              borderRadius="16px" 
              p={4} 
              border="1px solid" 
              borderColor="gray.200"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            >
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <BiRestaurant size={16} color="#667eea" />
                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                    Order Summary
                  </Text>
                </HStack>
                
                <VStack spacing={2} align="stretch">
                  <Flex justifyContent="space-between">
                    <Text fontSize="xs" color="gray.600">Items</Text>
                    <Text fontSize="xs" fontWeight="600">{orderItems.length}</Text>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text fontSize="xs" color="gray.600">Subtotal</Text>
                    <Text fontSize="xs" fontWeight="600">
                      {(() => {
                        const subtotalFromItems = orderItems.reduce((sum: number, it: any) => {
                          const d = it.item || it;
                          const q = it.quantity || 1;
                          const p = d.price || it.price || 0;
                          return sum + p * q;
                        }, 0);
                        const value = subtotalFromItems || order.subtotal || (order.price ? (order.price - (order.deliveryFee || 0) - (order.serviceCharge || 0) + (order.couponPrice || 0)) : 0);
                        return `₦${Number(value).toLocaleString()}`;
                      })()}
                    </Text>
                  </Flex>
                  {order.deliveryFee && order.deliveryFee > 0 && (
                    <Flex justifyContent="space-between">
                      <Text fontSize="xs" color="gray.600">Delivery Fee</Text>
                      <Text fontSize="xs" fontWeight="600">₦{order.deliveryFee.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {order.serviceCharge && order.serviceCharge > 0 && (
                    <Flex justifyContent="space-between">
                      <Text fontSize="xs" color="gray.600">Service Charge</Text>
                      <Text fontSize="xs" fontWeight="600">₦{order.serviceCharge.toLocaleString()}</Text>
                    </Flex>
                  )}
                  {order.couponPrice && order.couponPrice > 0 && (
                    <Flex justifyContent="space-between">
                      <Text fontSize="xs" color="green.600">Discount</Text>
                      <Text fontSize="xs" fontWeight="600" color="green.600">-₦{order.couponPrice.toLocaleString()}</Text>
                    </Flex>
                  )}
                  <Divider />
                  <Flex justifyContent="space-between">
                    <Text fontSize="sm" fontWeight="700">Total</Text>
                    <Text fontSize="sm" fontWeight="700" color="gray.900">
                      ₦{(order.price || order.totalPrice || 0).toLocaleString()}
                    </Text>
                  </Flex>
                </VStack>
              </VStack>
            </Box>
            
            {/* Contact & Delivery Info */}
            <Box 
              bg="white" 
              borderRadius="16px" 
              p={4} 
              border="1px solid" 
              borderColor="gray.200"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            >
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <FiMapPin size={16} color="#10b981" />
                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                    Delivery & Contact
                  </Text>
                </HStack>
                
                <VStack spacing={3} align="stretch">
                  {order.deliveryLocation && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Delivery Address</Text>
                      <Text fontSize="xs" fontWeight="500" color="gray.800">
                        {order.deliveryLocation}
                      </Text>
                    </Box>
                  )}
                  
                  {/* Rider Information - Enhanced Display */}
                  {(() => {
                    // Check multiple possible sources for rider information
                    const riderPhone = order.riderPhone || order.rider?.phoneNumber || order.rider?.phone;
                    const riderName = order.rider?.firstName || order.rider?.name;
                    const riderLastName = order.rider?.lastName;
                    const riderId = order.riderId || order.rider?.id || order.rider?._id;
                    
                    // Show rider section if we have any rider info or if order is in progress
                    const showRiderSection = riderPhone || riderName || riderId || 
                      (orderProgressStatus && (
                        orderProgressStatus.includes('rider') || 
                        orderProgressStatus === 'orderAcceptedByRider' ||
                        orderProgressStatus === 'riderAtVendor' ||
                        orderProgressStatus === 'riderOnHisWay' ||
                        orderProgressStatus === 'riderAtUserLocation'
                      ));

                    if (!showRiderSection) return null;

                    return (
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Rider Information</Text>
                        <VStack align="start" spacing={2}>
                          {riderPhone ? (
                            <Button
                              as="a"
                              href={`tel:${riderPhone}`}
                              size="sm"
                              leftIcon={<FiPhone size={14} />}
                              bg="blue.500"
                              color="white"
                              borderRadius="8px"
                              fontSize="xs"
                              py={2}
                              px={3}
                              _hover={{ bg: "blue.600" }}
                              fontWeight="600"
                            >
                              Call {riderPhone}
                            </Button>
                          ) : (
                            <Box
                              bg="orange.50"
                              border="1px solid"
                              borderColor="orange.200"
                              borderRadius="8px"
                              p={2}
                              w="full"
                            >
                              <Text fontSize="xs" color="orange.700" fontWeight="500">
                                📱 Rider contact will be available once assigned
                              </Text>
                            </Box>
                          )}
                          
                          {(riderName || riderLastName) && (
                            <Text fontSize="xs" color="gray.700" fontWeight="500">
                              🚴 Rider: {riderName} {riderLastName}
                            </Text>
                          )}
                          
                          {riderId && !riderName && (
                            <Text fontSize="xs" color="gray.600" fontWeight="500">
                              🚴 Rider assigned (ID: {String(riderId).slice(-6)})
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    );
                  })()}
                  
                  {order.customerPhone && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Your Phone</Text>
                      <Text fontSize="xs" fontWeight="500" color="gray.800">
                        {order.customerPhone}
                      </Text>
                    </Box>
                  )}
                  
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Payment Status</Text>
                    <HStack spacing={1}>
                      <FiCheckCircle size={12} color="#10b981" />
                      <Text fontSize="xs" fontWeight="500" color="green.600">
                        Paid via {order.checkoutType === 'wallet' ? 'Wallet' : 'Card'}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </VStack>
            </Box>
            
            {/* Order Progress */}
            <Box 
              bg="white" 
              borderRadius="16px" 
              p={4} 
              border="1px solid" 
              borderColor="gray.200"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.04)"
            >
              <VStack spacing={3} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack spacing={2}>
                    <FiTruck size={16} color="#f59e0b" />
                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                      Order Progress
                    </Text>
                  </HStack>
                  <Progress 
                    value={orderStatus.progress} 
                    size="sm" 
                    colorScheme={orderStatus.color}
                    borderRadius="full"
                    w="60px"
                  />
                </Flex>

                <VStack spacing={2} align="stretch">
                  {orderStages.map((stage, index) => (
                    <HStack key={stage.id} spacing={2}>
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={stage.status ? 'green.500' : 'gray.300'}
                        flexShrink={0}
                      />
                      <VStack alignItems="start" spacing={0} flex={1}>
                        <Text 
                          fontSize="xs" 
                          fontWeight={stage.status ? "600" : "500"} 
                          color={stage.status ? "gray.900" : "gray.500"}
                        >
                          {stage.label}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Box>
            
            {/* Action Button */}
            {orderStatus.label !== 'Completed' && orderStatus.label !== 'Cancelled' && orderProgressStatus === 'riderAtUserLocation' && (
              <Button
                size="md"
                colorScheme="green"
                leftIcon={<FiCheckCircle />}
                onClick={handleCompleteOrder}
                isLoading={isCompleting}
                loadingText="Confirming..."
                borderRadius="12px"
                py={3}
                w="100%"
                fontWeight="600"
                fontSize="sm"
              >
                Confirm Delivery
              </Button>
            )}
          </VStack>

          <Box mb="5em" />
        </Box>
      </Box>
    </Box>
  );
};

export default OrderDetailsPage;

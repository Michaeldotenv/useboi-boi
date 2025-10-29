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
} from '@chakra-ui/react';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaPhone, FaCheckCircle } from 'react-icons/fa';
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

  // Complete order mutation
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

  if (isLoading) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <Flex justify="center" align="center" minH="400px">
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
  const orderItems = order.items || order.cart?.cartItems || order.cart?.items || [];
  const orderCode = order.code || null;

  return (
    <Box minH="100vh" bg="#F2F2F7">
      <Wrapper>
        <Box py={4}>
          {/* Header */}
          <HStack spacing={4} mb={6}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => router.back()}
              size="sm"
            >
              Back
            </Button>
            <Text fontSize="24px" fontWeight="700" color="#000">
              Order Details
            </Text>
          </HStack>

          <VStack spacing={6} align="stretch">
            {/* Order Completion Code - Prominently Displayed */}
            {orderCode && orderStatus.label !== 'Completed' && orderStatus.label !== 'Cancelled' && (
              <Box 
                bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" 
                borderRadius="20px" 
                p={6} 
                color="white"
                boxShadow="lg"
              >
                <VStack spacing={3}>
                  <Text fontSize="14px" fontWeight="600" opacity={0.9}>
                    Order Completion Code
                  </Text>
                  <Text 
                    fontSize="48px" 
                    fontWeight="800" 
                    fontFamily="mono"
                    letterSpacing="4px"
                  >
                    {orderCode}
                  </Text>
                  <Text fontSize="12px" opacity={0.8} textAlign="center">
                    Give this code to your rider when they arrive to complete your order
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Order Tracking Timeline */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="18px" fontWeight="700" color="#000">
                    Order #{order._id?.slice(-8) || order.id?.slice(-8) || 'N/A'}
                  </Text>
                  <Badge colorScheme={orderStatus.color} px={3} py={1} borderRadius="full">
                    {orderStatus.label}
                  </Badge>
                </HStack>

                <Divider />

                {/* Order Progress Timeline */}
                <Box position="relative" pl={8}>
                  <Box
                    position="absolute"
                    left="24px"
                    top="0"
                    bottom="0"
                    width="2px"
                    bg={orderStatus.color === 'green' ? 'green.200' : 'purple.200'}
                  />
                  <VStack align="stretch" spacing={6}>
                    {orderStages.map((stage, index) => (
                      <HStack key={stage.id} spacing={4} position="relative">
                        <Box
                          position="absolute"
                          left="-32px"
                          width="16px"
                          height="16px"
                          borderRadius="50%"
                          bg={stage.status ? 'purple.500' : 'gray.300'}
                          border="2px solid"
                          borderColor={stage.status ? 'purple.500' : 'gray.300'}
                          zIndex={2}
                        >
                          {stage.status && (
                            <Icon
                              as={FaCheckCircle}
                              color="white"
                              width="12px"
                              height="12px"
                              position="absolute"
                              top="-2px"
                              left="1px"
                            />
                          )}
                        </Box>
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="16px" fontWeight={stage.status ? "700" : "500"} color={stage.status ? "#000" : "gray.500"}>
                            {stage.label}
                          </Text>
                          <Text fontSize="13px" color="gray.600">
                            {stage.sublabel}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                <HStack justify="space-between" fontSize="14px" color="gray.600">
                  <Text>Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</Text>
                  <Text>Total: ₦{(order.price || order.totalPrice || 0).toLocaleString()}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Order Items */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Order Items
              </Text>

              <VStack spacing={4} align="stretch">
                {orderItems.length > 0 ? (
                  orderItems.map((item: any, index: number) => {
                    const itemDetails = item.item || item;
                    const quantity = item.quantity || 1;
                    const price = itemDetails.price || item.price || 0;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <HStack spacing={4} p={3} bg="gray.50" borderRadius="12px">
                          <Image
                            src={itemDetails.image || item.image || "/Food-item-6.jpg"}
                            alt={itemDetails.name || item.name}
                            width="60px"
                            height="60px"
                            borderRadius="8px"
                            objectFit="cover"
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="16px" fontWeight="600" color="#000">
                              {itemDetails.name || item.name || 'Item'}
                            </Text>
                            <Text fontSize="14px" color="gray.600">
                              Quantity: {quantity}
                            </Text>
                            <Text fontSize="14px" color="gray.600">
                              Unit Price: ₦{price.toLocaleString()}
                            </Text>
                          </VStack>
                          <Text fontSize="16px" fontWeight="700" color="#000">
                            ₦{(price * quantity).toLocaleString()}
                          </Text>
                        </HStack>
                      </motion.div>
                    );
                  })
                ) : (
                  <Text fontSize="14px" color="gray.500" textAlign="center" py={4}>
                    No items found
                  </Text>
                )}
              </VStack>

              <Divider my={4} />

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Subtotal</Text>
                  <Text fontSize="14px" fontWeight="600">
                    ₦{(order.price ? order.price - (order.deliveryFee || 0) - (order.serviceCharge || 0) + (order.couponPrice || 0) : order.subtotal || 0).toLocaleString()}
                  </Text>
                </HStack>
                {order.deliveryFee && order.deliveryFee > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Delivery Fee</Text>
                    <Text fontSize="14px" fontWeight="600">₦{order.deliveryFee.toLocaleString()}</Text>
                  </HStack>
                )}
                {order.serviceCharge && order.serviceCharge > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Service Charge</Text>
                    <Text fontSize="14px" fontWeight="600">₦{order.serviceCharge.toLocaleString()}</Text>
                  </HStack>
                )}
                {order.couponPrice && order.couponPrice > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="green.600">Coupon Discount</Text>
                    <Text fontSize="14px" fontWeight="600" color="green.600">-₦{order.couponPrice.toLocaleString()}</Text>
                  </HStack>
                )}
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="16px" fontWeight="700">Total</Text>
                  <Text fontSize="16px" fontWeight="700" color="#000">
                    ₦{(order.price || order.totalPrice || 0).toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Delivery Information */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Delivery Information
              </Text>

              <VStack spacing={4} align="stretch">
                {order.deliveryLocation && (
                  <HStack spacing={3}>
                    <Icon as={FaMapMarkerAlt} color="brand.primary" />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="14px" fontWeight="600">Delivery Address</Text>
                      <Text fontSize="14px" color="gray.600">{order.deliveryLocation}</Text>
                    </VStack>
                  </HStack>
                )}

                {(order.deliveryInstruction || order.deliveryInstructions) && (
                  <HStack spacing={3} align="start">
                    <Icon as={FaClock} color="brand.primary" mt={1} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="14px" fontWeight="600">Delivery Instructions</Text>
                      <Text fontSize="14px" color="gray.600">
                        {order.deliveryInstruction || order.deliveryInstructions || 'No special instructions'}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                <HStack spacing={3}>
                  <Icon as={FaPhone} color="brand.primary" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="14px" fontWeight="600">Contact</Text>
                    <Text fontSize="14px" color="gray.600">{order.customerPhone || 'Not provided'}</Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Payment Information */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Payment Information
              </Text>

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Payment Method</Text>
                  <Text fontSize="14px" fontWeight="600">
                    {order.checkoutType === 'wallet' ? 'Wallet Balance' : 'Card Payment'}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Payment Status</Text>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    <Icon as={FaCheckCircle} mr={1} />
                    Paid
                  </Badge>
                </HStack>
              </VStack>
            </Box>

            {/* Action Buttons */}
            {orderStatus.label !== 'Completed' && orderStatus.label !== 'Cancelled' && orderProgressStatus === 'riderAtUserLocation' && (
              <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
                <VStack spacing={4}>
                  <Text fontSize="16px" fontWeight="600" textAlign="center" color="gray.600">
                    Has your order been delivered?
                  </Text>
                  <Text fontSize="14px" color="gray.500" textAlign="center">
                    Confirm when you have received your order
                  </Text>
                  <Button
                    colorScheme="green"
                    size="lg"
                    width="100%"
                    leftIcon={<FaCheckCircle />}
                    onClick={handleCompleteOrder}
                    isLoading={isCompleting}
                    loadingText="Confirming..."
                  >
                    Confirm Delivery
                  </Button>
                </VStack>
              </Box>
            )}
          </VStack>

          <Box mb="5em" />
        </Box>
      </Wrapper>
    </Box>
  );
};

export default OrderDetailsPage;
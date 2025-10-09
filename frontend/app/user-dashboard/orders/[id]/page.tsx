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

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => api.order(params.id),
    enabled: Boolean(params.id),
  });

  const order = (orderData as any)?.data || orderData;

  // Complete order mutation
  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => api.completeOrder(orderId),
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
    if (window.confirm("Confirm that you have received your order?")) {
      setIsCompleting(true);
      try {
        await completeOrderMutation.mutateAsync(params.id);
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

  const getOrderStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { label: 'Processing', color: 'orange', progress: 25 };
      case 'confirmed':
        return { label: 'Confirmed', color: 'blue', progress: 50 };
      case 'in_progress':
        return { label: 'In Progress', color: 'orange', progress: 75 };
      case 'completed':
        return { label: 'Completed', color: 'green', progress: 100 };
      case 'cancelled':
        return { label: 'Cancelled', color: 'red', progress: 0 };
      default:
        return { label: 'Unknown', color: 'gray', progress: 0 };
    }
  };

  const orderStatus = getOrderStatus(order.status);
  const orderItems = order.items || [];

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
            {/* Order Status */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="18px" fontWeight="700" color="#000">
                    Order #{order._id?.slice(-8) || 'N/A'}
                  </Text>
                  <Badge colorScheme={orderStatus.color} px={3} py={1} borderRadius="full">
                    {orderStatus.label}
                  </Badge>
                </HStack>

                <Box>
                  <Text fontSize="14px" color="gray.600" mb={2}>
                    Order Progress
                  </Text>
                  <Progress
                    value={orderStatus.progress}
                    colorScheme={orderStatus.color}
                    size="lg"
                    borderRadius="full"
                  />
                </Box>

                <HStack justify="space-between" fontSize="14px" color="gray.600">
                  <Text>Ordered: {new Date(order.createdAt).toLocaleDateString()}</Text>
                  <Text>Total: ₦{order.totalPrice?.toLocaleString() || '0'}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Order Items */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Order Items
              </Text>

              <VStack spacing={4} align="stretch">
                {orderItems.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <HStack spacing={4} p={3} bg="gray.50" borderRadius="12px">
                      <Image
                        src={item.image || "/Food-item-6.jpg"}
                        alt={item.name}
                        width="60px"
                        height="60px"
                        borderRadius="8px"
                        objectFit="cover"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="16px" fontWeight="600" color="#000">
                          {item.name || 'Item'}
                        </Text>
                        <Text fontSize="14px" color="gray.600">
                          Quantity: {item.quantity || 1}
                        </Text>
                        <Text fontSize="14px" color="gray.600">
                          Unit Price: ₦{item.price?.toLocaleString() || '0'}
                        </Text>
                      </VStack>
                      <Text fontSize="16px" fontWeight="700" color="#000">
                        ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </Text>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>

              <Divider my={4} />

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Subtotal</Text>
                  <Text fontSize="14px" fontWeight="600">₦{order.subtotal?.toLocaleString() || '0'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Delivery Fee</Text>
                  <Text fontSize="14px" fontWeight="600">₦{order.deliveryFee?.toLocaleString() || '0'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="14px" color="gray.600">Service Charge</Text>
                  <Text fontSize="14px" fontWeight="600">₦{order.serviceCharge?.toLocaleString() || '0'}</Text>
                </HStack>
                {order.couponPrice && order.couponPrice > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="green.600">Coupon Discount</Text>
                    <Text fontSize="14px" fontWeight="600" color="green.600">-₦{order.couponPrice.toLocaleString()}</Text>
                  </HStack>
                )}
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="16px" fontWeight="700">Total</Text>
                  <Text fontSize="16px" fontWeight="700" color="#000">₦{order.totalPrice?.toLocaleString() || '0'}</Text>
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
                    <VStack align="start" spacing={0}>
                      <Text fontSize="14px" fontWeight="600">Delivery Address</Text>
                      <Text fontSize="14px" color="gray.600">{order.deliveryLocation}</Text>
                    </VStack>
                  </HStack>
                )}

                {order.deliveryInstructions && (
                  <HStack spacing={3} align="start">
                    <Icon as={FaClock} color="brand.primary" mt={1} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="14px" fontWeight="600">Delivery Instructions</Text>
                      <Text fontSize="14px" color="gray.600">{order.deliveryInstructions}</Text>
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
            {order.status?.toLowerCase() === 'in_progress' && (
              <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
                <VStack spacing={4}>
                  <Text fontSize="16px" fontWeight="600" textAlign="center" color="gray.600">
                    Has your order been delivered?
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
"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  Badge,
  Divider,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  Spinner,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { FaShoppingCart } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Wrapper from '../Wrapper';
import { useCartStore } from '@/lib/cartStore';
import { api } from '@/lib/api';
import EmptyState from '../EmptyState';

const CartTab: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const total = useCartStore((s) => s.subtotal());
  const cartVendorId = useCartStore((s) => s.vendorId);

  const [checkoutType, setCheckoutType] = useState<'wallet' | 'card'>('wallet');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;

  const deliveryFee = 500; // Fixed delivery fee
  const serviceCharge = Math.round(total * 0.05); // 5% service charge
  const vat = Math.round((total + deliveryFee + serviceCharge) * 0.075); // 7.5% VAT
  const couponDiscount = selectedCoupon ? (selectedCoupon.type === 'percent' ? Math.round(total * selectedCoupon.discount / 100) : selectedCoupon.discount) : 0;
  const grandTotal = total + deliveryFee + serviceCharge + vat - couponDiscount;

  // Generate 4-digit order completion code
  const generateOrderCode = (): number => {
    return Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000-9999
  };

  const handleCheckout = async () => {
    if (!items.length) return;
    setIsCheckingOut(true);
    
    try {
      // Ensure cart is synced with backend before checkout
      const cartStore = useCartStore.getState();
      if (!cartStore.cartId) {
        await cartStore.syncWithBackend();
      }
      
      // Generate 4-digit order completion code
      const orderCode = generateOrderCode();
      
      const payload = {
        totalPrice: grandTotal,
        cartId: cartStore.cartId || '',
        storeId: cartVendorId,
        deliveryLocation: deliveryLocation || null,
        deliveryFee: deliveryFee,
        serviceCharge: serviceCharge,
        couponPrice: couponDiscount > 0 ? couponDiscount : null,
        checkoutType: checkoutType,
        deliveryInstructions: deliveryInstructions || null,
        code: orderCode, // 4-digit code for rider to complete order
        isErrand: false,
      };
      
      await api.checkout(payload);
      clearCart();
      toast({ 
        title: "Order placed successfully!", 
        description: "Your order has been confirmed and is being processed.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      // Navigate to orders tab
      window.location.reload(); // This will trigger navigation context to switch to orders
    } catch (e: any) {
      console.error("Checkout failed:", e);
      toast({ 
        title: "Checkout failed", 
        description: e.message || "Please try again or contact support.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
        <Wrapper>
          <Box py={4}>
            <Flex justify="space-between" align="center" mb={6} mt={4}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="16px"
                  bg="rgba(255, 255, 255, 0.9)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                >
                  <FaShoppingCart color="#3B174F" size="24px" />
                </Box>
                <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="800" bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" bgClip="text" color="transparent">
                  Shopping Cart
                </Text>
              </HStack>
            </Flex>
            
            <EmptyState
              iconType="cart"
              title="Your cart is empty"
              description="Add some items from stores to get started with your order!"
              actionText="Start Shopping"
              onAction={() => window.location.reload()}
              variant="illustrated"
            />
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box 
      minH="calc(100vh - 72px)" 
      pb="calc(env(safe-area-inset-bottom, 0px) + 72px)"
    >
      <Wrapper>
        <Box py={4}>
          <Flex justify="space-between" align="center" mb={6} mt={4}>
            <HStack spacing={3}>
              <Box
                p={3}
                borderRadius="16px"
                bg="rgba(255, 255, 255, 0.9)"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                <FaShoppingCart color="#3B174F" size="24px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="800" bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" bgClip="text" color="transparent">
                  Shopping Cart
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </Text>
              </VStack>
            </HStack>
            <Badge
              bg="brand.primary"
              color="white"
              fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 2, md: 3 }}
              py={1}
              borderRadius="full"
            >
              ₦{total.toLocaleString()}
            </Badge>
          </Flex>

          <VStack spacing={6} align="stretch">
            {/* Cart Items */}
            <Box 
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(20px)"
              borderRadius="20px" 
              p={6} 
              border="1px solid rgba(255, 255, 255, 0.2)"
            >
              <Text fontSize="20px" fontWeight="800" mb={6} bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" bgClip="text" color="transparent">
                Cart Items ({items.length})
              </Text>

              <VStack spacing={4} align="stretch">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      bg="rgba(255, 255, 255, 0.8)"
                      backdropFilter="blur(10px)"
                      borderRadius="16px"
                      p={4}
                      border="1px solid rgba(255, 255, 255, 0.3)"
                      transition="all 0.3s ease"
                      _hover={{
                        transform: "translateY(-2px)",
                      }}
                    >
                      <HStack spacing={4}>
                        <Box position="relative">
                          <Image
                            src={item.image || "/food-carousel.png"}
                            alt={item.name}
                            width="70px"
                            height="70px"
                            borderRadius="12px"
                            objectFit="cover"
                          />
                          <Badge
                            position="absolute"
                            top="-2"
                            right="-2"
                            bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
                            color="white"
                            borderRadius="50%"
                            fontSize="11px"
                            fontWeight="700"
                            px={2}
                            py={1}
                            minW="20px"
                            height="20px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            border="2px solid white"
                          >
                            {item.quantity}
                          </Badge>
                        </Box>
                        
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontSize="18px" fontWeight="700" color="#1A1A1A" noOfLines={1}>
                            {item.name}
                          </Text>
                          <Text fontSize="14px" color="#6B7280">
                            ₦{item.price.toLocaleString()} each
                          </Text>
                          <HStack spacing={3}>
                            <Button 
                              size="sm" 
                              borderRadius="10px"
                              bg="rgba(59, 23, 79, 0.1)"
                              color="#3B174F"
                              _hover={{ bg: "rgba(59, 23, 79, 0.2)" }}
                              onClick={async () => await decrement(item.id)}
                              minW="32px"
                              height="32px"
                            >
                              -
                            </Button>
                            <Text fontSize="16px" fontWeight="600" color="#1A1A1A">{item.quantity}</Text>
                            <Button 
                              size="sm" 
                              borderRadius="10px"
                              bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
                              color="white"
                              _hover={{ transform: "scale(1.05)" }}
                              onClick={async () => await increment(item.id)}
                              minW="32px"
                              height="32px"
                            >
                              +
                            </Button>
                          </HStack>
                        </VStack>
                        
                        <VStack align="end" spacing={2}>
                          <Text fontSize="18px" fontWeight="800" color="#1A1A1A">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </Text>
                          <IconButton
                            aria-label="remove item"
                            icon={<SmallCloseIcon />}
                            size="sm"
                            borderRadius="10px"
                            bg="rgba(239, 68, 68, 0.1)"
                            color="#EF4444"
                            _hover={{ bg: "rgba(239, 68, 68, 0.2)" }}
                            onClick={async () => await removeItem(item.id)}
                          />
                        </VStack>
                      </HStack>
                    </Box>
                  </motion.div>
                ))}
              </VStack>
            </Box>

            {/* Order Summary */}
            <Box 
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(20px)"
              borderRadius="20px" 
              p={6} 
              border="1px solid rgba(255, 255, 255, 0.2)"
            >
              <Text fontSize="20px" fontWeight="800" mb={6} bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" bgClip="text" color="transparent">
                Order Summary
              </Text>
              
              <VStack spacing={2} align="stretch">
                <Flex justify="space-between">
                  <Text fontSize="14px" color="gray.600">Subtotal</Text>
                  <Text fontSize="14px" fontWeight="600">₦{total.toLocaleString()}</Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontSize="14px" color="gray.600">Delivery Fee</Text>
                  <Text fontSize="14px" fontWeight="600">₦{deliveryFee.toLocaleString()}</Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontSize="14px" color="gray.600">Service Charge (5%)</Text>
                  <Text fontSize="14px" fontWeight="600">₦{serviceCharge.toLocaleString()}</Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontSize="14px" color="gray.600">VAT (7.5%)</Text>
                  <Text fontSize="14px" fontWeight="600">₦{vat.toLocaleString()}</Text>
                </Flex>
                
                {couponDiscount > 0 && (
                  <Flex justify="space-between">
                    <Text fontSize="14px" color="green.600">Coupon Discount</Text>
                    <Text fontSize="14px" fontWeight="600" color="green.600">-₦{couponDiscount.toLocaleString()}</Text>
                  </Flex>
                )}
                
                <Divider />
                
                <Flex justify="space-between">
                  <Text fontSize="16px" fontWeight="700">Total</Text>
                  <Text fontSize="16px" fontWeight="700" color="#000">₦{grandTotal.toLocaleString()}</Text>
                </Flex>
              </VStack>
            </Box>

            {/* Delivery Information */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Delivery Information
              </Text>
              
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="14px" fontWeight="600" mb={2}>Delivery Location *</Text>
                  <Input
                    placeholder="Enter delivery address"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                </Box>
                
                <Box>
                  <Text fontSize="14px" fontWeight="600" mb={2}>Delivery Instructions (Optional)</Text>
                  <Textarea
                    placeholder="Any special delivery instructions..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    rows={3}
                  />
                </Box>
              </VStack>
            </Box>

            {/* Payment Method */}
            <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
              <Text fontSize="18px" fontWeight="700" color="#000" mb={4}>
                Payment Method
              </Text>
              
              <RadioGroup value={checkoutType} onChange={(value: 'wallet' | 'card') => setCheckoutType(value)}>
                <Stack spacing={3}>
                  <Radio value="wallet" size="lg">
                    <Box ml={2}>
                      <Text fontSize="14px" fontWeight="600">Wallet Balance</Text>
                      <Text fontSize="12px" color="gray.600">Pay from your Boiboi wallet</Text>
                    </Box>
                  </Radio>
                  <Radio value="card" size="lg">
                    <Box ml={2}>
                      <Text fontSize="14px" fontWeight="600">Card Payment</Text>
                      <Text fontSize="12px" color="gray.600">Pay with your debit/credit card</Text>
                    </Box>
                  </Radio>
                </Stack>
              </RadioGroup>
            </Box>

            {/* Checkout Button */}
            <Button
              width="100%"
              height="60px"
              bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
              color="white"
              fontSize="18px"
              fontWeight="800"
              borderRadius="20px"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
              loadingText="Processing Order..."
              disabled={!items.length || !deliveryLocation.trim()}
              _hover={{
                bg: "linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)",
                transform: "translateY(-3px)",
                _before: {
                  left: "100%",
                },
              }}
              _active={{
                transform: "translateY(-1px)"
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s",
              }}
            >
              {isCheckingOut ? "Processing..." : `Complete Order - ₦${grandTotal.toLocaleString()}`}
            </Button>
            
            {!deliveryLocation.trim() && (
              <Text fontSize="12px" color="red.500" textAlign="center">
                Please enter delivery location to continue
              </Text>
            )}
          </VStack>
        </Box>
      </Wrapper>
    </Box>
  );
};

export default CartTab;

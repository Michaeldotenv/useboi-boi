"use client";

import React, { useState, useEffect } from 'react';
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
import Wrapper from "../components/Wrapper";
import { useCartStore } from '@/lib/cartStore';
import { api } from '@/lib/api';
import EmptyState from "../components/EmptyState";

const CartTab: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const total = useCartStore((s) => s.subtotal());
  const cartVendorId = useCartStore((s) => s.vendorId);

  const [checkoutType, setCheckoutType] = useState<'wallet' | 'card'>('wallet');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration to prevent double rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;

  // Auto-select default card when switching to card payment
  useEffect(() => {
    if (checkoutType === 'card' && meObj.cards && meObj.cards.length > 0 && !selectedCardId) {
      // Find default card or use first card
      const defaultCard = meObj.cards.find((card: any) => card.isSelected);
      if (defaultCard) {
        setSelectedCardId(defaultCard.id);
      } else {
        setSelectedCardId(meObj.cards[0].id);
      }
    } else if (checkoutType === 'wallet') {
      // Clear card selection when switching to wallet
      setSelectedCardId(null);
    }
  }, [checkoutType, meObj.cards, selectedCardId]);

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
      let cartStore = useCartStore.getState();
      
      // Always sync with backend before checkout to ensure cart exists
      // This handles cases where cartId might be missing or stale
      if (!cartStore.cartId || !cartStore.vendorId || cartStore.items.length === 0) {
        // Ensure we have vendorId before syncing
        if (!cartStore.vendorId) {
          throw new Error("Vendor ID is missing. Please add items to your cart.");
        }
        
        // Sync with backend to create/update cart
        await cartStore.syncWithBackend();
        
        // Wait a bit for state to update, then check again
        await new Promise(resolve => setTimeout(resolve, 100));
        cartStore = useCartStore.getState();
      } else {
        // Even if cartId exists, sync to ensure all items are up to date
        await cartStore.syncWithBackend();
        await new Promise(resolve => setTimeout(resolve, 100));
        cartStore = useCartStore.getState();
      }
      
      // Final validation - ensure we have a valid cartId
      const finalCartId = cartStore.cartId;
      if (!finalCartId || finalCartId.trim() === '') {
        throw new Error("Cart ID is missing. Please refresh the page and try again.");
      }

      // Ensure we have a valid vendorId/storeId
      if (!cartVendorId || cartVendorId.trim() === '') {
        throw new Error("Store ID is missing. Please refresh the page and try again.");
      }

      // Determine cardId for card payments
      let cardIdForCheckout: number | null = null;
      if (checkoutType === 'card') {
        // Use selected card ID, or find default, or use first card
        if (selectedCardId) {
          cardIdForCheckout = selectedCardId;
        } else if (meObj.cards && meObj.cards.length > 0) {
          const defaultCard = meObj.cards.find((card: any) => card.isSelected);
          cardIdForCheckout = defaultCard ? defaultCard.id : meObj.cards[0].id;
        } else {
          throw new Error("Please select a payment card to continue.");
        }
      }
      
      // Generate 4-digit order completion code
      const orderCode = generateOrderCode();
      
      const payload: any = {
        totalPrice: grandTotal,
        cartId: finalCartId,
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

      // Include cardId only if checkout type is card
      if (checkoutType === 'card' && cardIdForCheckout) {
        payload.cardId = cardIdForCheckout;
      }
      
      const res: any = await api.checkout(payload);
      const createdOrder = (res?.data || res) as any;

      clearCart();
      // Only display code if it comes back from backend
      const backendCode = createdOrder?.code;
      toast({ 
        title: "Order placed successfully!", 
        description: backendCode ? `Give this code to your rider: ${String(backendCode)}` : "Your order has been confirmed and is being processed.",
        status: "success",
        duration: 7000,
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

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50"
        pb="calc(env(safe-area-inset-bottom, 0px) + 80px)"
      >
        {/* Header */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={4}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Text fontSize="20px" fontWeight="700" color="gray.900">
                Cart
              </Text>
            </HStack>
            <Text fontSize="14px" color="gray.500">
              Loading...
            </Text>
          </HStack>
        </Box>

        <Box px={4} py={8} height="calc(100vh - 120px)" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Box
              w="40px"
              h="40px"
              border="4px solid"
              borderColor="gray.200"
              borderTopColor="gray.600"
              borderRadius="50%"
              animation="spin 1s linear infinite"
            />
            <Text fontSize="14px" color="gray.500">
              Loading cart...
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <Box 
        minH="100vh" 
        bg="gray.50"
        pb="calc(env(safe-area-inset-bottom, 0px) + 80px)"
      >
        {/* Header */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={4}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Text fontSize="20px" fontWeight="700" color="gray.900">
                Cart
              </Text>
            </HStack>
            <Text fontSize="14px" color="gray.500">
              0 items
            </Text>
          </HStack>
        </Box>

        <Box px={4} py={8} height="calc(100vh - 120px)" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={6} textAlign="center" maxW="300px">
            <Box
              w="120px"
              h="120px"
              bg="gray.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaShoppingCart color="#9CA3AF" size="48px" />
            </Box>
            
            <VStack spacing={3}>
              <Text fontSize="20px" fontWeight="600" color="gray.900">
                Your cart is empty
              </Text>
              <Text fontSize="14px" color="gray.500" lineHeight={1.5}>
                Add some items from stores to get started with your order!
              </Text>
            </VStack>
            
            <Button
              bg="gray.900"
              color="white"
              _hover={{ bg: "gray.800" }}
              borderRadius="12px"
              px={8}
              py={6}
              height="48px"
              fontSize="16px"
              fontWeight="600"
              onClick={() => window.location.reload()}
            >
              Start Shopping
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      bg="gray.50"
      pb="calc(env(safe-area-inset-bottom, 0px) + 80px)"
    >
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={4}>
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Text fontSize="20px" fontWeight="700" color="gray.900">
              Cart
            </Text>
          </HStack>
          <Text fontSize="14px" color="gray.500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        </HStack>
      </Box>

      <Box px={4} py={4}>
        <VStack spacing={3} align="stretch">
          {/* Cart Items */}
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Box
                bg="white"
                borderRadius="12px"
                p={{ base: 3, md: 4 }}
                border="1px solid"
                borderColor="gray.200"
                position="relative"
              >
                <HStack spacing={{ base: 3, md: 4 }} align="start">
                  <Box position="relative" flexShrink={0}>
                    <Image
                      src={item.image || "/food-carousel.png"}
                      alt={item.name}
                      width={{ base: "50px", md: "60px" }}
                      height={{ base: "50px", md: "60px" }}
                      borderRadius="8px"
                      objectFit="cover"
                    />
                  </Box>
                  
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize={{ base: "15px", md: "16px" }} fontWeight="600" color="gray.900" noOfLines={2}>
                      {item.name}
                    </Text>
                    <Text fontSize={{ base: "13px", md: "14px" }} color="gray.500">
                      ₦{item.price.toLocaleString()} each
                    </Text>
                    
                    <HStack spacing={2} mt={2}>
                      <Button 
                        size="sm" 
                        borderRadius="6px"
                        bg="gray.100"
                        color="gray.700"
                        _hover={{ bg: "gray.200" }}
                        onClick={async () => await decrement(item.id)}
                        minW={{ base: "28px", md: "30px" }}
                        height={{ base: "28px", md: "30px" }}
                        fontSize="14px"
                      >
                        -
                      </Button>
                      <Text fontSize={{ base: "15px", md: "16px" }} fontWeight="600" color="gray.900" minW="20px" textAlign="center">
                        {item.quantity}
                      </Text>
                      <Button 
                        size="sm" 
                        borderRadius="6px"
                        bg="gray.900"
                        color="white"
                        _hover={{ bg: "gray.800" }}
                        onClick={async () => await increment(item.id)}
                        minW={{ base: "28px", md: "30px" }}
                        height={{ base: "28px", md: "30px" }}
                        fontSize="14px"
                      >
                        +
                      </Button>
                    </HStack>
                  </VStack>
                  
                  <VStack align="end" spacing={2}>
                    <Text fontSize={{ base: "15px", md: "16px" }} fontWeight="700" color="gray.900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </Text>
                    <IconButton
                      aria-label="remove item"
                      icon={<SmallCloseIcon />}
                      size="sm"
                      borderRadius="6px"
                      bg="red.50"
                      color="red.500"
                      _hover={{ bg: "red.100" }}
                      onClick={async () => await removeItem(item.id)}
                      minW="28px"
                      height="28px"
                    />
                  </VStack>
                </HStack>
              </Box>
            </motion.div>
          ))}

          {/* Order Summary */}
          <Box 
            bg="white"
            borderRadius="12px" 
            p={{ base: 4, md: 5 }}
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="18px" fontWeight="600" mb={4} color="gray.900">
              Order Summary
            </Text>
            
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between">
                <Text fontSize="14px" color="gray.600">Subtotal</Text>
                <Text fontSize="14px" fontWeight="600" color="gray.900">₦{total.toLocaleString()}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontSize="14px" color="gray.600">Delivery Fee</Text>
                <Text fontSize="14px" fontWeight="600" color="gray.900">₦{deliveryFee.toLocaleString()}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontSize="14px" color="gray.600">Service Charge (5%)</Text>
                <Text fontSize="14px" fontWeight="600" color="gray.900">₦{serviceCharge.toLocaleString()}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontSize="14px" color="gray.600">VAT (7.5%)</Text>
                <Text fontSize="14px" fontWeight="600" color="gray.900">₦{vat.toLocaleString()}</Text>
              </Flex>
              
              {couponDiscount > 0 && (
                <Flex justify="space-between">
                  <Text fontSize="14px" color="green.600">Coupon Discount</Text>
                  <Text fontSize="14px" fontWeight="600" color="green.600">-₦{couponDiscount.toLocaleString()}</Text>
                </Flex>
              )}
              
              <Divider />
              
              <Flex justify="space-between">
                <Text fontSize="18px" fontWeight="700" color="gray.900">Total</Text>
                <Text fontSize="18px" fontWeight="700" color="gray.900">₦{grandTotal.toLocaleString()}</Text>
              </Flex>
            </VStack>
          </Box>

          {/* Delivery Information */}
          <Box bg="white" borderRadius="12px" p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200">
            <Text fontSize="18px" fontWeight="600" color="gray.900" mb={4}>
              Delivery Information
            </Text>
            
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="14px" fontWeight="600" mb={2} color="gray.700">Delivery Location</Text>
                <Input
                  placeholder="Enter delivery address"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="8px"
                  _focus={{
                    borderColor: "gray.300",
                    bg: "white"
                  }}
                  _placeholder={{ color: "gray.400" }}
                />
              </Box>
              
              <Box>
                <Text fontSize="14px" fontWeight="600" mb={2} color="gray.700">Delivery Instructions (Optional)</Text>
                <Textarea
                  placeholder="Any special delivery instructions..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="8px"
                  rows={3}
                  _focus={{
                    borderColor: "gray.300",
                    bg: "white"
                  }}
                  _placeholder={{ color: "gray.400" }}
                  resize="none"
                />
              </Box>
            </VStack>
          </Box>

          {/* Payment Method */}
          <Box bg="white" borderRadius="16px" p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" boxShadow="sm">
            <HStack spacing={2} mb={4}>
              <Box
                w={10}
                h={10}
                bg="purple.50"
                borderRadius="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="20px">💳</Text>
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="18px" fontWeight="700" color="gray.900">
                  Payment Method
                </Text>
                <Text fontSize="12px" color="gray.500">
                  Choose how you want to pay
                </Text>
              </VStack>
            </HStack>
            
            <RadioGroup value={checkoutType} onChange={(value: 'wallet' | 'card') => setCheckoutType(value)}>
              <VStack spacing={3} align="stretch">
                {/* Wallet Balance Option */}
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={checkoutType === 'wallet' ? 'green.500' : 'gray.200'}
                  borderRadius="12px"
                  bg={checkoutType === 'wallet' ? 'green.50' : 'white'}
                  cursor="pointer"
                  onClick={() => setCheckoutType('wallet')}
                  transition="all 0.2s"
                  _hover={{ borderColor: checkoutType === 'wallet' ? 'green.600' : 'gray.300', transform: 'translateY(-2px)' }}
                  boxShadow={checkoutType === 'wallet' ? 'md' : 'sm'}
                >
                  <Radio value="wallet" size="lg" colorScheme="green">
                    <HStack spacing={3} ml={2}>
                      <Box
                        w={12}
                        h={12}
                        bg="green.100"
                        borderRadius="10px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="24px">💰</Text>
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="16px" fontWeight="700" color="gray.900">Wallet Balance</Text>
                        <Text fontSize="13px" color="gray.600">Pay from your Boiboi wallet</Text>
                        <HStack spacing={2} mt={1}>
                          <Text fontSize="15px" fontWeight="700" color="green.600">
                            ₦{(meObj.virtualBankAccount?.balance || 0).toLocaleString()}
                          </Text>
                          {(meObj.virtualBankAccount?.balance || 0) < grandTotal && (
                            <Badge colorScheme="red" fontSize="10px">Insufficient</Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Radio>
                </Box>
                
                {/* Card Payment Options */}
                {meObj.cards && meObj.cards.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    <Divider />
                    <HStack spacing={2}>
                      <Text fontSize="15px" fontWeight="700" color="gray.900">💳 Pay with Card</Text>
                      <Badge colorScheme="blue" fontSize="10px">{meObj.cards.length} saved</Badge>
                    </HStack>
                    {meObj.cards.map((card: any, index: number) => (
                      <Box
                        key={card.id || index}
                        p={4}
                        border="2px solid"
                        borderColor={checkoutType === 'card' && selectedCardId === card.id ? 'blue.500' : 'gray.200'}
                        borderRadius="12px"
                        bg={checkoutType === 'card' && selectedCardId === card.id ? 'blue.50' : 'white'}
                        onClick={() => {
                          setCheckoutType('card');
                          setSelectedCardId(card.id);
                        }}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: checkoutType === 'card' && selectedCardId === card.id ? 'blue.600' : 'gray.300', transform: 'translateY(-2px)' }}
                        boxShadow={checkoutType === 'card' && selectedCardId === card.id ? 'md' : 'sm'}
                      >
                        <Radio 
                          value="card" 
                          size="lg" 
                          colorScheme="blue"
                          isChecked={checkoutType === 'card' && selectedCardId === card.id}
                        >
                          <HStack spacing={3} ml={2}>
                            <Box
                              w={12}
                              h={12}
                              bg="blue.100"
                              borderRadius="10px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="24px">💳</Text>
                            </Box>
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack spacing={2}>
                                <Text fontSize="16px" fontWeight="700" color="gray.900">
                                  {card.bank}
                                </Text>
                                {card.isSelected && (
                                  <Badge colorScheme="green" fontSize="10px">Default</Badge>
                                )}
                              </HStack>
                              <Text fontSize="13px" color="gray.600" fontWeight="600">
                                {card.cardType} •••• {card.last4 || '••••'}
                              </Text>
                            </VStack>
                          </HStack>
                        </Radio>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="md"
                      borderColor="blue.500"
                      color="blue.500"
                      borderWidth="2px"
                      _hover={{ bg: "blue.50", borderColor: "blue.600" }}
                      onClick={() => router.push('/user-dashboard/profile/cards')}
                      leftIcon={<Text fontSize="18px">+</Text>}
                      fontWeight="600"
                      borderRadius="10px"
                      py={6}
                    >
                      Add New Card
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    <Divider />
                    <Box
                      p={4}
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="12px"
                      bg="gray.50"
                    >
                      <VStack spacing={3}>
                        <Box
                          w={16}
                          h={16}
                          bg="gray.200"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="32px">💳</Text>
                        </Box>
                        <VStack spacing={1}>
                          <Text fontSize="15px" fontWeight="600" color="gray.700">No Cards Added</Text>
                          <Text fontSize="12px" color="gray.500" textAlign="center">
                            Add a payment card to use this option
                          </Text>
                        </VStack>
                        <Button
                          colorScheme="blue"
                          size="md"
                          onClick={() => router.push('/user-dashboard/profile/cards')}
                          leftIcon={<Text fontSize="18px">+</Text>}
                          fontWeight="600"
                          borderRadius="10px"
                          w="full"
                          py={6}
                        >
                          Add Payment Card
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>
                )}
              </VStack>
            </RadioGroup>
          </Box>
        </VStack>
      </Box>

      {/* Fixed Bottom Payment Button */}
      <Box
        position="fixed"
        bottom={"calc(env(safe-area-inset-bottom, 0px) + 72px)"}
        left={0}
        right={0}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        px={4}
        py={4}
        zIndex={100}
      >
        <Button
          width="100%"
          height="52px"
          bg="gray.900"
          color="white"
          fontSize="16px"
          fontWeight="600"
          borderRadius="12px"
          onClick={handleCheckout}
          isLoading={isCheckingOut}
          loadingText="Processing..."
          disabled={
            !items.length || 
            !deliveryLocation.trim() || 
            (checkoutType === 'wallet' && (meObj.virtualBankAccount?.balance || 0) < grandTotal) ||
            (checkoutType === 'card' && (!meObj.cards || meObj.cards.length === 0 || !selectedCardId))
          }
          _hover={{
            bg: "gray.800",
          }}
          _disabled={{
            bg: "gray.300",
            color: "gray.500",
            cursor: "not-allowed"
          }}
          transition="all 0.2s ease"
        >
          {isCheckingOut ? "Processing..." : `Make a payment • ₦${grandTotal.toLocaleString()}`}
        </Button>
        
        {(!deliveryLocation.trim() || 
          (checkoutType === 'wallet' && (meObj.virtualBankAccount?.balance || 0) < grandTotal) ||
          (checkoutType === 'card' && (!meObj.cards || meObj.cards.length === 0 || !selectedCardId))
        ) && (
          <Text fontSize="12px" color="red.500" textAlign="center" mt={2}>
            {!deliveryLocation.trim() ? "Please enter delivery location to continue" :
             checkoutType === 'wallet' && (meObj.virtualBankAccount?.balance || 0) < grandTotal ? "Insufficient wallet balance for this order" :
             checkoutType === 'card' && (!meObj.cards || meObj.cards.length === 0) ? "Please add a payment card first" :
             checkoutType === 'card' && !selectedCardId ? "Please select a payment card" :
             ""}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default CartTab;
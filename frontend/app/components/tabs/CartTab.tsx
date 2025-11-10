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
  Divider,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { FaShoppingCart } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/cartStore';
import { api } from '@/lib/api';

const CartTab: React.FC = () => {
  const toast = useToast();
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const total = useCartStore((s) => s.subtotal());
  const cartVendorId = useCartStore((s) => s.vendorId);

  const [checkoutType, setCheckoutType] = useState<'wallet' | 'card'>('wallet');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;

  const deliveryFee = 500;
  const serviceCharge = Math.round(total * 0.05);
  const vat = Math.round((total + deliveryFee + serviceCharge) * 0.075);
  const couponDiscount = selectedCoupon ? (selectedCoupon.type === 'percent' ? Math.round(total * selectedCoupon.discount / 100) : selectedCoupon.discount) : 0;
  const grandTotal = total + deliveryFee + serviceCharge + vat - couponDiscount;

  const generateOrderCode = (): number => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const handleCheckout = async () => {
    if (!items.length) return;
    setIsCheckingOut(true);
    
    try {
      const cartStore = useCartStore.getState();
      if (!cartStore.cartId) {
        await cartStore.syncWithBackend();
      }
      
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
        code: orderCode,
        isErrand: false,
      };
      
      const res: any = await api.checkout(payload);
      const createdOrder = (res?.data || res) as any;

      clearCart();
      const backendCode = createdOrder?.code;
      toast({ 
        title: "Order placed successfully!", 
        description: backendCode ? `Give this code to your rider: ${String(backendCode)}` : "Your order has been confirmed and is being processed.",
        status: "success",
        duration: 7000,
        isClosable: true
      });
      window.location.reload();
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

  if (!isHydrated) {
    return (
      <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Box bg="white" borderBottom="1px" borderColor="gray.100" px={4} py={3}>
          <HStack justify="space-between">
            <Text fontSize="18px" fontWeight="600" color="gray.900">Cart</Text>
            <Text fontSize="12px" color="gray.500">Loading...</Text>
          </HStack>
        </Box>
        <Flex h="calc(100vh - 120px)" align="center" justify="center">
          <Text fontSize="14px" color="gray.500">Loading cart...</Text>
        </Flex>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Box bg="white" borderBottom="1px" borderColor="gray.100" px={4} py={3}>
          <HStack justify="space-between">
            <Text fontSize="18px" fontWeight="600" color="gray.900">Cart</Text>
            <Text fontSize="12px" color="gray.500">0 items</Text>
          </HStack>
        </Box>
        <Flex h="calc(100vh - 120px)" align="center" justify="center">
          <VStack spacing={4} textAlign="center" maxW="280px">
            <Box w="100px" h="100px" bg="gray.50" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
              <FaShoppingCart color="#9CA3AF" size="40px" />
            </Box>
            <VStack spacing={2}>
              <Text fontSize="18px" fontWeight="600" color="gray.900">Your cart is empty</Text>
              <Text fontSize="13px" color="gray.500">Add items from stores to get started!</Text>
            </VStack>
            <Button
              bg="gray.900"
              color="white"
              _hover={{ bg: "gray.800" }}
              borderRadius="10px"
              px={6}
              h="42px"
              fontSize="14px"
              fontWeight="600"
              onClick={() => window.location.reload()}
            >
              Start Shopping
            </Button>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      {/* Compact Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.100" px={4} py={3} boxShadow="sm">
        <HStack justify="space-between">
          <Text fontSize="18px" fontWeight="600" color="gray.900">Cart</Text>
          <Text fontSize="12px" color="gray.500">{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
        </HStack>
      </Box>

      <Box px={4} py={3}>
        <VStack spacing={2} align="stretch">
          {/* Compact Cart Items */}
          {items.map((item) => (
            <Box
              key={item.id}
              bg="white"
              borderRadius="10px"
              p={2.5}
              border="1px"
              borderColor="gray.100"
              boxShadow="sm"
            >
              <HStack spacing={2.5} align="start">
                <Image
                  src={item.image || "/food-carousel.png"}
                  alt={item.name}
                  width="50px"
                  height="50px"
                  borderRadius="8px"
                  objectFit="cover"
                />
                
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize="14px" fontWeight="600" color="gray.900" noOfLines={2}>
                    {item.name}
                  </Text>
                  <Text fontSize="12px" color="gray.500">
                    ₦{item.price.toLocaleString()} each
                  </Text>
                  
                  <HStack spacing={1.5} mt={1}>
                    <Button 
                      size="xs" 
                      borderRadius="6px"
                      bg="gray.100"
                      color="gray.700"
                      _hover={{ bg: "gray.200" }}
                      onClick={async () => await decrement(item.id)}
                      minW="26px"
                      h="26px"
                      fontSize="12px"
                    >
                      -
                    </Button>
                    <Text fontSize="14px" fontWeight="600" color="gray.900" minW="18px" textAlign="center">
                      {item.quantity}
                    </Text>
                    <Button 
                      size="xs" 
                      borderRadius="6px"
                      bg="gray.900"
                      color="white"
                      _hover={{ bg: "gray.800" }}
                      onClick={async () => await increment(item.id)}
                      minW="26px"
                      h="26px"
                      fontSize="12px"
                    >
                      +
                    </Button>
                  </HStack>
                </VStack>
                
                <VStack align="end" spacing={1.5}>
                  <Text fontSize="14px" fontWeight="700" color="gray.900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </Text>
                  <IconButton
                    aria-label="remove item"
                    icon={<SmallCloseIcon />}
                    size="xs"
                    borderRadius="6px"
                    bg="red.50"
                    color="red.500"
                    _hover={{ bg: "red.100" }}
                    onClick={async () => await removeItem(item.id)}
                    minW="26px"
                    h="26px"
                  />
                </VStack>
              </HStack>
            </Box>
          ))}

          {/* Compact Order Summary */}
          <Box bg="white" borderRadius="10px" p={3} border="1px" borderColor="gray.100" boxShadow="sm">
            <Text fontSize="16px" fontWeight="600" mb={2.5} color="gray.900">Order Summary</Text>
            
            <VStack spacing={2} align="stretch">
              <Flex justify="space-between">
                <Text fontSize="13px" color="gray.600">Subtotal</Text>
                <Text fontSize="13px" fontWeight="600" color="gray.900">₦{total.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="13px" color="gray.600">Delivery Fee</Text>
                <Text fontSize="13px" fontWeight="600" color="gray.900">₦{deliveryFee.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="13px" color="gray.600">Service Charge (5%)</Text>
                <Text fontSize="13px" fontWeight="600" color="gray.900">₦{serviceCharge.toLocaleString()}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="13px" color="gray.600">VAT (7.5%)</Text>
                <Text fontSize="13px" fontWeight="600" color="gray.900">₦{vat.toLocaleString()}</Text>
              </Flex>
              {couponDiscount > 0 && (
                <Flex justify="space-between">
                  <Text fontSize="13px" color="green.600">Coupon Discount</Text>
                  <Text fontSize="13px" fontWeight="600" color="green.600">-₦{couponDiscount.toLocaleString()}</Text>
                </Flex>
              )}
              <Divider />
              <Flex justify="space-between">
                <Text fontSize="16px" fontWeight="700" color="gray.900">Total</Text>
                <Text fontSize="16px" fontWeight="700" color="gray.900">₦{grandTotal.toLocaleString()}</Text>
              </Flex>
            </VStack>
          </Box>

          {/* Compact Delivery Information */}
          <Box bg="white" borderRadius="10px" p={3} border="1px" borderColor="gray.100" boxShadow="sm">
            <Text fontSize="16px" fontWeight="600" color="gray.900" mb={2.5}>Delivery Information</Text>
            
            <VStack spacing={2.5} align="stretch">
              <Box>
                <Text fontSize="12px" fontWeight="600" mb={1.5} color="gray.700">Delivery Location</Text>
                <Input
                  placeholder="Enter delivery address"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="8px"
                  fontSize="14px"
                  h="38px"
                  _focus={{ borderColor: "gray.300", bg: "white" }}
                />
              </Box>
              
              <Box>
                <Text fontSize="12px" fontWeight="600" mb={1.5} color="gray.700">Delivery Instructions (Optional)</Text>
                <Textarea
                  placeholder="Any special delivery instructions..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="8px"
                  fontSize="14px"
                  rows={2}
                  _focus={{ borderColor: "gray.300", bg: "white" }}
                  resize="none"
                />
              </Box>
            </VStack>
          </Box>

          {/* Compact Payment Method */}
          <Box bg="white" borderRadius="10px" p={3} border="1px" borderColor="gray.100" boxShadow="sm">
            <Text fontSize="16px" fontWeight="600" color="gray.900" mb={2.5}>Payment Method</Text>
            
            <RadioGroup value={checkoutType} onChange={(value: 'wallet' | 'card') => setCheckoutType(value)}>
              <VStack spacing={2} align="stretch">
                <Box
                  p={2.5}
                  border="1px"
                  borderColor={checkoutType === 'wallet' ? 'gray.900' : 'gray.200'}
                  borderRadius="8px"
                  bg={checkoutType === 'wallet' ? 'gray.50' : 'white'}
                >
                  <Radio value="wallet" size="sm">
                    <Box ml={2}>
                      <Text fontSize="14px" fontWeight="600" color="gray.900">Wallet Balance</Text>
                      <Text fontSize="12px" color="gray.600">Pay from your Boiboi wallet</Text>
                    </Box>
                  </Radio>
                </Box>
                <Box
                  p={2.5}
                  border="1px"
                  borderColor={checkoutType === 'card' ? 'gray.900' : 'gray.200'}
                  borderRadius="8px"
                  bg={checkoutType === 'card' ? 'gray.50' : 'white'}
                >
                  <Radio value="card" size="sm">
                    <Box ml={2}>
                      <Text fontSize="14px" fontWeight="600" color="gray.900">Card Payment</Text>
                      <Text fontSize="12px" color="gray.600">Pay with your debit/credit card</Text>
                    </Box>
                  </Radio>
                </Box>
              </VStack>
            </RadioGroup>
          </Box>
        </VStack>
      </Box>

      {/* Compact Fixed Bottom Payment Button */}
      <Box
        position="fixed"
        bottom={"calc(env(safe-area-inset-bottom, 0px) + 72px)"}
        left={0}
        right={0}
        bg="white"
        borderTop="1px"
        borderColor="gray.100"
        px={4}
        py={3}
        zIndex={100}
        boxShadow="lg"
      >
        <Button
          width="100%"
          height="46px"
          bg="gray.900"
          color="white"
          fontSize="15px"
          fontWeight="600"
          borderRadius="10px"
          onClick={handleCheckout}
          isLoading={isCheckingOut}
          loadingText="Processing..."
          disabled={!items.length || !deliveryLocation.trim()}
          _hover={{ bg: "gray.800" }}
          _disabled={{
            bg: "gray.300",
            color: "gray.500",
            cursor: "not-allowed"
          }}
        >
          {isCheckingOut ? "Processing..." : `Make a payment • ₦${grandTotal.toLocaleString()}`}
        </Button>
        
        {!deliveryLocation.trim() && (
          <Text fontSize="11px" color="red.500" textAlign="center" mt={1.5}>
            Please enter delivery location to continue
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default CartTab;

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Heading, SimpleGrid, Input, NumberInput, NumberInputField, Radio, RadioGroup, Stack, Button, Text, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText, HStack, VStack, Icon, Badge, Progress, Divider } from "@chakra-ui/react";
import { FiShoppingCart, FiCreditCard, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";
import { FiDollarSign as FiWallet } from "react-icons/fi";
import { motion } from "framer-motion";
import Card from "@/app/components/Card";

export default function CartPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  // All form state hooks must be at the top level
  const [cartId, setCartId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [deliveryMapLocation, setDeliveryMapLocation] = useState("");
  const [deliveryInstruction, setDeliveryInstruction] = useState("");
  const [couponPrice, setCouponPrice] = useState<number | undefined>(undefined);
  const [code, setCode] = useState(0);
  const [checkoutType, setCheckoutType] = useState<"wallet" | "card">("wallet");
  const [cardId, setCardId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data: me, isLoading: meLoading } = useQuery({ queryKey: ["me"], queryFn: api.me });

  // Trigger load animation when data is ready
  useEffect(() => {
    if (me) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [me]);

  // Professional loading state
  if (meLoading) {
    return (
      <Box p={4}>
        <Skeleton height="30px" width="100px" mb={3} />
        <Card p={5} mt={3}>
          <Skeleton height="24px" width="80px" mb={3} />
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} height="40px" />
            ))}
          </SimpleGrid>
          <Box mt={4}>
            <HStack spacing={6}>
              <Skeleton height="20px" width="60px" />
              <Skeleton height="20px" width="50px" />
            </HStack>
          </Box>
          <Skeleton height="40px" width="120px" mt={4} />
        </Card>
      </Box>
    );
  }

  async function submitCheckout() {
    try {
      setSubmitting(true);
      const body: any = {
        totalPrice,
        cartId,
        storeId,
        isErrand: false,
        deliveryLocation: deliveryLocation || null,
        deliveryFee,
        serviceCharge,
        code,
        couponPrice: typeof couponPrice === "number" ? couponPrice : null,
        deliveryMapLocation: deliveryMapLocation || null,
        deliveryInstruction: deliveryInstruction || null,
        checkoutType,
        cardId: checkoutType === "card" ? cardId : null,
      };
      const res = await api.checkout(body);
      alert("Order placed successfully");
      // Redirect to order detail if id present
      const order: any = (res as any)?.data || res;
      if (order && (order._id || order.id)) {
        router.push(`/dashboard/orders/${order._id || order.id}`);
      }
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box p={4} minH="100vh" bg="gray.50">
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="lg" color="text.primary" mb={2}>
            <HStack spacing={3}>
              <Icon as={FiShoppingCart} color="brand.primary" />
              <Text>My Cart</Text>
            </HStack>
          </Heading>
          <Text color="text.secondary" fontSize="md">
            Complete your order with ease
          </Text>
        </SlideFade>
      </Fade>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card p={4} mt={4} mb={6}>
          <VStack spacing={4}>
            <HStack w="full" justify="space-between">
              <Text fontSize="sm" fontWeight="600" color="text.primary">Checkout Progress</Text>
              <Text fontSize="sm" color="text.secondary">Step 1 of 3</Text>
            </HStack>
            <Progress 
              value={33} 
              w="full" 
              colorScheme="purple" 
              size="lg" 
              borderRadius="full"
              bg="gray.200"
            />
            <HStack w="full" justify="space-between" fontSize="xs" color="text.tertiary">
              <HStack spacing={1}>
                <Icon as={FiCheckCircle} color="brand.primary" />
                <Text>Cart Details</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiMapPin} color="gray.400" />
                <Text>Delivery Info</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiCreditCard} color="gray.400" />
                <Text>Payment</Text>
              </HStack>
            </HStack>
          </VStack>
        </Card>
      </motion.div>

      <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.3 } }}>
        <Card 
          p={6} 
          transition="all 0.3s ease"
          _hover={{
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)"
          }}
          borderRadius="20px"
          border="1px solid"
          borderColor="gray.100"
        >
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="md" color="text.primary">
                <HStack spacing={2}>
                  <Icon as={FiShoppingCart} color="brand.primary" />
                  <Text>Order Details</Text>
                </HStack>
              </Heading>
              <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                New Order
              </Badge>
            </HStack>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Cart ID *</Text>
              <Input 
                placeholder="Enter cart ID" 
                value={cartId} 
                onChange={(e) => setCartId(e.target.value)}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Store ID *</Text>
              <Input 
                placeholder="Enter store ID" 
                value={storeId} 
                onChange={(e) => setStoreId(e.target.value)}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Total Price *</Text>
              <NumberInput value={Number.isFinite(totalPrice) ? totalPrice : 0} onChange={(_, v) => setTotalPrice(Number.isFinite(v) ? v : 0)} min={0}>
                <NumberInputField 
                  placeholder="₦0.00"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                  }}
                  _hover={{
                    borderColor: "gray.300"
                  }}
                />
              </NumberInput>
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">
                <HStack spacing={1}>
                  <Icon as={FiMapPin} />
                  <Text>Delivery Location</Text>
                </HStack>
              </Text>
              <Input 
                placeholder="Enter delivery address" 
                value={deliveryLocation} 
                onChange={(e) => setDeliveryLocation(e.target.value)}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Delivery Fee</Text>
              <NumberInput value={Number.isFinite(deliveryFee) ? deliveryFee : 0} onChange={(_, v) => setDeliveryFee(Number.isFinite(v) ? v : 0)} min={0}>
                <NumberInputField 
                  placeholder="₦0.00"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                  }}
                  _hover={{
                    borderColor: "gray.300"
                  }}
                />
              </NumberInput>
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Service Charge</Text>
              <NumberInput value={Number.isFinite(serviceCharge) ? serviceCharge : 0} onChange={(_, v) => setServiceCharge(Number.isFinite(v) ? v : 0)} min={0}>
                <NumberInputField 
                  placeholder="₦0.00"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                  }}
                  _hover={{
                    borderColor: "gray.300"
                  }}
                />
              </NumberInput>
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Coupon Discount (Optional)</Text>
              <NumberInput value={typeof couponPrice === "number" ? couponPrice : undefined} onChange={(_, v) => setCouponPrice(Number.isFinite(v) ? v : undefined)} min={0}>
                <NumberInputField 
                  placeholder="₦0.00"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.200"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                  }}
                  _hover={{
                    borderColor: "gray.300"
                  }}
                />
              </NumberInput>
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Map Location (Optional)</Text>
              <Input 
                placeholder="GPS coordinates or landmark" 
                value={deliveryMapLocation} 
                onChange={(e) => setDeliveryMapLocation(e.target.value)}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </VStack>
            
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="text.primary">Special Instructions</Text>
              <Input 
                placeholder="Delivery instructions..." 
                value={deliveryInstruction} 
                onChange={(e) => setDeliveryInstruction(e.target.value)}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </VStack>
          </SimpleGrid>

          <Divider />
          
          {/* Payment Method Selection */}
          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="text.primary">
              <HStack spacing={2}>
                <Icon as={checkoutType === "wallet" ? FiWallet : FiCreditCard} color="brand.primary" />
                <Text>Payment Method</Text>
              </HStack>
            </Heading>
            
            <RadioGroup value={checkoutType} onChange={(v: "wallet" | "card") => setCheckoutType(v)}>
              <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={checkoutType === "wallet" ? "brand.primary" : "gray.200"}
                  borderRadius="16px"
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: checkoutType === "wallet" ? "brand.primaryDark" : "gray.300",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  onClick={() => setCheckoutType("wallet")}
                >
                  <Radio value="wallet" colorScheme="purple">
                    <VStack align="start" spacing={1} ml={2}>
                      <HStack spacing={2}>
                        <Icon as={FiWallet} color="brand.primary" />
                        <Text fontWeight="600">Wallet Payment</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary">
                        Pay from your BoiBoi wallet balance
                      </Text>
                    </VStack>
                  </Radio>
                </Box>
                
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={checkoutType === "card" ? "brand.primary" : "gray.200"}
                  borderRadius="16px"
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: checkoutType === "card" ? "brand.primaryDark" : "gray.300",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  onClick={() => setCheckoutType("card")}
                >
                  <Radio value="card" colorScheme="purple">
                    <VStack align="start" spacing={1} ml={2}>
                      <HStack spacing={2}>
                        <Icon as={FiCreditCard} color="brand.primary" />
                        <Text fontWeight="600">Card Payment</Text>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary">
                        Pay with your saved card
                      </Text>
                    </VStack>
                  </Radio>
                </Box>
              </Stack>
            </RadioGroup>
            
            {checkoutType === "card" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VStack align="stretch" spacing={1}>
                  <Text fontSize="sm" fontWeight="600" color="text.primary">Card ID</Text>
                  <NumberInput value={typeof cardId === "number" ? cardId : undefined} onChange={(_, v) => setCardId(Number.isFinite(v) ? v : undefined)} min={0}>
                    <NumberInputField 
                      placeholder="Enter your card ID"
                      borderRadius="12px"
                      border="2px solid"
                      borderColor="gray.200"
                      transition="all 0.2s ease"
                      _focus={{
                        borderColor: "brand.primary",
                        boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                      }}
                      _hover={{
                        borderColor: "gray.300"
                      }}
                    />
                  </NumberInput>
                </VStack>
              </motion.div>
            )}
          </VStack>

          <Divider />

          {/* Submit Button */}
          <Button
            size="lg"
            bg="brand.primary"
            color="white"
            onClick={submitCheckout}
            isDisabled={submitting || !cartId || !storeId || totalPrice <= 0}
            isLoading={submitting}
            loadingText="Processing Order..."
            borderRadius="16px"
            h="56px"
            fontSize="md"
            fontWeight="600"
            transition="all 0.3s ease"
            _hover={{
              bg: "brand.primaryDark",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 24px rgba(82, 52, 229, 0.3)"
            }}
            _active={{
              transform: "translateY(0)"
            }}
            leftIcon={<Icon as={FiShoppingCart} />}
          >
            {submitting ? "Processing..." : "Place Order"}
          </Button>
          </VStack>
        </Card>
      </ScaleFade>
    </Box>
  );
}



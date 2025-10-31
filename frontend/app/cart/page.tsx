"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Icon, Badge, Wrap, Image, Flex, Text, VStack, IconButton, HStack, Input, InputRightElement, InputGroup, Button, useToast, Divider, Select, Textarea, RadioGroup, Radio, Stack, useColorModeValue } from "@chakra-ui/react";
import { FaShoppingCart } from "react-icons/fa";
import Wrapper from "../components/Wrapper";
import { AddIcon, ArrowBackIcon, ArrowForwardIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { useCartStore } from "@/lib/cartStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GoHeart } from "react-icons/go";


const CartWithBadge = () => {
  const router =  useRouter();
  const toast = useToast();
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const total = useCartStore((s) => s.subtotal());
  const qty = useCartStore((s) => s.totalQuantity());
  const cartVendorId = useCartStore((s) => s.vendorId);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;

   // Get recommended items from the same vendor or popular items
   const { data: recommendedData } = useQuery({
     queryKey: ["recommended-items", cartVendorId],
     queryFn: () => cartVendorId ? api.vendorItems(cartVendorId) : Promise.resolve([]),
     enabled: Boolean(cartVendorId),
   });
   
   const recommendedItems = (recommendedData as any)?.data || recommendedData || [];
   const cards = recommendedItems.slice(0, 3).map((item: any, index: number) => ({
     id: item.id || item._id || index,
     title: item.name || "Item",
     content: item.desc || "Great item from our store",
     image: item.image || item.Image || "/Food-item-1.jpeg",
     pricetag: "Starting from",
     price: `₦${(item.price || 0).toLocaleString()}`
   }));

  const [activeIndex, setActiveIndex] = useState(0);
  
    const carouselRef = useRef<HTMLDivElement>(null);
    let touchStartX = 0;
  
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
  
    const handleTouchMove = (e: React.TouchEvent) => {
      const touchEndX = e.touches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (diff > 50) {
        setActiveIndex((prev) => (prev + 1) % cards.length);
      } else if (diff < -50) {
        setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
      }
    };

  const [checkoutType, setCheckoutType] = useState<'wallet' | 'card'>('wallet');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  // Get user's saved cards
  const userCards = useMemo(() => {
    return (meObj?.cards || []) as Array<{
      id: number;
      bank: string;
      cardType: string;
      authorizationCode: string;
      isSelected: boolean;
    }>;
  }, [meObj?.cards]);
  
  // Auto-select the default card or first card
  useEffect(() => {
    if (checkoutType === 'card' && userCards.length > 0 && !selectedCardId) {
      const defaultCard = userCards.find(card => card.isSelected);
      setSelectedCardId(defaultCard?.id || userCards[0].id);
    }
  }, [checkoutType, userCards, selectedCardId]);

  const deliveryFee = 500; // Fixed delivery fee
  const serviceCharge = Math.round(total * 0.05); // 5% service charge
  const vat = Math.round((total + deliveryFee + serviceCharge) * 0.075); // 7.5% VAT
  const couponDiscount = selectedCoupon ? (selectedCoupon.type === 'percent' ? Math.round(total * selectedCoupon.discount / 100) : selectedCoupon.discount) : 0;
  const grandTotal = total + deliveryFee + serviceCharge + vat - couponDiscount;

  const handleCheckout = async () => {
    if (!items.length) return;
    
    // Validate card selection if card payment is chosen
    if (checkoutType === 'card') {
      if (userCards.length === 0) {
        toast({ 
          title: "No saved cards", 
          description: "Please add a card to your account or use wallet payment.",
          status: "warning",
          duration: 5000,
          isClosable: true
        });
        return;
      }
      if (!selectedCardId) {
        toast({ 
          title: "Select a card", 
          description: "Please select a card for payment.",
          status: "warning",
          duration: 5000,
          isClosable: true
        });
        return;
      }
    }
    
    setIsCheckingOut(true);
    
    try {
      // Ensure cart is synced with backend before checkout
      await useCartStore.getState().syncWithBackend();
      
      const cartId = useCartStore.getState().cartId;
      
      if (!cartId) {
        throw new Error("Cart could not be created. Please try again.");
      }
      
      // Generate 4-digit order completion code (1000-9999)
      const orderCode = Math.floor(1000 + Math.random() * 9000);
      
      const payload: any = {
        totalPrice: grandTotal,
        cartId: cartId,
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
      
      // Add cardId if card payment is selected
      if (checkoutType === 'card' && selectedCardId) {
        payload.cardId = selectedCardId;
      }
      
      const res: any = await api.checkout(payload);
      const createdOrder = (res?.data || res) as any;
      clearCart();
      // Only show backend provided code if present
      toast({ 
        title: "Order placed successfully!", 
        description: createdOrder?.code ? `Give this code to your rider: ${String(createdOrder.code)}` : "Your order has been confirmed and is being processed.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
      router.replace("/user-dashboard");
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

   return (
   <Box 
     minH="100vh" 
     bg="linear-gradient(135deg, #F2F2F7 0%, #E5E7EB 50%, #F9FAFB 100%)"
     position="relative"
     _before={{
       content: '""',
       position: "absolute",
       top: 0,
       left: 0,
       right: 0,
       bottom: 0,
       background: `
         radial-gradient(circle at 20% 80%, rgba(59, 23, 79, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 80% 20%, rgba(107, 42, 143, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
       `,
       pointerEvents: "none",
       zIndex: 0,
     }}
   >
     <Wrapper>
       <Box my={{ base: "2em", md: "3em" }} position="relative" zIndex={1}>
          <Flex gap={{ base: 3, md: 5 }} alignItems="center" mb={6}>
             <Box
               p={{ base: 2, md: 3 }}
               borderRadius={{ base: "10px", md: "12px" }}
               bg="rgba(255, 255, 255, 0.9)"
               backdropFilter="blur(10px)"
               border="1px solid rgba(255, 255, 255, 0.2)"
               cursor="pointer"
               transition="all 0.3s ease"
               _hover={{
                 bg: "rgba(255, 255, 255, 1)",
                 transform: "translateX(-2px)",
                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
               }}
               onClick={() => location.replace("/add-to-cart")}
             >
               <ArrowBackIcon width={{ base: "18px", md: "20px" }} height={{ base: "18px", md: "20px" }} color={"#3B174F"}/>
             </Box>
             <VStack align="start" spacing={0} flex={1}>
               <Text 
                 fontSize={{ base: "20px", md: "24px" }} 
                 fontWeight={"800"} 
                 bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" 
                 bgClip="text" 
                 color="transparent"
               >
                 Shopping Cart
               </Text>
               <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                 Review your items & checkout
               </Text>
             </VStack>
          </Flex>
       </Box>

      {/* Cart Items */}
      {items.map((it, index) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(20px)"
            borderRadius={{ base: "16px", md: "20px" }}
            p={{ base: 3, md: 4 }}
            border="1px solid rgba(255, 255, 255, 0.2)"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
            mb={{ base: 3, md: 4 }}
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            }}
          >
            <Flex gap={{ base: 3, md: 4 }} alignItems="center" direction={{ base: "row", md: "row" }}>
              <Box position="relative">
                <Image 
                  src={it.image || "/food-carousel.png"} 
                  alt={it.name} 
                  width={{ base: "60px", md: "70px" }} 
                  height={{ base: "60px", md: "70px" }} 
                  borderRadius={{ base: "12px", md: "16px" }}
                  objectFit="cover"
                />
                <Badge 
                  position="absolute" 
                  top="-2" 
                  right="-2" 
                  bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
                  color="white" 
                  borderRadius="50%" 
                  fontSize={{ base: "10px", md: "11px" }} 
                  fontWeight="700"
                  px={{ base: 1.5, md: 2 }} 
                  py={1}
                  minW={{ base: "18px", md: "20px" }}
                  height={{ base: "18px", md: "20px" }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 2px 8px rgba(59, 23, 79, 0.3)"
                  border="2px solid white"
                >
                  {it.quantity}
                </Badge>
              </Box>
              
              <Box flex={1}>
                <Text fontSize={{ base: "15px", md: "18px" }} fontWeight="700" mb={1} noOfLines={1} color="#1A1A1A">
                  {it.name}
                </Text>
                <Text fontSize={{ base: "12px", md: "14px" }} color="#6B7280" mb={{ base: 2, md: 3 }}>
                  ₦{it.price.toLocaleString()} each
                </Text>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Button 
                    size={{ base: "xs", md: "sm" }} 
                    borderRadius={{ base: "10px", md: "12px" }}
                    bg="rgba(59, 23, 79, 0.1)"
                    color="#3B174F"
                    _hover={{ bg: "rgba(59, 23, 79, 0.2)" }}
                    onClick={async () => await decrement(it.id)}
                    minW={{ base: "28px", md: "32px" }}
                    height={{ base: "28px", md: "32px" }}
                  >
                    -
                  </Button>
                  <Text fontWeight="600" fontSize={{ base: "14px", md: "16px" }} color="#1A1A1A" minW={{ base: "20px", md: "24px" }} textAlign="center">
                    {it.quantity}
                  </Text>
                  <Button 
                    size={{ base: "xs", md: "sm" }} 
                    borderRadius={{ base: "10px", md: "12px" }}
                    bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
                    color="white"
                    _hover={{ transform: "scale(1.05)" }}
                    onClick={async () => await increment(it.id)}
                    minW={{ base: "28px", md: "32px" }}
                    height={{ base: "28px", md: "32px" }}
                  >
                    +
                  </Button>
                </HStack>
              </Box>
              
              <VStack align="end" spacing={{ base: 1, md: 2 }}>
                <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="800" color="#1A1A1A">
                  ₦{(it.price * it.quantity).toLocaleString()}
                </Text>
                <IconButton 
                  aria-label="remove" 
                  icon={<SmallCloseIcon />} 
                  size={{ base: "xs", md: "sm" }} 
                  borderRadius={{ base: "10px", md: "12px" }}
                  bg="rgba(239, 68, 68, 0.1)"
                  color="#EF4444"
                  _hover={{ bg: "rgba(239, 68, 68, 0.2)" }}
                  onClick={async () => await removeItem(it.id)} 
                />
              </VStack>
            </Flex>
          </Box>
        </motion.div>
      ))}

      {/* Order Summary */}
      <Box 
        mt={8} 
        p={6} 
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(20px)"
        borderRadius="20px"
        border="1px solid rgba(255, 255, 255, 0.2)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
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
      <Box mt={6}>
        <Text fontSize="16px" fontWeight="700" mb={3}>Delivery Information</Text>
        
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="14px" fontWeight="600" mb={2}>Delivery Location</Text>
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
      <Box mt={6}>
        <Text fontSize="16px" fontWeight="700" mb={3}>Payment Method</Text>
        
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
                <Text fontSize="14px" fontWeight="600">Saved Card</Text>
                <Text fontSize="12px" color="gray.600">
                  {userCards.length > 0 
                    ? `Pay with your saved card (${userCards.length} card${userCards.length > 1 ? 's' : ''} available)` 
                    : "No saved cards - please add a card first"}
                </Text>
              </Box>
            </Radio>
          </Stack>
        </RadioGroup>
        
        {/* Card Selector */}
        {checkoutType === 'card' && userCards.length > 0 && (
          <Box mt={4} p={4} bg="gray.50" borderRadius="12px">
            <Text fontSize="14px" fontWeight="600" mb={2}>Select Card</Text>
            <Select
              placeholder="Choose a card"
              value={selectedCardId || ''}
              onChange={(e) => setSelectedCardId(Number(e.target.value))}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
            >
              {userCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.bank} - {card.cardType} {card.isSelected ? '(Default)' : ''}
                </option>
              ))}
            </Select>
          </Box>
        )}
      </Box>

      {/* Checkout Button */}
      <Box mt={8} mb={4}>
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
          boxShadow="0 8px 25px rgba(59, 23, 79, 0.3)"
          _hover={{
            bg: "linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)",
            transform: "translateY(-3px)",
            boxShadow: "0 12px 35px rgba(59, 23, 79, 0.4)",
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
          <Text fontSize="12px" color="red.500" mt={2} textAlign="center">
            Please enter delivery location to continue
          </Text>
        )}
      </Box>

      <Box my={'2em'}>
         <Flex justifyContent={"space-between"} mb={"1em"}>
            <Text fontSize="18px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Popular with these</Text>
         </Flex>
         <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
            <Flex ref={carouselRef} overflow="hidden" w="100%" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
               <motion.div style={{ display: "flex", width: "100%" }} animate={{ x: `-${activeIndex * 100}%` }} transition={{ type: "spring", stiffness: 100 }}>
                {cards.length > 0 ? cards.map((card: any) => (
               <Box key={card.id} flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={card.image} bgSize="cover" bgPosition="center">
                  <Text fontSize="12px" fontWeight="700" position={"absolute"} left={"3"} bottom="3" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"8px"} py={"4px"}>{card.price}</Text>
                  <Box borderRadius={"50%"} position="absolute" top={2} right={2} color={"rgba(255, 255, 255, 1)"} opacity={1} p={2}>
                     <Icon aria-label="Like" as={GoHeart} color={"white"}  opacity={1} size={"12px"}/>
                  </Box>
               </Box>
               )) : (
               <Box flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.500">No recommended items available</Text>
               </Box>
               )}
               </motion.div>
            </Flex>
         </Box>
         {cards.length > 0 && (
           <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>{cards[activeIndex]?.title}</Text>
              <Icon as={AddIcon} width={"18px"} height={"18px"}/>
           </Flex>
         )}
         {cards.length > 0 && (
           <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>{cards[activeIndex]?.content}</Text>
         )}
      </Box>

      <Box mt={"3em"} mb={"1em"}>
         <Text fontSize="18px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>Coupon</Text>
         <InputGroup>
         <Input placeholder="GREELOGIX" borderRadius={"16px"} border={"2px solid rgba(242, 242, 247, 1)"} height={"54px"} mt={".5em"}/>
         <InputRightElement>{<ArrowForwardIcon width={"22px"} height={"22px"} mt={"1.5em"} mr={"2em"}/>}</InputRightElement>
         </InputGroup>
      </Box>

      <Flex justifyContent={"space-between"} width={"100%"} mx={"auto"} mt={"2em"}>
         <Text fontSize="20px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>Subtotal</Text>
         <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"} color={"brand.primary"}>₦{total.toLocaleString()}</Text>
      </Flex>
      
      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>Delivery Fee</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(142, 142, 147, 1)"}>₦{deliveryFee.toLocaleString()}</Text>
         </Box>
      </Flex>

      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>Service Charge (5%)</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(142, 142, 147, 1)"}>₦{serviceCharge.toLocaleString()}</Text>
         </Box>
      </Flex>

      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>VAT (7.5%)</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(142, 142, 147, 1)"}>₦{vat.toLocaleString()}</Text>
         </Box>
      </Flex>

      {couponDiscount > 0 && (
        <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
           <Box my={"1em"}>
              <Text fontWeight={"400"} fontSize={"17px"}>Coupon Discount</Text>
           </Box>
        
           <Box>
              <Text my={"1em"} color={"rgba(52, 199, 89, 1)"}>-₦{couponDiscount.toLocaleString()}</Text>
           </Box>
        </Flex>
      )}

      <Flex justifyContent={"space-between"} alignItems={"center"} mt={"4em"} mb={"1em"}>
         <Text fontSize="28px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>₦{grandTotal.toLocaleString()}</Text>
         <Button isDisabled={!items.length || !deliveryLocation.trim()} fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"} color={"#fff"} variant={"primary"} bg={"brand.primary"} borderRadius={"16px"} py={"28px"} px={"24px"} onClick={handleCheckout}>Go to Checkout</Button>
      </Flex>  
     </Wrapper>
   </Box>
  );
};

export default CartWithBadge;

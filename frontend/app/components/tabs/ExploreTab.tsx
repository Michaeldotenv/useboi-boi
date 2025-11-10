"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaBell } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { FaBox } from "react-icons/fa";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../EmptyState";
import { useCartStore } from "@/lib/cartStore";
import { useNavigation } from "../../contexts/NavigationContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

const ExploreTab: React.FC = () => {
  const router = useRouter();
  const { navigateToTab } = useNavigation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [likedStores, setLikedStores] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: api.vendors,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  // Mutation for liking/unliking vendors
  const likeMutation = useMutation({
    mutationFn: (vendorId: string) => api.likeVendor(vendorId),
    onSuccess: (_, vendorId) => {
      setLikedStores(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(vendorId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["saved-vendors"] });
      toast({
        title: "Store saved!",
        description: "Added to your saved stores",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (vendorId: string) => api.unlikeVendor(vendorId),
    onSuccess: (_, vendorId) => {
      setLikedStores(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(vendorId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["saved-vendors"] });
      toast({
        title: "Store removed",
        description: "Removed from your saved stores",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  const handleToggleLike = async (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedStores.has(vendorId)) {
      unlikeMutation.mutate(vendorId);
    } else {
      likeMutation.mutate(vendorId);
    }
  };

  // Normalize vendors array from API
  const vendorList: any[] = Array.isArray((vendors as any)?.data)
    ? (vendors as any).data
    : (Array.isArray(vendors) ? (vendors as any) : []) as any[];

  // Map category IDs to readable names
  const getCategoryName = (vendor: any): string => {
    if (typeof vendor.category === 'string' && !vendor.category.match(/^[0-9a-f]{24}$/i)) {
      return vendor.category;
    }
    if (vendor.categoryName) return vendor.categoryName;
    if (vendor.category && typeof vendor.category === 'object' && vendor.category.name) {
      return vendor.category.name;
    }
    if (vendor.businessType) return vendor.businessType;
    
    const categoryMap: { [key: string]: string } = {
      '67d582619dfc3452b04e4c77': 'Restaurant',
      '68035daf79fd624e59299358': 'Grocery',
      '68035dd9f2c01460883c9e14': 'Supermarket',
    };
    
    if (vendor.category && categoryMap[vendor.category]) {
      return categoryMap[vendor.category];
    }
    return 'Store';
  };

  // Filter vendors based on search query
  const filteredVendorList = vendorList.filter((v: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (v.businessName && v.businessName.toLowerCase().includes(query)) ||
      (v.name && v.name.toLowerCase().includes(query)) ||
      (v.Name && v.Name.toLowerCase().includes(query)) ||
      (getCategoryName(v).toLowerCase().includes(query))
    );
  });

  // Get store image
  const getStoreImage = (v: any): string => {
    return (
      v?.image ||
      v?.Image ||
      v?.coverImage ||
      v?.logoUrl ||
      "Food-item-1.jpeg"
    );
  };

  // Touch handlers
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50 && activeIndex < filteredVendorList.length - 1) {
      setActiveIndex((prev) => prev + 1);
      touchStartX = touchEndX;
    } else if (diff < -50 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      touchStartX = touchEndX;
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered || filteredVendorList.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filteredVendorList.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, filteredVendorList.length]);

  // Reset to first item when search query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  const cartQty = useCartStore((s) => s.items.reduce((sum, it) => sum + it.quantity, 0));

  if (vendorsLoading) {
    return (
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
        <Box 
          bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)" 
          w="100%" 
          py={{ base: 6, md: 8 }}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="url('/pattern.svg')"
            opacity={0.1}
            bgSize="200px"
            bgRepeat="repeat"
          />
          <Wrapper>
            <Flex justifyContent="space-between" alignItems="center" mb={6} position="relative" zIndex={1}>
              <VStack align="start" spacing={1}>
                <Text fontSize="13px" fontWeight="600" color="whiteAlpha.900" letterSpacing="wide">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
                </Text>
                <HStack spacing={2}>
                  <Text fontSize={{ base: "20px", md: "22px" }} fontWeight="700" color="white">
                    University of Ibadan
                  </Text>
                  <Box as="span" color="whiteAlpha.800" fontSize="14px">▼</Box>
                </HStack>
              </VStack>
              <Flex 
                alignItems="center"
                justifyContent="center"
                w={{ base: 10, md: 11 }}
                h={{ base: 10, md: 11 }}
                borderRadius="full"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ bg: "whiteAlpha.300", transform: "scale(1.05)" }}
                _active={{ transform: "scale(0.95)" }}
              >
                <Icon as={FaBell} color="white" fontSize="20px" />
              </Flex>
            </Flex>
            <Box position="relative" zIndex={1}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="56px">
                  <SearchIcon ml="16px" width="20px" h="20px" color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search for food, groceries, or stores..."
                  width="100%"
                  fontSize="15px"
                  bg="white"
                  fontWeight="500"
                  h="56px"
                  borderRadius="16px"
                  border="none"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                  boxShadow="0 8px 24px rgba(0,0,0,0.12)"
                  _focus={{
                    boxShadow: "0 8px 32px rgba(107, 42, 143, 0.2)",
                    outline: "none"
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Box>
          </Wrapper>
        </Box>
        <Wrapper>
          <Box py={8}>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Spinner 
                  size="xl" 
                  thickness="4px"
                  speed="0.65s"
                  color="blue.500"
                  emptyColor="gray.200"
                />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="gray.900" textAlign="center">
                  Finding amazing stores for you...
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  This might take a moment
                </Text>
              </VStack>
            </VStack>
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
      {/* Header Section */}
      <Box 
        bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)" 
        w="100%" 
        py={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="url('/pattern.svg')"
          opacity={0.1}
          bgSize="200px"
          bgRepeat="repeat"
        />
        <Wrapper>
          <Flex justifyContent="space-between" alignItems="center" mb={6} position="relative" zIndex={1}>
            <VStack align="start" spacing={1}>
              <Text fontSize="12px" fontWeight="500" color="whiteAlpha.800">
                Good morning! 👋
              </Text>
              <HStack spacing={2}>
                <Text fontSize="18px" fontWeight="700" color="white">
                  University of Ibadan
                </Text>
                <Box 
                  as="span" 
                  color="whiteAlpha.700" 
                  fontSize="12px"
                  cursor="pointer"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                >
                  ▼
                </Box>
              </HStack>
            </VStack>
            <Flex 
              alignItems="center"
              justifyContent="center"
              w={10}
              h={10}
              borderRadius="full"
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
              transition="all 0.2s ease"
              _hover={{
                bg: "whiteAlpha.300",
                transform: "scale(1.05)"
              }}
              cursor="pointer"
            >
              <Icon as={FaBell} color="white" fontSize="18px" />
            </Flex>
          </Flex>

          <Box position="relative" zIndex={1}>
            <InputGroup>
              <InputLeftElement pointerEvents="none" h="52px">
                <SearchIcon ml="14px" width="20px" h="20px" color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search for food, groceries, or stores..."
                width="100%"
                fontSize="16px"
                bg="white"
                fontWeight="400"
                h="52px"
                borderRadius="16px"
                border="none"
                color="gray.900"
                _placeholder={{ color: "gray.400" }}
                _focus={{ 
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.3)"
                }}
                boxShadow="0 4px 20px rgba(0,0,0,0.1)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Box>
        </Wrapper>
      </Box>

      <Wrapper>
        {/* Content Section */}
        <Box py={6}>
          {/* Quick Actions Header */}
          <Text fontSize="20px" fontWeight="700" color="gray.900" mb={4}>
            What do you need? 🍽️
          </Text>
          
          {/* Category Grid */}
          <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={8}>
            {[
              { label: "Grocery", icon: "🍅", color: "green", desc: "Fresh groceries" },
              { label: "Restaurant", icon: "🍴", color: "orange", desc: "Delicious meals" },
              { label: "Supermarket", icon: "🏢", color: "blue", desc: "Everything you need" },
              { label: "Send Package", icon: "📦", color: "purple", desc: "Quick delivery" },
              { label: "Market Runs", icon: "🛍️", color: "pink", desc: "Shop for you" },
              { label: "More", icon: "✨", color: "gray", desc: "Explore more" }
            ].map(
              (category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <VStack
                    bg="white"
                    borderRadius="16px"
                    py={4}
                    px={3}
                    spacing={2}
                    border="1px solid"
                    borderColor="gray.100"
                    cursor="pointer"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: `${category.color}.200`,
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 25px rgba(0,0,0,0.1)`
                    }}
                    _active={{
                      transform: "translateY(-2px)"
                    }}
                    boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  >
                    <Flex
                      w="44px"
                      h="44px"
                      borderRadius="12px"
                      bg={`${category.color}.50`}
                      alignItems="center"
                      justifyContent="center"
                      fontSize="22px"
                      mb={1}
                    >
                      {category.icon}
                    </Flex>
                    <Text fontSize="11px" color="gray.900" fontWeight="600" textAlign="center" lineHeight={1.2}>
                      {category.label}
                    </Text>
                    <Text fontSize="9px" color="gray.500" fontWeight="400" textAlign="center" lineHeight={1.1}>
                      {category.desc}
                    </Text>
                  </VStack>
                </motion.div>
              )
            )}
          </Grid>
        </Box>

        {/* Buy Again Section */}
        <Box w="100%" mb={8}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" color="gray.900">
              Buy again
            </Text>
            <Text fontSize={{ base: "14px", md: "14px" }} fontWeight="500" color="gray.500" cursor="pointer">
              See all
            </Text>
          </Flex>
          
          {filteredVendorList.length === 0 ? (
            <EmptyState
              icon="/empty-explore.svg"
              title="No stores found"
              description={searchQuery ? `No stores match "${searchQuery}". Try searching for something else.` : "No stores are available right now. Check back later!"}
              actionText="Browse all stores"
              onAction={() => setSearchQuery("")}
            />
          ) : (
            <Box position="relative">
              <Box
                ref={carouselRef}
                overflow="hidden"
                w="100%"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.div
                  style={{ display: "flex", width: "100%" }}
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {filteredVendorList.map((v: any, idx: number) => (
                    <Box
                      key={v._id || v.id}
                      flex="0 0 100%"
                      px={1}
                      onClick={() => {
                        const storeId = v._id || v.id;
                        if (storeId) {
                          router.push(`/user-dashboard/stores/${storeId}`);
                        }
                      }}
                      cursor="pointer"
                    >
                      <Flex
                        w="100%"
                        h="140px"
                        borderRadius="12px"
                        bg="gray.100"
                        bgImage={getStoreImage(v) !== "Food-item-1.jpeg" ? `url(${getStoreImage(v)})` : undefined}
                        bgSize="cover"
                        bgPosition="center"
                        position="relative"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {getStoreImage(v) === "Food-item-1.jpeg" && (
                          <VStack spacing={2}>
                            <Text fontSize="2xl">🏢</Text>
                            <Text fontSize="xs" color="gray.600" fontWeight="500">
                              {v.businessName || v.name || "Store"}
                            </Text>
                          </VStack>
                        )}
                        <IconButton
                          aria-label="Like"
                          icon={likedStores.has(v._id || v.id) ? <GoHeartFill /> : <GoHeart />}
                          size="sm"
                          bg="rgba(255,255,255,0.9)"
                          color={likedStores.has(v._id || v.id) ? "brand.accent" : "#000"}
                          borderRadius="full"
                          position="absolute"
                          top={2}
                          right={2}
                          _hover={{ bg: "white" }}
                          onClick={(e) => handleToggleLike(v._id || v.id, e)}
                        />
                      </Flex>
                      <Flex justifyContent="space-between" alignItems="center" mt={2}>
                        <Box>
                          <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#000" noOfLines={1}>
                            {v.businessName || v.name || v.Name}
                          </Text>
                          <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="400" color="#8E8E93">
                            {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
                          </Text>
                        </Box>
                        <HStack spacing={0.5}>
                          <Image src="/Star.png" alt="Rating" width="14px" height="14px" />
                          <Text fontSize={{ base: "11px", md: "12px" }} fontWeight="600" color="#000">
                            {v.rating ?? v.Ratings ?? "4.5"}
                          </Text>
                        </HStack>
                      </Flex>
                    </Box>
                  ))}
                </motion.div>
              </Box>

              {/* Pagination Dots */}
              <Flex justifyContent="center" gap={2} mt={4}>
                {filteredVendorList.map((_, index) => (
                  <Box
                    key={index}
                    w={activeIndex === index ? "20px" : "6px"}
                    h="6px"
                    bg={activeIndex === index ? "#000" : "#D1D1D6"}
                    borderRadius="full"
                    transition="all 0.3s"
                    cursor="pointer"
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        {/* Vendors Near You */}
        <Box w="100%" mb={8}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" color="gray.900">
              Vendors near you
            </Text>
            <Text fontSize="14px" fontWeight="500" color="gray.500" cursor="pointer">
              See all
            </Text>
          </Flex>
          
          {filteredVendorList.length === 0 ? (
            <EmptyState
              icon="/empty-location.svg"
              title="No nearby vendors"
              description="We couldn't find any vendors in your area. Try expanding your search or check back later."
              actionText="Refresh location"
              onAction={() => window.location.reload()}
            />
          ) : (
            <Box position="relative">
              <Box overflow="hidden" w="100%">
                <motion.div
                  style={{ display: "flex", width: "100%" }}
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {filteredVendorList.map((v: any) => (
                    <Box
                      key={v._id || v.id}
                      flex="0 0 100%"
                      px={1}
                      onClick={() => {
                        const storeId = v._id || v.id;
                        if (storeId) {
                          router.push(`/user-dashboard/stores/${storeId}`);
                        }
                      }}
                      cursor="pointer"
                    >
                      <Box
                        bg="white"
                        borderRadius="12px"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <Flex
                          w="100%"
                          h="110px"
                          bg="gray.100"
                          bgImage={getStoreImage(v) !== "Food-item-1.jpeg" ? `url(${getStoreImage(v)})` : undefined}
                          bgSize="cover"
                          bgPosition="center"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {getStoreImage(v) === "Food-item-1.jpeg" && (
                            <VStack spacing={1}>
                              <Text fontSize="xl">🏢</Text>
                              <Text fontSize="10px" color="gray.600" fontWeight="500" textAlign="center">
                                {(v.businessName || v.name || "Store").slice(0, 12)}...
                              </Text>
                            </VStack>
                          )}
                        </Flex>
                        <Box p={3}>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Box>
                              <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#000" noOfLines={1}>
                                {v.businessName || v.name || v.Name}
                              </Text>
                              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="400" color="#8E8E93">
                                {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
                              </Text>
                            </Box>
                            <HStack spacing={0.5}>
                              <Image src="/Star.png" alt="Rating" width="14px" height="14px" />
                                    <Text fontSize={{ base: "11px", md: "12px" }} fontWeight="600" color="#000">
                                {v.rating ?? v.Ratings ?? "4.5"}
                              </Text>
                            </HStack>
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </motion.div>
              </Box>
            </Box>
          )}
        </Box>

        {/* Best Deals */}
        <Box w="100%" mb={8}>
          <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" mb={4} color="gray.900">
            Best deals for you
          </Text>
          
          {filteredVendorList.length === 0 ? (
            <EmptyState
              icon="/empty-deals.svg"
              title="No deals available"
              description="We're working on bringing you the best deals. Check back soon for amazing offers!"
              variant="minimal"
            />
          ) : (
            <Box position="relative">
              <Box 
                overflowX="auto" 
                overflowY="hidden"
                w="100%"
                css={{
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  '-ms-overflow-style': 'none',
                  'scrollbar-width': 'none',
                }}
              >
                <Flex gap={3} pb={2}>
                  {filteredVendorList.map((v: any, index) => (
                      <Box 
                        key={v._id || v.id}
                        flex="0 0 320px"
                        px={2}
                        cursor="pointer"
                        onClick={() => {
                          router.push(`/user-dashboard/stores/${v._id || v.id}`);
                        }}
                      >
                        <Box
                          bg="white"
                          borderRadius="12px"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="gray.200"
                          transition="all 0.2s ease"
                          _hover={{
                            borderColor: "gray.300",
                          }}
                          position="relative"
                          h="260px"
                          display="flex"
                          flexDirection="column"
                        >
                          <Flex
                            w="100%"
                            h="160px"
                            bg="gray.100"
                            bgImage={getStoreImage(v) !== "Food-item-1.jpeg" ? `url(${getStoreImage(v)})` : undefined}
                            bgSize="cover"
                            bgPosition="center"
                            position="relative"
                            overflow="hidden"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {getStoreImage(v) === "Food-item-1.jpeg" && (
                              <VStack spacing={2}>
                                <Text fontSize="3xl">🏢</Text>
                                <Text fontSize="sm" color="gray.600" fontWeight="600" textAlign="center">
                                  {v.businessName || v.name || "Store"}
                                </Text>
                              </VStack>
                            )}
                            <Text
                              position="absolute"
                              bottom="8px"
                              right="8px"
                              fontSize="12px"
                              bg="brand.primary"
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="8px"
                              fontWeight="600"
                            >
                              Up to 40% off
                            </Text>
                          </Flex>
                          <Box p={4} flex="1" display="flex" flexDirection="column" justifyContent="space-between">
                            <Box>
                              <Text fontSize="15px" fontWeight="600" color="#1A1A1A" noOfLines={1} mb={1}>
                                {v.businessName || v.name || v.Name}
                              </Text>
                              <Text fontSize="13px" fontWeight="400" color="#6B7280" noOfLines={1}>
                                {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
                              </Text>
                            </Box>
                            <Flex justifyContent="space-between" alignItems="center" mt={3}>
                              <Text fontSize="13px" fontWeight="500" color="#1A1A1A">
                                ★ {v.rating ?? v.Ratings ?? "4.5"}
                              </Text>
                              <Text fontSize="12px" fontWeight="500" color="#8E8E93">
                                Store
                              </Text>
                            </Flex>
                          </Box>
                        </Box>
                      </Box>
                  ))}
                </Flex>
              </Box>
            </Box>
          )}
        </Box>

        {/* More Stores */}
        <Box w="100%" mb={8}>
          <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" mb={4} color="gray.900">
            More stores
          </Text>
          
          {filteredVendorList.length === 0 ? (
            <EmptyState
              icon="/empty-stores.svg"
              title="No stores to show"
              description="We're adding more stores every day. Come back soon to discover new places!"
              variant="minimal"
            />
          ) : (
            <VStack spacing={3} align="stretch">
              {filteredVendorList.slice(0, 3).map((v: any) => (
                <Box
                  key={v._id || v.id}
                  bg="white"
                  borderRadius="12px"
                  p={3}
                  border="1px solid"
                  borderColor="gray.200"
                  onClick={() => {
                    const storeId = v._id || v.id;
                    if (storeId) {
                      router.push(`/user-dashboard/stores/${storeId}`);
                    }
                  }}
                  cursor="pointer"
                  _hover={{ borderColor: "gray.300" }}
                  transition="all 0.2s ease"
                >
                  <Box
                    w="100%"
                    h="150px"
                    borderRadius="12px"
                    bg="gray.100"
                    bgImage={getStoreImage(v) !== "Food-item-1.jpeg" ? `url(${getStoreImage(v)})` : undefined}
                    bgSize="cover"
                    bgPosition="center"
                    mb={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {getStoreImage(v) === "Food-item-1.jpeg" && (
                      <VStack spacing={2}>
                        <Text fontSize="2xl">🏢</Text>
                        <Text fontSize="xs" color="gray.600" fontWeight="600" textAlign="center">
                          {v.businessName || v.name || "Store"}
                        </Text>
                      </VStack>
                    )}
                  </Box>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#000" noOfLines={1}>
                        {v.businessName || v.name || v.Name}
                      </Text>
                      <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="400" color="#8E8E93">
                        {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
                      </Text>
                    </Box>
                    <Text fontSize={{ base: "11px", md: "12px" }} fontWeight="600" color="#000">
                      ★ {v.rating ?? v.Ratings ?? "4.5"}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Box mb="5em" />
      </Wrapper>

      {/* Floating Cart Button */}
      <Box position="fixed" bottom="80px" right="4" zIndex={50} onClick={() => navigateToTab('cart')} cursor="pointer">
        <Box position="relative">
          <Flex
            alignItems="center"
            justifyContent="center"
            w="56px"
            h="56px"
            bg="gray.900"
            borderRadius="full"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              bg: "gray.800",
              transform: "scale(1.05)"
            }}
          >
            <Icon as={FaBox} color="white" fontSize="20px" />
          </Flex>
          <Flex
            position="absolute"
            top="-2"
            right="-2"
            alignItems="center"
            justifyContent="center"
            w="18px"
            h="18px"
            bg="red.500"
            borderRadius="full"
            border="2px solid white"
          >
            <Text fontSize="10px" fontWeight="600" color="white">{cartQty}</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default ExploreTab;

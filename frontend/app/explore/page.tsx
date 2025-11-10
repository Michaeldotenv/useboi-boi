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
import Wrapper from "../components/Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../components/EmptyState";
import { useCartStore } from "@/lib/cartStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";

const ExplorePage: React.FC = () => {
  const router = useRouter();
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
      "/food-carousel.png"
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
      <Box minH="100vh" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Box bg="white" w="100%" py={4} borderBottom="1px solid" borderColor="gray.200">
          <Wrapper>
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <HStack spacing={1}>
                <Text fontSize="15px" fontWeight="400" color="gray.700">
                  University of Ibadan
                </Text>
                <Box as="span" color="gray.500" fontSize="12px">▼</Box>
              </HStack>
              <Icon as={FaBell} color="gray.600" fontSize="20px" />
            </Flex>
            <InputGroup>
              <InputLeftElement pointerEvents="none" h="44px">
                <SearchIcon ml="10px" width="18px" h="18px" color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search stores and items..."
                width="100%"
                fontSize="17px"
                bg="gray.50"
                fontWeight="400"
                h="44px"
                borderRadius="10px"
                color="gray.900"
                _placeholder={{ color: "gray.500" }}
                border="1px solid"
                borderColor="gray.200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Wrapper>
        </Box>
        <Wrapper>
          <Box py={4}>
            <VStack spacing={4} align="stretch">
              <Spinner size="lg" mx="auto" mt={8} />
              <Text textAlign="center" color="gray.500">Loading stores...</Text>
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      pb="calc(env(safe-area-inset-bottom, 0px) + 80px)"
    >
      {/* Header Section */}
      <Box 
        bg="white" 
        w="100%" 
        py={6}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Wrapper>
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <HStack spacing={3}>
              <Text fontSize="18px" fontWeight="600" color="gray.900">
                University of Ibadan
              </Text>
              <Box 
                as="span" 
                color="gray.500" 
                fontSize="12px"
              >
                ▼
              </Box>
            </HStack>
            <Box
              p={2}
              borderRadius="8px"
              bg="gray.50"
              transition="all 0.2s ease"
              _hover={{
                bg: "gray.100",
              }}
              cursor="pointer"
            >
              <Icon as={FaBell} color="gray.600" fontSize="18px" />
            </Box>
          </Flex>

          <InputGroup>
            <InputLeftElement pointerEvents="none" h="48px">
              <SearchIcon ml="12px" width="18px" h="18px" color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search stores and items..."
              width="100%"
              fontSize="16px"
              bg="gray.50"
              fontWeight="400"
              h="48px"
              borderRadius="12px"
              border="1px solid"
              borderColor="gray.200"
              color="gray.900"
              _placeholder={{ color: "gray.500" }}
              _focus={{ 
                borderColor: "gray.300",
                bg: "white"
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Wrapper>
      </Box>

      <Wrapper>
        {/* Content Section */}
        <Box py={4}>
          {/* Category Grid */}
          <Grid templateColumns={{ base: "repeat(3, 1fr)", sm: "repeat(4, 1fr)" }} gap={4} mb={8}>
            {["Grocery", "Supermarket", "Restaurant", "Send package", "Market runs", "More"].map(
              (label, idx) => (
                <VStack
                  key={idx}
                  bg="white"
                  borderRadius="12px"
                  py={4}
                  spacing={3}
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: "gray.300",
                    transform: "translateY(-2px)"
                  }}
                >
                  <Box w="36px" h="36px" bg="gray.100" borderRadius="8px" />
                  <Text fontSize="12px" color="gray.700" fontWeight="500" textAlign="center">
                    {label}
                  </Text>
                </VStack>
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
              iconType="orders"
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
                      <Box
                        w="100%"
                        h="140px"
                        borderRadius="12px"
                        bgImage={getStoreImage(v)}
                        bgSize="cover"
                        bgPosition="center"
                        position="relative"
                      >
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
                      </Box>
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
              <Flex justify="center" gap={2} mt={4}>
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
              iconType="location"
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
                        <Box
                          w="100%"
                          h="110px"
                          bgImage={getStoreImage(v)}
                          bgSize="cover"
                          bgPosition="center"
                        />
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
              iconType="deals"
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
                          <Box
                            w="100%"
                            h="160px"
                            bgImage={getStoreImage(v)}
                            bgSize="cover"
                            bgPosition="center"
                            position="relative"
                            overflow="hidden"
                          >
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
                          </Box>
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
              iconType="stores"
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
                    bgImage={getStoreImage(v)}
                    bgSize="cover"
                    bgPosition="center"
                    mb={2}
                  />
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
      {cartQty > 0 && (
        <Box position="fixed" bottom="80px" right="4" zIndex={50} onClick={() => router.push('/cart')} cursor="pointer">
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
      )}
    </Box>
  );
};

export default ExplorePage;
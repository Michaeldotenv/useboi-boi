"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Box, Heading, Text, VStack, HStack, Badge, Input, InputGroup, InputLeftElement, Flex, Button, Icon, Image, SimpleGrid, Card, Skeleton } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaBell, FaArrowLeft } from "react-icons/fa";
import { FiStar, FiShoppingCart, FiEye, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import Wrapper from "../../../../components/Wrapper";

export default function StoreItemsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(8);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  // Handle loading more items
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setVisibleItemsCount(prev => prev + 8);
    setIsLoadingMore(false);
  };

  // Handle showing less items
  const handleShowLess = () => {
    setVisibleItemsCount(8);
  };

  // Reset visible items count when filters change
  useEffect(() => {
    setVisibleItemsCount(8);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor-items", params.id],
    queryFn: () => api.vendorItems(params.id),
    enabled: Boolean(params.id),
  });

  // Memoize items to prevent unnecessary re-renders
  const items = useMemo(() => (data as any)?.data || data || [], [data]);

  // Map category IDs to readable names
  const getCategoryName = (item: any): string => {
    // Check if category is already a readable string
    if (typeof item.category === 'string' && !item.category.match(/^[0-9a-f]{24}$/i)) {
      return item.category;
    }
    
    // Check for category name field
    if (item.categoryName) {
      return item.categoryName;
    }
    
    // Check for category object with name
    if (item.category && typeof item.category === 'object' && item.category.name) {
      return item.category.name;
    }
    
    // Default fallback categories based on common patterns
    const categoryMap: { [key: string]: string } = {
      '67d582619dfc3452b04e4c77': 'Restaurant',
      '68035daf79fd624e59299358': 'Grocery',
      '68035dd9f2c01460883c9e14': 'Supermarket',
      // Add more mappings as needed
    };
    
    if (item.category && categoryMap[item.category]) {
      return categoryMap[item.category];
    }
    
    // Final fallback
    return 'Item';
  };

  // Extract unique categories from items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item: any) => {
      const categoryName = getCategoryName(item);
      if (categoryName && categoryName.trim()) {
        cats.add(categoryName);
      }
    });
    return Array.from(cats).sort();
  }, [items]);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]); // Set first category as default
    }
  }, [categories, selectedCategory]);

  // Use backend-provided item images (e.g., imgbb URLs) when data is ready
  useEffect(() => {
    if (items.length > 0) {
      const imageMap: { [key: string]: string } = {};
      items.forEach((item: any) => {
        const id = item.id || item._id;
        const img = item.image || item.Image; // prefer backend image if present
        if (id && typeof img === 'string' && img.trim()) {
          imageMap[id] = img;
        }
      });
      setProductImages(imageMap);

      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [items]);

  // Get price ranges for filtering
  const priceRanges = useMemo(() => {
    if (items.length === 0) return [];
    const prices = items.map((item: any) => item.price || 0).filter((price: number) => price > 0);
    if (prices.length === 0) return [];

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const mid = (min + max) / 2;

    return [
      { label: "Under ₦1,000", value: "under-1000", min: 0, max: 1000 },
      { label: "₦1,000 - ₦5,000", value: "1000-5000", min: 1000, max: 5000 },
      { label: "₦5,000 - ₦10,000", value: "5000-10000", min: 5000, max: 10000 },
      { label: "Above ₦10,000", value: "above-10000", min: 10000, max: Infinity },
    ];
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Filter by category (only show items from selected category)
    if (selectedCategory) {
      filtered = filtered.filter((item: any) => getCategoryName(item) === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (getCategoryName(item).toLowerCase().includes(query)) ||
        (item.desc && item.desc.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (priceRange !== "all") {
      const range = priceRanges.find(r => r.value === priceRange);
      if (range) {
        filtered = filtered.filter((item: any) => {
          const price = item.price || 0;
          return price >= range.min && price <= range.max;
        });
      }
    }

    // Sort items
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "category":
          return getCategoryName(a).localeCompare(getCategoryName(b));
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, selectedCategory, searchQuery, sortBy, priceRange, priceRanges]);

  // Professional loading state
  if (isLoading) {
    return (
      <Box p={4}>
        <Flex align="center" justify="space-between" mb={6}>
          <Skeleton height="40px" width="150px" />
          <Skeleton height="20px" width="120px" />
        </Flex>

        {/* Filter Bar Skeleton */}
        <Card p={4} mb={6}>
          <VStack spacing={4} align="stretch">
            <Skeleton height="40px" width="100%" />
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i}>
                  <Skeleton height="16px" width="80px" mb={2} />
                  <Skeleton height="40px" width="100%" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Card>

        {/* Items Grid Skeleton */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} p={4} h="full">
              <VStack align="stretch" spacing={3} h="full">
                <Skeleton height="20px" width="80px" />
                <Skeleton height="20px" width="100%" />
                <Skeleton height="16px" width="90%" />
                <Skeleton height="16px" width="70%" />
                <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.100">
                  <Skeleton height="20px" width="80px" />
                  <Skeleton height="16px" width="60px" />
                </HStack>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (error) return <Box p={4}>Failed to load items</Box>;

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);
    } catch {
      return `₦${Number(value || 0).toLocaleString()}`;
    }
  };

  const clearFilters = () => {
    setSelectedCategory(categories.length > 0 ? categories[0] : "");
    setSearchQuery("");
    setSortBy("name");
    setPriceRange("all");
  };

  return (
    <Box bg="#F2F2F7" minH="100vh">
      {/* Header */}
      <Box bg="#6C3FE8" w="100%" py={3}>
        <Wrapper>
          <Flex justifyContent="space-between" alignItems="center">
            <HStack spacing={3}>
              <Icon
                as={FaArrowLeft}
                color="#fff"
                fontSize="18px"
                cursor="pointer"
                onClick={() => router.back()}
              />
              <Text fontSize="15px" fontWeight="600" color="#fff">
                Store Items
              </Text>
            </HStack>
            <Text color="whiteAlpha.900" fontSize="13px">
              {filteredAndSortedItems.length} items
            </Text>
          </Flex>
        </Wrapper>
      </Box>

      <Wrapper>
        {/* Content Section */}
        <Box py={4}>
          {/* Filter Bar */}
          <Box bg="white" borderRadius="8px" p={3} border="1px solid" borderColor="gray.100" mb={4}>
            <HStack spacing={2} overflowX="auto" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "solid" : "outline"}
                  bg={selectedCategory === cat ? "#6C3FE8" : "transparent"}
                  color={selectedCategory === cat ? "white" : "#000"}
                  borderColor={selectedCategory === cat ? "#6C3FE8" : "#E2E8F0"}
                  borderRadius="full"
                  px={4}
                  fontSize="12px"
                  fontWeight="500"
                  onClick={() => setSelectedCategory(cat)}
                  _hover={{
                    bg: selectedCategory === cat ? "#5a2cc7" : "#F7FAFC"
                  }}
                  flexShrink={0}
                >
                  {cat}
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Search Bar */}
          <Box bg="white" borderRadius="8px" p={3} border="1px solid" borderColor="gray.100" mb={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                border="none"
                _focus={{ boxShadow: "none" }}
              />
            </InputGroup>
          </Box>

          {/* Results */}
          {items.length === 0 ? (
            <Box bg="white" borderRadius="12px" p={6} textAlign="center" boxShadow="0px 0px 2px rgba(0,0,0,0.1)">
              <Text color="#8E8E93" fontSize="14px">No items found in this store.</Text>
            </Box>
          ) : filteredAndSortedItems.length === 0 ? (
            <Box bg="white" borderRadius="12px" p={6} textAlign="center" boxShadow="0px 0px 2px rgba(0,0,0,0.1)">
              <Text color="#8E8E93" fontSize="14px" mb={2}>
                {selectedCategory ? `No items found in "${selectedCategory}" category.` : "No items match your search."}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                color="#6C3FE8"
                _hover={{ bg: "#f7f3ff" }}
              >
                Clear filters
              </Button>
            </Box>
          ) : (
            <VStack align="stretch" spacing={3}>
            {filteredAndSortedItems.slice(0, visibleItemsCount).map((it: any, index: number) => (
              <motion.div
                key={it.id || it._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5 + (index * 0.1)
                }}
              >
                <Card
                  p={0}
                  h="full"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    borderColor: "#6B2A8F"
                  }}
                  cursor="pointer"
                  overflow="hidden"
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="gray.100"
                  bg="white"
                >
                  {/* Product Image */}
                  <Box position="relative" h="140px" overflow="hidden">
                    {productImages[it.id || it._id] ? (
                      <Image
                        src={productImages[it.id || it._id]}
                        alt={it.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        w="full"
                        h="full"
                        bg="#6B2A8F"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiShoppingCart} boxSize={7} color="white" opacity={0.35} />
                      </Box>
                    )}

                    {/* Category Badge */}
                    {it.category && (
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        bg="#6C3FE8"
                        color="white"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontWeight="600"
                      >
                        {getCategoryName(it)}
                      </Badge>
                    )}

                    {/* Quick Actions */}
                    <HStack
                      position="absolute"
                      top={2}
                      right={2}
                      spacing={1}
                      opacity={0}
                      transition="opacity 0.3s ease"
                      _groupHover={{ opacity: 1 }}
                    >
                      <Button
                        size="sm"
                        borderRadius="full"
                        bg="white"
                        color="gray.600"
                        _hover={{ bg: "gray.50", color: "#6C3FE8" }}
                        p={2}
                      >
                        <Icon as={FiEye} boxSize={3} />
                      </Button>
                      <Button
                        size="sm"
                        borderRadius="full"
                        bg="white"
                        color="gray.600"
                        _hover={{ bg: "gray.50", color: "#6C3FE8" }}
                        p={2}
                      >
                        <Icon as={FiShoppingCart} boxSize={3} />
                      </Button>
                    </HStack>
                  </Box>

                  {/* Product Info */}
                  <Box p={4}>
                    <VStack align="stretch" spacing={3}>
                      <Text
                        fontWeight={700}
                        color="#111"
                        fontSize="md"
                        noOfLines={2}
                        minH="2.5em"
                      >
                        {it.name}
                      </Text>

                      {it.desc && (
                        <Text
                          color="#718096"
                          fontSize="sm"
                          noOfLines={2}
                          flex={1}
                        >
                          {it.desc}
                        </Text>
                      )}

                      {/* Rating */}
                      <HStack spacing={1}>
                        <Icon as={FiStar} color="yellow.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.600">
                          4.5 (128 reviews)
                        </Text>
                      </HStack>

                      <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.100">
                        <Text
                          fontWeight={700}
                          color="#6C3FE8"
                          fontSize="lg"
                        >
                          {formatCurrency(it.price)}
                        </Text>
                        {it.currentInventory !== undefined && (
                          <Badge
                            colorScheme={it.currentInventory > 10 ? "green" : it.currentInventory > 0 ? "orange" : "red"}
                            fontSize="xs"
                          >
                            {it.currentInventory} in stock
                          </Badge>
                        )}
                      </HStack>

                      {/* Add to Cart Button */}
                      <Button
                        w="full"
                        bg="#6C3FE8"
                        color="white"
                        size="sm"
                        borderRadius="8px"
                        leftIcon={<Icon as={FiShoppingCart} />}
                        _hover={{
                          bg: "#5a2cc7",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(108, 63, 232, 0.3)"
                        }}
                        transition="all 0.2s ease"
                      >
                        Add to Cart
                      </Button>
                    </VStack>
                  </Box>
                </Card>
              </motion.div>
            ))}
            </VStack>
          )}

          {/* Load More / Show Less Buttons */}
          {filteredAndSortedItems.length > visibleItemsCount && (
            <Box mt={8} textAlign="center">
              <Button
                size="lg"
                bg="#6C3FE8"
                color="white"
                borderRadius="16px"
                px={8}
                py={6}
                fontSize="md"
                fontWeight="600"
                boxShadow="0 8px 24px rgba(108, 63, 232, 0.3)"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(108, 63, 232, 0.4)",
                  bg: "#5a2cc7"
                }}
                _active={{
                  transform: "translateY(0px)"
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                isLoading={isLoadingMore}
                loadingText="Loading more items..."
                leftIcon={
                  isLoadingMore ? undefined : (
                    <Icon as={FiEye} boxSize={5} />
                  )
                }
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : `View More Items (${filteredAndSortedItems.length - visibleItemsCount} remaining)`}
              </Button>
            </Box>
          )}

          {visibleItemsCount > 8 && filteredAndSortedItems.length > 8 && (
            <Box mt={6} textAlign="center">
              <Button
                variant="outline"
                size="md"
                color="gray.600"
                borderColor="gray.300"
                borderRadius="12px"
                px={6}
                py={3}
                fontSize="sm"
                fontWeight="500"
                _hover={{
                  borderColor: "gray.400",
                  color: "gray.700",
                  bg: "gray.50",
                  transform: "translateY(-1px)"
                }}
                transition="all 0.2s ease"
                onClick={handleShowLess}
              >
                Show Less
              </Button>
            </Box>
          )}
        </Box>

        <Box mb={"5em"} />
      </Wrapper>
    </Box>
  );
}



  // H
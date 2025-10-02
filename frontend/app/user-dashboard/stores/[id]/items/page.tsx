"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
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
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [isCatHovered, setIsCatHovered] = useState<boolean>(false);
  const catRef = useRef<HTMLDivElement>(null);
  let catTouchStartX = 0;

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

  // Auto-slide categories horizontally
  useEffect(() => {
    if (!categories || categories.length <= 3 || isCatHovered) return;
    const id = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(id);
  }, [categories, isCatHovered]);

  const handleCatTouchStart = (e: React.TouchEvent) => {
    catTouchStartX = e.touches[0].clientX;
  };
  const handleCatTouchMove = (e: React.TouchEvent) => {
    const touchEndX = e.touches[0].clientX;
    const diff = catTouchStartX - touchEndX;
    if (diff > 40) {
      setCategoryIndex((prev) => (prev + 1) % categories.length);
      catTouchStartX = touchEndX;
    } else if (diff < -40) {
      setCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
      catTouchStartX = touchEndX;
    }
  };

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
            <Box
              ref={catRef}
              onMouseEnter={() => setIsCatHovered(true)}
              onMouseLeave={() => setIsCatHovered(false)}
              onTouchStart={handleCatTouchStart}
              onTouchMove={handleCatTouchMove}
              overflow="hidden"
              w="100%"
            >
              <Box display="flex" transition="transform 0.35s ease" style={{ transform: `translateX(-${categoryIndex * 88}px)` }}>
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
                    mr={2}
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
              </Box>
            </Box>
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
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 18 }}
                transition={{ duration: 0.45, delay: 0.3 + (index * 0.06) }}
              >
                <Card
                  p={0}
                  h="full"
                  borderRadius="20px"
                  border="none"
                  background="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
                  boxShadow="0 8px 25px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-4px) scale(1.02)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                    background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)"
                  }}
                  cursor="pointer"
                  overflow="hidden"
                  position="relative"
                >
                  {/* Subtle gradient overlay */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="linear-gradient(135deg, rgba(108, 63, 232, 0.02) 0%, rgba(107, 42, 143, 0.01) 100%)"
                    pointerEvents="none"
                    zIndex={0}
                  />

                  <Flex gap={4} p={4} align="stretch" position="relative" zIndex={1}>
                    {/* Enhanced Thumbnail */}
                    <Box
                      w={{ base: "110px", sm: "120px" }}
                      h={{ base: "90px", sm: "96px" }}
                      borderRadius="16px"
                      overflow="hidden"
                      bg="linear-gradient(135deg, #6B2A8F 0%, #8B5CF6 100%)"
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                    >
                      {productImages[it.id || it._id] ? (
                        <Image
                          src={productImages[it.id || it._id]}
                          alt={it.name}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.3s ease"
                          _hover={{ transform: "scale(1.05)" }}
                        />
                      ) : (
                        <Icon as={FiShoppingCart} boxSize={8} color="white" opacity={0.4} />
                      )}

                      {/* Subtle shine effect */}
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)"
                        pointerEvents="none"
                      />
                    </Box>

                    {/* Enhanced Content */}
                    <VStack align="stretch" spacing={2.5} flex={1} py={1}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={0.5} flex={1}>
                          <Text fontWeight={900} color="#0F172A" fontSize="md" noOfLines={1} lineHeight={1.2}>
                            {it.name}
                          </Text>
                          {it.currentInventory !== undefined && (
                            <Badge
                              colorScheme={it.currentInventory > 10 ? "green" : it.currentInventory > 0 ? "orange" : "red"}
                              fontSize="10px"
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontWeight={600}
                            >
                              {it.currentInventory} available
                            </Badge>
                          )}
                        </VStack>
                      </HStack>

                      {it.desc && (
                        <Text color="#64748B" fontSize="sm" noOfLines={1} lineHeight={1.3}>
                          {it.desc}
                        </Text>
                      )}

                      <HStack spacing={3}>
                        <HStack spacing={1}>
                          <Icon as={FiStar} color="#F59E0B" boxSize={4} />
                          <Text fontSize="xs" color="#374151" fontWeight={700}>4.5</Text>
                          <Text fontSize="xs" color="#9CA3AF">(128 reviews)</Text>
                        </HStack>
                        {it.category && (
                          <>
                            <Text fontSize="xs" color="#D1D5DB">•</Text>
                            <Text fontSize="xs" color="#6B7280" fontWeight={600}>{getCategoryName(it)}</Text>
                          </>
                        )}
                      </HStack>

                      <HStack justify="space-between" pt={1}>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight={900} color="#7C3AED" fontSize="lg" lineHeight={1}>
                            {formatCurrency(it.price)}
                          </Text>
                          <Text fontSize="xs" color="#9CA3AF" textDecoration="line-through">
                            {formatCurrency((it.price || 0) * 1.1)}
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          bg="linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)"
                          color="white"
                          borderRadius="12px"
                          px={4}
                          h="36px"
                          leftIcon={<Icon as={FiShoppingCart} />}
                          fontWeight={700}
                          fontSize="sm"
                          _hover={{
                            bg: "linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)"
                          }}
                          transition="all 0.2s ease"
                        >
                          Add to Cart
                        </Button>
                      </HStack>
                    </VStack>
                  </Flex>
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
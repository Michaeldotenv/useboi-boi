"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import { Box, Heading, Text, VStack, HStack, SimpleGrid, Badge, Select, Input, InputGroup, InputLeftElement, Flex, Spacer, Button, ButtonGroup, Fade, ScaleFade, SlideFade, useDisclosure, Skeleton, SkeletonText, Image, Icon } from "@chakra-ui/react";
import Card from "@/app/components/Card";
import Carousel from "@/app/components/Carousel";
import { useState, useMemo } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import { FiFilter, FiStar, FiShoppingCart, FiEye } from "react-icons/fi";
import { motion } from "framer-motion";
import { getRandomProductImage } from "@/lib/imageService";

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

  // Extract unique categories from items
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item: any) => {
      if (item.category && item.category.trim()) {
        cats.add(item.category);
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

  // Load product images when data is ready
  useEffect(() => {
    if (items.length > 0) {
      const loadImages = async () => {
        const imagePromises = items.map(async (item: any) => {
          try {
            const image = await getRandomProductImage(item.name, item.category || 'product');
            return {
              id: item.id || item._id,
              imageUrl: image?.urls?.regular || image?.urls?.small || null
            };
          } catch (error) {
            return {
              id: item.id || item._id,
              imageUrl: null
            };
          }
        });
        
        const images = await Promise.all(imagePromises);
        const imageMap: {[key: string]: string} = {};
        images.forEach(img => {
          if (img.imageUrl) {
            imageMap[img.id] = img.imageUrl;
          }
        });
        setProductImages(imageMap);
      };
      
      loadImages();
      
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
      filtered = filtered.filter((item: any) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
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
          return (a.category || "").localeCompare(b.category || "");
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
        <Card p={4} mb={6} hover={false}>
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
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <Flex align="center" justify="space-between" mb={6}>
          <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
            <Heading size="lg" color="text.primary">Store Items</Heading>
          </SlideFade>
          <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
            <Text color="text.secondary" fontSize="sm" fontWeight={500}>
              {filteredAndSortedItems.length} of {items.length} items
            </Text>
          </SlideFade>
        </Flex>
      </Fade>

      {/* Professional Filter Bar */}
      <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.3 } }}>
        <Card 
          p={4} 
          mb={6} 
          hover={false}
          transition="all 0.3s ease"
          _hover={{
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)"
          }}
        >
          <VStack spacing={4} align="stretch">
            {/* Search Bar */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search items by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              />
            </InputGroup>

          {/* Filter Controls */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            {/* Category Filter */}
            <Box>
              <Text fontSize="sm" fontWeight={600} color="text.secondary" mb={2}>
                Category
              </Text>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                bg="white"
                placeholder="Select category..."
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </Box>

            {/* Price Range Filter */}
            <Box>
              <Text fontSize="sm" fontWeight={600} color="text.secondary" mb={2}>
                Price Range
              </Text>
              <Select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                bg="white"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              >
                <option value="all">All Prices</option>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </Select>
            </Box>

            {/* Sort Options */}
            <Box>
              <Text fontSize="sm" fontWeight={600} color="text.secondary" mb={2}>
                Sort By
              </Text>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                bg="white"
                transition="all 0.2s ease"
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                }}
                _hover={{
                  borderColor: "gray.300"
                }}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="category">Category</option>
              </Select>
            </Box>

            {/* Clear Filters */}
            <Box>
              <Text fontSize="sm" fontWeight={600} color="text.secondary" mb={2}>
                Actions
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                leftIcon={<FiFilter />}
                w="full"
                transition="all 0.2s ease"
                _hover={{
                  bg: "gray.50",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                }}
                _active={{
                  transform: "translateY(0)"
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </SimpleGrid>
        </VStack>
      </Card>
      </ScaleFade>

      {/* Results */}
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6, delay: 0.4 } }}>
        {items.length === 0 ? (
          <ScaleFade in={isLoaded} initialScale={0.9}>
            <Card p={8} textAlign="center" hover={false}>
              <Text color="text.secondary" fontSize="lg">No items found in this store.</Text>
            </Card>
          </ScaleFade>
        ) : filteredAndSortedItems.length === 0 ? (
          <ScaleFade in={isLoaded} initialScale={0.9}>
            <Card p={8} textAlign="center" hover={false}>
              <Text color="text.secondary" fontSize="lg">
                {selectedCategory ? `No items found in "${selectedCategory}" category.` : "No items match your current filters."}
              </Text>
              <Button 
                variant="ghost" 
                size="sm" 
                mt={2} 
                onClick={clearFilters}
                transition="all 0.2s ease"
                _hover={{
                  bg: "gray.50",
                  transform: "translateY(-1px)"
                }}
              >
                Reset filters
              </Button>
            </Card>
          </ScaleFade>
        ) : (
          <Box>
            {/* Featured Items Carousel */}
            <Box mb={8}>
              <Heading size="md" color="text.primary" mb={4}>
                Featured Items
              </Heading>
              <Carousel
                items={filteredAndSortedItems.slice(0, 8).map((it: any) => ({
                  id: it.id || it._id,
                  title: it.name,
                  price: it.price,
                  category: it.category,
                  rating: 4.5,
                  image: productImages[it.id || it._id] || null,
                  content: null
                }))}
                variant="products"
                itemsPerView={4}
                spacing={4}
                showArrows={true}
                showDots={true}
                autoPlay={true}
                autoPlayInterval={4000}
                loading={!isLoaded}
                onItemClick={(item) => {
                  // Handle item click - could open modal or navigate to details
                  console.log('Item clicked:', item);
                }}
              />
            </Box>

            {/* All Items Grid */}
            <Box>
              <HStack justify="space-between" align="center" mb={6}>
                <Heading size="md" color="text.primary">
                  All Items ({filteredAndSortedItems.length})
                </Heading>
                {filteredAndSortedItems.length > visibleItemsCount && (
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                    Showing {Math.min(visibleItemsCount, filteredAndSortedItems.length)} of {filteredAndSortedItems.length}
                  </Badge>
                )}
              </HStack>
              
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
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
                        borderColor: "brand.primary"
                      }}
                      cursor="pointer"
                      overflow="hidden"
                      borderRadius="16px"
                      border="1px solid"
                      borderColor="gray.100"
                      bg="white"
                    >
                      {/* Product Image */}
                      <Box position="relative" h="200px" overflow="hidden">
                        {productImages[it.id || it._id] ? (
                          <Image
                            src={productImages[it.id || it._id]}
                            alt={it.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                            transition="transform 0.3s ease"
                            _groupHover={{
                              transform: "scale(1.05)"
                            }}
                          />
                        ) : (
                          <Box
                            w="full"
                            h="full"
                            bg="linear-gradient(135deg, brand.primary, brand.primaryLight)"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon as={FiShoppingCart} boxSize={8} color="white" opacity={0.3} />
                          </Box>
                        )}
                        
                        {/* Category Badge */}
                        {it.category && (
                          <Badge
                            position="absolute"
                            top={2}
                            left={2}
                            bg="brand.primary"
                            color="white"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontWeight="600"
                          >
                            {it.category}
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
                            _hover={{ bg: "gray.50", color: "brand.primary" }}
                            p={2}
                          >
                            <Icon as={FiEye} boxSize={3} />
                          </Button>
                          <Button
                            size="sm"
                            borderRadius="full"
                            bg="white"
                            color="gray.600"
                            _hover={{ bg: "gray.50", color: "brand.primary" }}
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
                            color="text.primary" 
                            fontSize="md" 
                            noOfLines={2}
                            minH="2.5em"
                          >
                            {it.name}
                          </Text>
                          
                          {it.desc && (
                            <Text 
                              color="text.secondary" 
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
                              color="brand.primary" 
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
                            bg="brand.primary"
                            color="white"
                            size="sm"
                            borderRadius="8px"
                            leftIcon={<Icon as={FiShoppingCart} />}
                            _hover={{
                              bg: "brand.primaryDark",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(82, 52, 229, 0.3)"
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
              </SimpleGrid>
              
              {/* View More Button */}
              {filteredAndSortedItems.length > visibleItemsCount && (
                <Box mt={8} textAlign="center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Button
                      size="lg"
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      color="white"
                      borderRadius="16px"
                      px={8}
                      py={6}
                      fontSize="md"
                      fontWeight="600"
                      boxShadow="0 8px 24px rgba(102, 126, 234, 0.3)"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
                        bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
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
                  </motion.div>
                  
                  {/* Progress indicator */}
                  {filteredAndSortedItems.length > visibleItemsCount && (
                    <Box mt={4}>
                      <Text color="gray.500" fontSize="sm" mb={2}>
                        Progress
                      </Text>
                      <Box
                        w="200px"
                        h="4px"
                        bg="gray.200"
                        borderRadius="full"
                        mx="auto"
                        overflow="hidden"
                      >
                        <Box
                          h="full"
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          borderRadius="full"
                          w={`${(visibleItemsCount / filteredAndSortedItems.length) * 100}%`}
                          transition="width 0.5s ease"
                        />
                      </Box>
                      <Text color="gray.600" fontSize="xs" mt={1}>
                        {Math.round((visibleItemsCount / filteredAndSortedItems.length) * 100)}% loaded
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Show Less Button */}
              {visibleItemsCount > 8 && filteredAndSortedItems.length > 8 && (
                <Box mt={6} textAlign="center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
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
                  </motion.div>
                </Box>
              )}

              {/* Show completion message when all items are loaded */}
              {filteredAndSortedItems.length <= visibleItemsCount && filteredAndSortedItems.length > 8 && (
                <Box mt={8} textAlign="center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Card variant="elevated" p={6} bg="green.50" border="1px solid" borderColor="green.200" borderRadius="16px">
                      <VStack spacing={3}>
                        <Box bg="green.100" p={3} borderRadius="full">
                          <Icon as={FiEye} boxSize={6} color="green.600" />
                        </Box>
                        <Text color="green.800" fontSize="lg" fontWeight="600">
                          All items loaded! 🎉
                        </Text>
                        <Text color="green.600" fontSize="sm" textAlign="center">
                          You've seen all {filteredAndSortedItems.length} items in this store
                        </Text>
                      </VStack>
                    </Card>
                  </motion.div>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Fade>
    </Box>
  );
}



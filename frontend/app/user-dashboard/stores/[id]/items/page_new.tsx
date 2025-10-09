"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Box, Heading, Text, VStack, HStack, Badge, Input, InputGroup, InputLeftElement, Flex, Button, Icon, Image, useToast } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaBell, FaArrowLeft } from "react-icons/fa";
import { FiStar, FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/lib/cartStore";

export default function StoreItemsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor-items", params.id],
    queryFn: () => api.vendorItems(params.id),
    enabled: Boolean(params.id),
  });

  const items = useMemo(() => (data as any)?.data || data || [], [data]);
  const [productImages, setProductImages] = useState<{[key: string]: string}>({});

  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach((item: any) => {
      if (item.category && item.category.trim()) {
        cats.add(item.category);
      }
    });
    return Array.from(cats).sort();
  }, [items]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory) {
      filtered = filtered.filter((item: any) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.desc && item.desc.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  useEffect(() => {
    if (items.length > 0) {
      const imageMap: { [key: string]: string } = {};
      items.forEach((item: any) => {
        const id = item.id || item._id;
        const img = item.image || item.Image;
        if (id && typeof img === 'string' && img.trim()) {
          imageMap[id] = img;
        }
      });
      setProductImages(imageMap);
    }
  }, [items]);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);
    } catch {
      return `₦${Number(value || 0).toLocaleString()}`;
    }
  };

  if (isLoading) {
    return (
      <Box bg="#F2F2F7" minH="100vh" p={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (error) return <Box p={4}>Failed to load items</Box>;

  return (
    <Box bg="#F2F2F7" minH="100vh">
      {/* Header */}
      <Box bg="#6B2A8F" position="relative" w="100%" pt={4} pb={6}>
        <Box maxW="7xl" mx="auto" px={4}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
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
              {filteredItems.length} items
            </Text>
          </Flex>
        </Box>
      </Box>

      <Box maxW="7xl" mx="auto" px={4} mt={-4}>
        {/* Category Filter */}
        <Box bg="white" borderRadius="12px" p={3} boxShadow="0px 0px 2px rgba(0,0,0,0.1)" mb={4}>
          <HStack spacing={2} overflowX="auto" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "solid" : "outline"}
                bg={selectedCategory === cat ? "#6B2A8F" : "transparent"}
                color={selectedCategory === cat ? "white" : "#000"}
                borderColor={selectedCategory === cat ? "#6B2A8F" : "#E2E8F0"}
                borderRadius="full"
                px={4}
                fontSize="12px"
                fontWeight="500"
                onClick={() => setSelectedCategory(cat)}
                _hover={{
                  bg: selectedCategory === cat ? "#5a2379" : "#F7FAFC"
                }}
                flexShrink={0}
              >
                {cat}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Search Bar */}
        <Box bg="white" borderRadius="12px" p={3} boxShadow="0px 0px 2px rgba(0,0,0,0.1)" mb={4}>
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

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <Box bg="white" borderRadius="12px" p={6} textAlign="center" boxShadow="0px 0px 2px rgba(0,0,0,0.1)">
            <Text color="#8E8E93" fontSize="14px">
              {searchQuery ? "No items match your search." : `No items found in "${selectedCategory}" category.`}
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={3}>
            {filteredItems.map((it: any, index: number) => (
              <Box
                key={it.id || it._id}
                bg="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
                borderRadius="20px"
                overflow="hidden"
                border="none"
                boxShadow="0 8px 25px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
                cursor="pointer"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-4px) scale(1.02)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                  bg: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)"
                }}
                position="relative"
              >
                {/* Subtle gradient overlay */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="linear-gradient(135deg, rgba(107, 42, 143, 0.02) 0%, rgba(124, 58, 237, 0.01) 100%)"
                  pointerEvents="none"
                  zIndex={0}
                />

                <Flex gap={4} p={4} align="stretch" position="relative" zIndex={1}>
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

                  <VStack align="stretch" spacing={2.5} flex={1} py={1}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={0.5} flex={1}>
                        <Heading size="sm" color="#0F172A" fontWeight={900} noOfLines={1} lineHeight={1.2}>
                          {it.name}
                        </Heading>
                        {typeof it.currentInventory === 'number' && (
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
                          <Text fontSize="xs" color="#6B7280" fontWeight={600}>{it.category}</Text>
                        </>
                      )}
                    </HStack>

                    <HStack justify="space-between" pt={1}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight={900} color="#3B174F" fontSize="lg" lineHeight={1}>
                          {formatCurrency(it.price)}
                        </Text>
                        <Text fontSize="xs" color="#9CA3AF" textDecoration="line-through">
                          {formatCurrency((it.price || 0) * 1.1)}
                        </Text>
                      </VStack>
                      <Button
                        size="sm"
                        bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"
                        color="white"
                        borderRadius="12px"
                        px={4}
                        h="36px"
                        leftIcon={<Icon as={FiShoppingCart} />}
                        fontWeight={700}
                        fontSize="sm"
                        _hover={{
                          bg: "linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 8px 20px rgba(124, 58, 237, 0.3)"
                        }}
                        transition="all 0.2s ease"
                        onClick={async () => {
                          try {
                            const vendorId = (params?.id as string) || "";
                            await useCartStore.getState().addItem({
                              id: it._id || it.id,
                              vendorId: vendorId,
                              name: it.name || it.title || 'Item',
                              price: Number(it.price || 0),
                              image: it.image || it.coverImage,
                            }, 1);
                            toast({ title: 'Added to cart', description: (it.name || 'Item') + ' added', status: 'success', duration: 1500 });
                          } catch (error) {
                            console.error('Failed to add to cart:', error);
                            toast({ title: 'Failed to add to cart', description: 'Please try again', status: 'error', duration: 2000 });
                          }
                        }}
                      >
                        Add to Cart
                      </Button>
                    </HStack>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}

        <Box mb="5em" />
      </Box>
    </Box>
  );
}

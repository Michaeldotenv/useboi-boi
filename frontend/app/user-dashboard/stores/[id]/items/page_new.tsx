"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import { Box, Heading, Text, VStack, HStack, Badge, Input, InputGroup, InputLeftElement, Flex, Button, Icon, Image } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaBell, FaArrowLeft } from "react-icons/fa";
import { FiStar, FiShoppingCart } from "react-icons/fi";

export default function StoreItemsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
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
            {filteredItems.map((it: any) => (
              <Box
                key={it.id || it._id}
                bg="white"
                borderRadius="12px"
                overflow="hidden"
                boxShadow="0px 0px 2px rgba(0,0,0,0.1)"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" }}
              >
                <Flex gap={3} p={3}>
                  {/* Item Image */}
                  <Box
                    w="100px"
                    h="100px"
                    borderRadius="8px"
                    bg="linear-gradient(135deg, #6B2A8F 0%, #8a46b5 100%)"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiShoppingCart} boxSize={8} color="white" opacity={0.6} />
                  </Box>
                  
                  {/* Item Info */}
                  <Box flex={1}>
                    <Heading size="sm" color="#000" fontWeight="600" mb={1} noOfLines={1}>
                      {it.name}
                    </Heading>
                    {it.desc && (
                      <Text fontSize="11px" color="#8E8E93" mb={2} noOfLines={2}>
                        {it.desc}
                      </Text>
                    )}
                    
                    <HStack spacing={2} mb={2}>
                      <HStack spacing={0.5}>
                        <Icon as={FiStar} color="yellow.400" boxSize={3} />
                        <Text fontSize="11px" fontWeight="600" color="#000">4.5</Text>
                      </HStack>
                      {it.category && (
                        <>
                          <Text fontSize="11px" color="#8E8E93">•</Text>
                          <Text fontSize="11px" color="#8E8E93">{it.category}</Text>
                        </>
                      )}
                      {it.currentInventory !== undefined && (
                        <>
                          <Text fontSize="11px" color="#8E8E93">•</Text>
                          <Badge 
                            colorScheme={it.currentInventory > 10 ? "green" : it.currentInventory > 0 ? "orange" : "red"}
                            fontSize="9px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                          >
                            {it.currentInventory} left
                          </Badge>
                        </>
                      )}
                    </HStack>
                    
                    <Text fontSize="16px" fontWeight="700" color="#6B2A8F">
                      {formatCurrency(it.price)}
                    </Text>
                  </Box>
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

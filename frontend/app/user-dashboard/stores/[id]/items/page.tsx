"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getAuthToken } from "@/lib/auth";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Icon,
  Image,
  SimpleGrid,
  Skeleton,
  useToast,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FiArrowLeft, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/lib/cartStore";

export default function StoreItemsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { items: cartItems, addItem, increment, decrement, removeItem } = useCartStore();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-items", params.id],
    queryFn: () => api.vendorItems(params.id),
    enabled: Boolean(params.id),
  });

  const items = useMemo(() => (data as any)?.data || data || [], [data]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map((item: any) => item.category || "Other"));
    return ["all", ...Array.from(cats)];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch =
        !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find((i) => i.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id || item._id,
      vendorId: params.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });

    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleIncrement = (itemId: string) => {
    increment(itemId);
  };

  const handleDecrement = (itemId: string) => {
    const quantity = getItemQuantity(itemId);
    if (quantity === 1) {
      removeItem(itemId);
    } else {
      decrement(itemId);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <Box bg="#FAFAFA" minH="100vh">
        <Container maxW="7xl" py={6}>
          <Skeleton height="40px" width="200px" mb={6} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="300px" borderRadius="16px" />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Container maxW="6xl" py={3}>
          <Skeleton height="28px" width="150px" mb={3} />
          <Skeleton height="40px" mb={3} />
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} height="240px" borderRadius="10px" />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh" pb={24}>
      {/* Compact Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.100" position="sticky" top={0} zIndex={10} boxShadow="sm">
        <Container maxW="6xl" py={3}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={3}>
              <Icon
                as={FiArrowLeft}
                boxSize={5}
                color="gray.600"
                cursor="pointer"
                onClick={() => router.back()}
                _hover={{ color: "purple.600" }}
              />
              <Heading size="md" fontWeight="600" color="gray.900">
                Menu
              </Heading>
              <Text fontSize="xs" color="gray.500" ml="auto">
                {filteredItems.length} items
              </Text>
            </HStack>

            {/* Compact Search */}
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" boxSize={3.5} />
              </InputLeftElement>
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                borderRadius="8px"
                fontSize="sm"
                _focus={{ borderColor: "purple.400", bg: "white" }}
              />
            </InputGroup>

            {/* Compact Categories */}
            <HStack spacing={2} overflowX="auto" pb={1} css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}>
              {categories.map((cat) => {
                const categoryStr = String(cat);
                return (
                  <Button
                    key={categoryStr}
                    size="xs"
                    variant={selectedCategory === categoryStr ? "solid" : "outline"}
                    colorScheme={selectedCategory === categoryStr ? "purple" : "gray"}
                    borderRadius="md"
                    onClick={() => setSelectedCategory(categoryStr)}
                    flexShrink={0}
                    fontWeight="600"
                    px={3}
                  >
                    {categoryStr === "all" ? "All" : categoryStr}
                  </Button>
                );
              })}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Items Grid - Compact & Professional */}
      <Container maxW="6xl" py={3}>
        {filteredItems.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="md" color="gray.500">
              No items found
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
            {filteredItems.map((item: any) => {
              const itemId = item.id || item._id;
              const quantity = getItemQuantity(itemId);

              return (
                <Box
                  key={itemId}
                  bg="white"
                  borderRadius="10px"
                  overflow="hidden"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.100"
                  transition="all 0.2s"
                  _hover={{ boxShadow: "md", borderColor: "purple.200" }}
                >
                  {/* Item Image - Compact */}
                  <Box position="relative" h="120px" bg="gray.50">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex h="full" align="center" justify="center">
                        <Text fontSize="2xl">🍽️</Text>
                      </Flex>
                    )}
                    
                    {item.inStock === false && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="blackAlpha.600"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Badge colorScheme="red" fontSize="2xs" px={2} py={1}>
                          Out of Stock
                        </Badge>
                      </Box>
                    )}
                  </Box>

                  {/* Item Info - Compact */}
                  <Box p={2.5}>
                    <VStack align="stretch" spacing={2}>
                      <Heading size="xs" fontWeight="600" color="gray.900" noOfLines={1}>
                        {item.name}
                      </Heading>

                      {item.description && (
                        <Text fontSize="2xs" color="gray.600" noOfLines={2} h="28px">
                          {item.description}
                        </Text>
                      )}

                      <Flex justify="space-between" align="center" pt={1}>
                        <Text fontSize="sm" fontWeight="700" color="purple.600">
                          ₦{item.price?.toLocaleString()}
                        </Text>

                        {quantity === 0 ? (
                          <Button
                            size="xs"
                            colorScheme="purple"
                            onClick={() => handleAddToCart(item)}
                            isDisabled={item.inStock === false}
                            borderRadius="md"
                            fontWeight="600"
                            px={2.5}
                          >
                            <Icon as={FiPlus} boxSize={3} />
                          </Button>
                        ) : (
                          <HStack spacing={1}>
                            <Button
                              size="xs"
                              colorScheme="purple"
                              variant="outline"
                              onClick={() => handleDecrement(itemId)}
                              borderRadius="md"
                              minW="24px"
                              p={0}
                            >
                              <Icon as={FiMinus} boxSize={2.5} />
                            </Button>
                            <Text fontSize="xs" fontWeight="600" minW="20px" textAlign="center">
                              {quantity}
                            </Text>
                            <Button
                              size="xs"
                              colorScheme="purple"
                              onClick={() => handleIncrement(itemId)}
                              borderRadius="md"
                              minW="24px"
                              p={0}
                            >
                              <Icon as={FiPlus} boxSize={2.5} />
                            </Button>
                          </HStack>
                        )}
                      </Flex>
                    </VStack>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Container>

      {/* Compact Floating Cart Button */}
      {cartTotal > 0 && (
        <Box
          position="fixed"
          bottom={16}
          left={0}
          right={0}
          px={4}
          zIndex={20}
        >
          <Container maxW="6xl">
            <Button
              w="full"
              size="md"
              bg="purple.600"
              color="white"
              fontWeight="600"
              leftIcon={<Icon as={FiShoppingCart} boxSize={4} />}
              onClick={() => router.push("/user-dashboard?tab=cart")}
              borderRadius="10px"
              _hover={{ bg: "purple.700" }}
              boxShadow="lg"
            >
              View Cart ({cartTotal})
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
}

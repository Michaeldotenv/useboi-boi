"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Heading, Link, VStack, HStack, Text, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText, Avatar, Icon, Image, Badge, Flex, Spacer, Button } from "@chakra-ui/react";
import { FiArrowRight, FiStar, FiShoppingBag, FiMapPin, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import Card from "@/app/components/Card";
import { getRandomStoreImage } from "@/lib/imageService";

export default function StoresPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [storeImages, setStoreImages] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({ queryKey: ["vendors"], queryFn: api.vendors });

  // Load store images when data is ready
  useEffect(() => {
    if (!isLoading && data) {
      const vendors = (data as any)?.data || data || [];
      const loadImages = async () => {
        const imagePromises = vendors.map(async (vendor: any) => {
          try {
            const image = await getRandomStoreImage(vendor.name);
            return {
              id: vendor.id || vendor._id,
              imageUrl: image?.urls?.regular || image?.urls?.small || null
            };
          } catch (error) {
            return {
              id: vendor.id || vendor._id,
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
        setStoreImages(imageMap);
      };
      
      loadImages();
      
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Professional loading state
  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton height="30px" width="120px" mb={4} />
        <VStack align="stretch" spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} p={4}>
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Skeleton height="40px" width="40px" borderRadius="full" />
                  <VStack align="start" spacing={1}>
                    <Skeleton height="16px" width="180px" />
                    <Skeleton height="12px" width="120px" />
                  </VStack>
                </HStack>
                <Skeleton height="20px" width="80px" />
              </HStack>
            </Card>
          ))}
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load stores</Box>;

  const vendors = (data as any)?.data || data || [];
  return (
    <Box bg="gray.50" minH="100vh">
      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        py={12}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iODAiIHI9IjIiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSI2MCIgcj0iMSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQwIiByPSIxIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==')"
          bgRepeat="repeat"
        />
        
        <Box maxW="7xl" mx="auto" px={4} position="relative" zIndex={1}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <VStack spacing={6} textAlign="center">
              <Heading
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                fontWeight="800"
                color="white"
                textShadow="0 2px 4px rgba(0,0,0,0.1)"
              >
                Discover Amazing Food
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="white"
                opacity={0.9}
                maxW="600px"
              >
                Order from your favorite restaurants and get delicious food delivered right to your door
              </Text>
            </VStack>
          </motion.div>
        </Box>
      </Box>

      <Box maxW="7xl" mx="auto" px={4} py={8}>
        <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
          <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800" fontWeight="700">
                    Popular Restaurants
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {vendors.length} restaurants available in your area
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="purple"
                  rightIcon={<FiArrowRight />}
                >
                  View All
                </Button>
              </HStack>
            </VStack>
          </SlideFade>
        </Fade>
      
      {vendors.length === 0 ? (
        <ScaleFade in={isLoaded} initialScale={0.9} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
          <Card p={5} mt={3} textAlign="center" hover={false}>
            <Text color="text.secondary">No stores found.</Text>
          </Card>
        </ScaleFade>
      ) : (
        <VStack align="stretch" spacing={6} mt={6}>
          {vendors.map((v: any, index: number) => (
            <motion.div
              key={v.id || v._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2 + (index * 0.1) 
              }}
            >
              <Card 
                p={0}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)"
                }}
                overflow="hidden"
                borderRadius="24px"
                border="1px solid"
                borderColor="gray.200"
                bg="white"
                cursor="pointer"
                onClick={() => router.push(`/dashboard/stores/${v.id || v._id}/items`)}
              >
                <Box position="relative">
                  {/* Store Image */}
                  <Box
                    h="240px"
                    bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    position="relative"
                    overflow="hidden"
                  >
                    {storeImages[v.id || v._id] ? (
                      <Image
                        src={storeImages[v.id || v._id]}
                        alt={v.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                        transition="transform 0.4s ease"
                        _groupHover={{
                          transform: "scale(1.08)"
                        }}
                      />
                    ) : (
                      <Box
                        w="full"
                        h="full"
                        bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiShoppingBag} boxSize={16} color="white" opacity={0.4} />
                      </Box>
                    )}
                    
                    {/* Overlay Gradient */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))"
                    />
                    
                    {/* Status Badge */}
                    <Badge
                      position="absolute"
                      top={5}
                      right={5}
                      bg="green.500"
                      color="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      Open Now
                    </Badge>

                    {/* Rating Badge */}
                    <Badge
                      position="absolute"
                      top={5}
                      left={5}
                      bg="rgba(255, 255, 255, 0.9)"
                      color="gray.800"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="600"
                      backdropFilter="blur(10px)"
                    >
                      <HStack spacing={1}>
                        <Icon as={FiStar} color="yellow.400" boxSize={3} />
                        <Text>4.8</Text>
                      </HStack>
                    </Badge>
                  </Box>
                  
                  {/* Store Info */}
                  <Box p={6}>
                    <VStack align="stretch" spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Heading size="lg" color="gray.800" fontWeight="800">
                          {v.name}
                        </Heading>
                        <Text color="gray.600" fontSize="sm" noOfLines={2} lineHeight="1.5">
                          {v.description || "Delicious food delivered fresh to your door. Authentic flavors, fast delivery."}
                        </Text>
                      </VStack>
                      
                      {/* Store Details */}
                      <HStack spacing={6} w="full" justify="space-between">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={1}>
                            <Icon as={FiClock} color="orange.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                              25-35 min
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Delivery time
                          </Text>
                        </VStack>

                        <VStack align="start" spacing={1}>
                          <HStack spacing={1}>
                            <Icon as={FiMapPin} color="blue.500" boxSize={4} />
                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                              2.3 km
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Distance
                          </Text>
                        </VStack>

                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="600" color="gray.700">
                            ₦500
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Delivery fee
                          </Text>
                        </VStack>
                      </HStack>
                      
                      {/* Action Button */}
                      <Button
                        w="full"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        size="lg"
                        borderRadius="16px"
                        h="52px"
                        fontSize="md"
                        fontWeight="700"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                        }}
                        _active={{
                          transform: "translateY(0px)"
                        }}
                        rightIcon={<FiShoppingBag />}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        Order Now
                      </Button>
                    </VStack>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          ))}
        </VStack>
      )}
      </Box>
    </Box>
  );
}



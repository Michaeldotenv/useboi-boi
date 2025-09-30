"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Heading, Link, VStack, HStack, Text, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText, Avatar, Icon, Image, Badge, Flex, Spacer, Button } from "@chakra-ui/react";
import { FiArrowRight, FiStar, FiShoppingBag, FiMapPin, FiClock } from "react-icons/fi";
import { FaBell } from "react-icons/fa";
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
    <Box bg="#F2F2F7" minH="100vh">
      {/* Header Section */}
      <Box bg="#6B2A8F" position="relative" w="100%" pt={4} pb={6}>
        <Box maxW="7xl" mx="auto" px={4}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <HStack spacing={1}>
              <Text fontSize="15px" fontWeight="400" color="#fff">
                University of Ibadan
              </Text>
              <Box as="span" color="#fff" fontSize="12px">▼</Box>
            </HStack>
            <Icon as={FaBell} color="#fff" fontSize="20px" />
          </Flex>
          
          <Heading size="lg" color="white" fontWeight="700" mb={2}>
            Stores
          </Heading>
          <Text color="whiteAlpha.900" fontSize="sm">
            {vendors.length} stores available near you
          </Text>
        </Box>
      </Box>

      <Box maxW="7xl" mx="auto" px={4} mt={-4}>
        {vendors.length === 0 ? (
        <ScaleFade in={isLoaded} initialScale={0.9} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
          <Card p={5} mt={3} textAlign="center" hover={false}>
            <Text color="text.secondary">No stores found.</Text>
          </Card>
        </ScaleFade>
      ) : (
        <VStack align="stretch" spacing={6} mt={6}>
          {vendors.map((v: any, index: number) => (
            <Box
              key={v.id || v._id}
              bg="white"
              borderRadius="12px"
              overflow="hidden"
              boxShadow="0px 0px 2px rgba(0,0,0,0.1)"
              cursor="pointer"
              onClick={() => router.push(`/user-dashboard/stores/${v.id || v._id}`)}
              transition="all 0.2s"
              _hover={{ boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" }}
            >
              <Flex gap={3} p={3}>
                {/* Store Image */}
                <Box
                  w="100px"
                  h="100px"
                  borderRadius="8px"
                  bg="linear-gradient(135deg, #6B2A8F 0%, #8a46b5 100%)"
                  flexShrink={0}
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
                    />
                  ) : (
                    <Icon as={FiShoppingBag} boxSize={8} color="white" opacity={0.6} />
                  )}
                </Box>
                
                {/* Store Info */}
                <Box flex={1}>
                  <Heading size="sm" color="#000" fontWeight="600" mb={1} noOfLines={1}>
                    {v.name}
                  </Heading>
                  <Text fontSize="11px" color="#8E8E93" mb={2} noOfLines={1}>
                    {v.description || "Delicious food delivered fresh"}
                  </Text>
                  
                  <HStack spacing={2} mb={2}>
                    <HStack spacing={0.5}>
                      <Icon as={FiStar} color="yellow.400" boxSize={3} />
                      <Text fontSize="11px" fontWeight="600" color="#000">4.5</Text>
                    </HStack>
                    <Text fontSize="11px" color="#8E8E93">•</Text>
                    <Text fontSize="11px" color="#8E8E93">0.9km</Text>
                    <Text fontSize="11px" color="#8E8E93">•</Text>
                    <Badge colorScheme="green" fontSize="9px" px={2} py={0.5} borderRadius="full">Open</Badge>
                  </HStack>
                  
                  <Text fontSize="12px" fontWeight="600" color="#6B2A8F">
                    View Menu →
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



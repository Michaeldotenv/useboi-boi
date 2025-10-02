"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState, useRef } from "react";
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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  let touchStartX = 0;
  
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

  // Touch handlers for slider
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const vendors = (data as any)?.data || data || [];
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50 && activeIndex < vendors.length - 1) {
      setActiveIndex((prev) => prev + 1);
      touchStartX = touchEndX;
    } else if (diff < -50 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      touchStartX = touchEndX;
    }
  };

  // Auto-slide
  useEffect(() => {
    const vendors = (data as any)?.data || data || [];
    if (!vendors || vendors.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % vendors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [data, isHovered]);

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
        <Box position="relative" mt={4}>
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
              {vendors.map((v: any) => (
                <Box
                  key={v.id || v._id}
                  flex="0 0 100%"
                  px={1}
                  cursor="pointer"
                  onClick={() => router.push(`/user-dashboard/stores/${v.id || v._id}`)}
                >
                  <Box bg="white" borderRadius="12px" overflow="hidden" border="1px solid" borderColor="gray.200">
                    <Box
                      w="100%"
                      h="150px"
                      bgImage={`url(${(storeImages[v.id || v._id] || "").startsWith("/") ? (storeImages[v.id || v._id] || "") : "/" + (storeImages[v.id || v._id] || "Food-item-1.jpeg")})`}
                      bgSize="cover"
                      bgPosition="center"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(0,0,0,0.3), rgba(0,0,0,0.05))" />
                      <Badge position="absolute" bottom={2} left={2} colorScheme="green" borderRadius="full" px={2} py={0.5} fontSize="10px">Open</Badge>
                    </Box>
                    <Box p={3}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Box>
                          <Heading size="sm" color="#000" fontWeight="600" noOfLines={1}>
                            {v.name}
                          </Heading>
                          <Text fontSize="11px" color="#8E8E93" noOfLines={1}>
                            {v.description || "Delicious food delivered fresh"}
                          </Text>
                        </Box>
                        <HStack spacing={0.5}>
                          <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                          <Text fontSize={"12px"} fontWeight={"600"} color="#000">4.5</Text>
                        </HStack>
                      </Flex>
                    </Box>
                  </Box>
                </Box>
              ))}
            </motion.div>
          </Box>

          {/* Pagination Dots */}
          <Flex justify="center" gap={2} mt={4}>
            {vendors.map((_: any, index: number) => (
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
      <Box mb="5em" />
      </Box>
    </Box>
  );
}



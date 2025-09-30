"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import NextLink from "next/link";
import { Box, Heading, Link, Text, Fade, SlideFade, ScaleFade, Skeleton, SkeletonText, Badge, HStack, VStack, Button, SimpleGrid, Flex, Icon, Image } from "@chakra-ui/react";
import { FaBell, FaArrowLeft } from "react-icons/fa";
import { FiStar, FiMapPin, FiClock } from "react-icons/fi";
import Wrapper from "../../../components/Wrapper";

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor", params.id],
    queryFn: () => api.vendor(params.id),
    enabled: Boolean(params.id),
  });

  // Trigger load animation when data is ready
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Professional loading state
  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton height="30px" width="180px" mb={3} />
        <SkeletonText noOfLines={3} spacing="3" skeletonHeight="3" />
        <Skeleton height="18px" width="120px" mt={3} />
      </Box>
    );
  }
  if (error) return <Box p={4}>Failed to load store</Box>;

  const v = (data as any)?.data || data;
  if (!v) return <Box p={4}>Not found</Box>;

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
                Store Details
              </Text>
            </HStack>
            <Icon as={FaBell} color="#fff" fontSize="20px" />
          </Flex>
        </Wrapper>
      </Box>

      <Wrapper>
        {/* Content Section */}
        <Box py={4}>
          {/* Store Card */}
          <Box bg="white" borderRadius="8px" p={4} border="1px solid" borderColor="gray.100" mb={4}>
            <Heading size="md" color="#000" fontWeight="700" mb={2}>
              {v.businessName || v.name || v.Name}
            </Heading>
            <Text fontSize="13px" color="#8E8E93" mb={3}>
              {v.description || "Explore delicious meals and essentials from this store."}
            </Text>

            <HStack spacing={4} mb={3}>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                <Text fontSize="13px" fontWeight="600" color="#000">
                  {v.rating ?? v.Ratings ?? "4.5"}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiMapPin} color="#6C3FE8" boxSize={4} />
                <Text fontSize="13px" color="#8E8E93">
                  {(v.distance || "0.6") + "km"} away
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiClock} color="#6C3FE8" boxSize={4} />
                <Text fontSize="13px" color="#8E8E93">25-35 min</Text>
              </HStack>
            </HStack>

            <HStack spacing={2}>
              <Badge colorScheme="green" fontSize="10px" px={2} py={0.5} borderRadius="full">Open Now</Badge>
              <Badge colorScheme="purple" fontSize="10px" px={2} py={0.5} borderRadius="full">Fast Delivery</Badge>
            </HStack>
          </Box>

          {/* Categories */}
          {(v.categories && v.categories.length > 0) && (
            <Box bg="white" borderRadius="8px" p={4} border="1px solid" borderColor="gray.100" mb={4}>
              <Heading size="sm" color="#000" fontWeight="600" mb={3}>Categories</Heading>
              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
                {v.categories.slice(0, 6).map((c: any) => (
                  <Box 
                    key={c?.name || c} 
                    bg="#F2F2F7" 
                    px={3} 
                    py={2} 
                    borderRadius="8px"
                    textAlign="center"
                  >
                    <Text fontSize="12px" fontWeight="500" color="#000">
                      {c?.name || c}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Browse Button */}
          <Button 
            as={NextLink} 
            href={`/user-dashboard/stores/${params.id}/items`} 
            w="full"
            bg="#6C3FE8" 
            color="#fff" 
            borderRadius="12px" 
            h="48px"
            fontWeight="600"
            _hover={{ bg: "#5a2cc7" }}
          >
            Browse Items
          </Button>
        </Box>

        <Box mb={"5em"} />
      </Wrapper>
    </Box>
  );
}



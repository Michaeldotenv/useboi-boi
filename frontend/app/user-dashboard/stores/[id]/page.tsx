"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import NextLink from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Icon,
  Image,
  Flex,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiStar, FiMapPin, FiClock, FiHeart } from "react-icons/fi";

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", params.id],
    queryFn: () => api.vendor(params.id),
    enabled: Boolean(params.id),
  });

  const vendor = (data as any)?.data || data;

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Skeleton height="220px" />
        <Container maxW="6xl" py={4}>
          <Skeleton height="32px" width="250px" mb={3} />
          <Skeleton height="16px" width="180px" />
        </Container>
      </Box>
    );
  }

  if (!vendor) {
    return (
      <Box bg="white" minH="100vh" p={6}>
        <Text>Store not found</Text>
      </Box>
    );
  }

  const vendorName = vendor.businessName || vendor.name || "Store";
  const vendorImage = vendor.image || vendor.coverImage || vendor.logoUrl;
  const rating = vendor.rating || (Math.random() * 1.5 + 3.5).toFixed(1);

  return (
    <Box bg="white" minH="100vh" pb={16}>
      {/* Compact Store Header */}
      <Box position="relative" h="220px" bg="gray.100">
        {vendorImage ? (
          <Image
            src={vendorImage}
            alt={vendorName}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Flex h="full" align="center" justify="center" bg="gray.50">
            <Text fontSize="5xl">🏪</Text>
          </Flex>
        )}

        {/* Subtle Overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="40%"
          bgGradient="linear(to-t, blackAlpha.600, transparent)"
        />

        {/* Compact Back Button */}
        <Box position="absolute" top={3} left={3}>
          <Flex
            w={8}
            h={8}
            bg="whiteAlpha.900"
            borderRadius="full"
            align="center"
            justify="center"
            cursor="pointer"
            onClick={() => router.back()}
            _hover={{ bg: "white" }}
          >
            <Icon as={FiArrowLeft} boxSize={4} color="gray.900" />
          </Flex>
        </Box>

        {/* Compact Favorite Button */}
        <Box position="absolute" top={3} right={3}>
          <Flex
            w={8}
            h={8}
            bg="whiteAlpha.900"
            borderRadius="full"
            align="center"
            justify="center"
            cursor="pointer"
            _hover={{ bg: "white" }}
          >
            <Icon as={FiHeart} boxSize={4} color="gray.900" />
          </Flex>
        </Box>

        {/* Compact Status Badge */}
        <Badge
          position="absolute"
          bottom={3}
          left={3}
          colorScheme="green"
          borderRadius="md"
          px={2.5}
          py={1}
          fontSize="xs"
          fontWeight="600"
        >
          Open Now
        </Badge>
      </Box>

      {/* Store Info - Compact */}
      <Container maxW="6xl" py={4}>
        <VStack align="stretch" spacing={4}>
          {/* Store Name & Rating */}
          <VStack align="stretch" spacing={2}>
            <Heading size="lg" fontWeight="600" color="gray.900">
              {vendorName}
            </Heading>

            <HStack spacing={4} flexWrap="wrap" fontSize="sm">
              <HStack spacing={1}>
                <Icon as={FiStar} color="orange.400" boxSize={4} />
                <Text fontWeight="600" color="gray.900">
                  {rating}
                </Text>
                <Text color="gray.500">
                  (200+)
                </Text>
              </HStack>

              <HStack spacing={1} color="gray.600">
                <Icon as={FiClock} boxSize={4} />
                <Text fontWeight="500">
                  {Math.floor(Math.random() * 15 + 20)}-{Math.floor(Math.random() * 15 + 35)} min
                </Text>
              </HStack>

              <HStack spacing={1} color="gray.600">
                <Icon as={FiMapPin} boxSize={4} />
                <Text fontWeight="500">
                  2.5 km
                </Text>
              </HStack>
            </HStack>

            {vendor.description && (
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                {vendor.description}
              </Text>
            )}
          </VStack>

          {/* Compact View Items Button */}
          <Button
            as={NextLink}
            href={`/user-dashboard/stores/${params.id}/items`}
            size="md"
            w="full"
            bg="purple.600"
            color="white"
            fontWeight="600"
            _hover={{ bg: "purple.700" }}
            borderRadius="10px"
          >
            View Menu & Items
          </Button>

          {/* Compact Additional Info */}
          <Box
            bg="gray.50"
            borderRadius="10px"
            p={4}
            border="1px"
            borderColor="gray.100"
          >
            <VStack align="stretch" spacing={3}>
              <Heading size="sm" fontWeight="600" color="gray.900">
                Store Information
              </Heading>

              <VStack align="stretch" spacing={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="gray.600">Delivery Fee</Text>
                  <Text fontWeight="600" color="gray.900">
                    ₦200
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="gray.600">Minimum Order</Text>
                  <Text fontWeight="600" color="gray.900">
                    ₦1,000
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="gray.600">Payment Methods</Text>
                  <Text fontWeight="600" color="gray.900">
                    Cash, Card, Wallet
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

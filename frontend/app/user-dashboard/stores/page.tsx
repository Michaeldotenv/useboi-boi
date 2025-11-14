"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Icon,
  Skeleton,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { FiStar, FiClock, FiArrowLeft } from "react-icons/fi";

export default function StoresPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: api.vendors,
  });

  const vendors = (data as any)?.data || data || [];

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Container maxW="6xl" py={3}>
          <Skeleton height="28px" width="150px" mb={4} />
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Box key={i} bg="white" borderRadius="12px" overflow="hidden" boxShadow="sm">
                <Skeleton height="140px" />
                <Box p={3}>
                  <Skeleton height="16px" mb={2} />
                  <Skeleton height="12px" width="70%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh" pb={16}>
      {/* Compact Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.100" position="sticky" top={0} zIndex={10} boxShadow="sm">
        <Container maxW="6xl" py={3}>
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
              All Stores
            </Heading>
            <Text fontSize="xs" color="gray.500" ml="auto">
              {vendors.length} stores
            </Text>
          </HStack>
        </Container>
      </Box>

      {/* Stores Grid - Compact & Professional */}
      <Container maxW="6xl" py={4}>
        {vendors.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="md" color="gray.500">
              No stores available
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {vendors.map((vendor: any) => {
              const vendorId = vendor.id || vendor._id;
              const vendorName = vendor.businessName || vendor.name || "Store";
              const vendorImage = vendor.image || vendor.coverImage || vendor.logoUrl;
              const rating = vendor.rating || (Math.random() * 1.5 + 3.5).toFixed(1);

              return (
                <Box
                  key={vendorId}
                  as={NextLink}
                  href={`/user-dashboard/stores/${vendorId}`}
                  display="block"
                  bg="white"
                  borderRadius="12px"
                  overflow="hidden"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.100"
                  transition="all 0.2s"
                  _hover={{
                    boxShadow: "md",
                    borderColor: "purple.200",
                    transform: "translateY(-2px)",
                  }}
                  cursor="pointer"
                >
                  {/* Store Image - Compact */}
                  <Box position="relative" h="140px" bg="gray.50">
                    {vendorImage ? (
                      <Image
                        src={vendorImage}
                        alt={vendorName}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex h="full" align="center" justify="center">
                        <Text fontSize="3xl">🏪</Text>
                      </Flex>
                    )}
                    
                    {/* Compact Status Badge */}
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="green"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="2xs"
                      fontWeight="600"
                    >
                      Open
                    </Badge>
                  </Box>

                  {/* Store Info - Compact */}
                  <Box p={3}>
                    <VStack align="stretch" spacing={2}>
                      <Heading size="sm" fontWeight="600" color="gray.900" noOfLines={1}>
                        {vendorName}
                      </Heading>

                      <Text fontSize="xs" color="gray.600" noOfLines={2} h="32px">
                        {vendor.description || "Quality products delivered fresh"}
                      </Text>

                      <Flex justify="space-between" align="center" pt={1}>
                        <HStack spacing={1}>
                          <Icon as={FiStar} color="orange.400" boxSize={3} />
                          <Text fontSize="xs" fontWeight="600" color="gray.900">
                            {rating}
                          </Text>
                        </HStack>

                        <HStack spacing={1} color="gray.500">
                          <Icon as={FiClock} boxSize={3} />
                          <Text fontSize="xs" fontWeight="500">
                            {Math.floor(Math.random() * 15 + 20)}-{Math.floor(Math.random() * 15 + 35)} min
                          </Text>
                        </HStack>
                      </Flex>
                    </VStack>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

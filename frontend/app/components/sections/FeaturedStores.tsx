// ==================================================
// components/sections/FeaturedStores.tsx - PURPLE THEME
// Modern Card-Based Design with Purple Branding
// ==================================================
"use client"
import { Container, HStack, VStack, Text, Button, Box, SimpleGrid, Image, Badge, chakra } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

type Vendor = { id: string; name: string; logoUrl?: string; coverImage?: string; rating?: number };

type Props = {
  vendors: Vendor[];
  loading: boolean;
};

export default function FeaturedStores({ vendors, loading }: Props) {
  const featuredStores = vendors.slice(0, 8);

  return (
    <Box bg="white" py={{ base: 12, md: 20 }}>
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        {/* Section Header */}
        <VStack spacing={6} mb={10}>
          <VStack spacing={2}>
            <Badge 
              colorScheme="purple" 
              variant="subtle" 
              px={4} 
              py={1} 
              borderRadius="full"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Top Picks
            </Badge>
            <Text 
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }} 
              fontWeight="800" 
              color="gray.900"
              textAlign="center"
            >
              Featured Restaurants
            </Text>
            <Text 
              fontSize={{ base: 'md', md: 'lg' }} 
              color="gray.600" 
              textAlign="center"
              maxW="2xl"
            >
              Discover the best restaurants near you. From local favorites to trending hotspots.
            </Text>
          </VStack>

          {/* View All Button - Desktop */}
          <Button
            as={chakra.a}
            href="/dashboard/stores"
            size="lg"
            rightIcon={<ArrowForwardIcon />}
            colorScheme="purple"
            borderRadius="full"
            px={8}
            display={{ base: 'none', md: 'flex' }}
            _hover={{ transform: 'translateX(4px)' }}
            transition="all 0.3s ease"
          >
            View All Stores
          </Button>
        </VStack>

        {/* Stores Grid */}
        <SimpleGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
          spacing={{ base: 6, md: 8 }}
        >
          {(loading ? Array.from({ length: 8 }) : featuredStores).map((vendor: any, idx: number) => (
            <Box
              key={idx}
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="md"
              cursor="pointer"
              _hover={{ 
                transform: 'translateY(-8px)',
                boxShadow: '2xl'
              }}
              transition="all 0.3s ease"
              position="relative"
            >
              {loading ? (
                <>
                  <Box h="200px" bg="gray.100" />
                  <Box p={4}>
                    <Box h="20px" w="70%" bg="gray.100" mb={2} borderRadius="md" />
                    <Box h="16px" w="40%" bg="gray.100" borderRadius="md" />
                  </Box>
                </>
              ) : (
                <>
                  {/* Store Image */}
                  <Box position="relative" h="200px" overflow="hidden">
                    <Image
                      src={vendor.coverImage || vendor.logoUrl || '/Food-item-1.jpeg'}
                      alt={vendor.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _groupHover={{ transform: 'scale(1.1)' }}
                    />
                    
                    {/* Overlay Gradient */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      h="50%"
                      bgGradient="linear(to-t, blackAlpha.600, transparent)"
                    />

                    {/* Rating Badge */}
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      bg="white"
                      color="gray.900"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="700"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      ⭐ {vendor.rating?.toFixed(1) || '4.5'}
                    </Badge>

                    {/* Delivery Time Badge */}
                    <Badge
                      position="absolute"
                      top={3}
                      left={3}
                      bg="purple.500"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      20-30 min
                    </Badge>
                  </Box>

                  {/* Store Info */}
                  <VStack align="start" p={4} spacing={2}>
                    <Text 
                      fontSize="lg" 
                      fontWeight="700" 
                      color="gray.900"
                      noOfLines={1}
                    >
                      {vendor.name}
                    </Text>
                    
                    <HStack spacing={2} fontSize="sm" color="gray.600">
                      <Text>🍔 Fast Food</Text>
                      <Text>•</Text>
                      <Text>₦500 delivery</Text>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack spacing={2} pt={2} w="full">
                      <Button
                        size="sm"
                        colorScheme="purple"
                        flex={1}
                        borderRadius="lg"
                      >
                        Order Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="purple"
                        borderRadius="lg"
                      >
                        View Menu
                      </Button>
                    </HStack>
                  </VStack>
                </>
              )}
            </Box>
          ))}
        </SimpleGrid>

        {/* View All Button - Mobile */}
        <Box mt={8} textAlign="center" display={{ base: 'block', md: 'none' }}>
          <Button
            as={chakra.a}
            href="/dashboard/stores"
            size="lg"
            rightIcon={<ArrowForwardIcon />}
            colorScheme="purple"
            borderRadius="full"
            px={8}
            w="full"
            maxW="400px"
          >
            View All Stores
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
"use client"
import { Box, Container, SimpleGrid, VStack, HStack, Text, Badge, Button, Image, chakra } from "@chakra-ui/react";

export default function HeroSection() {
  return (
    <Box bg="white" py={{ base: 10, md: 20 }}>
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 16 }} alignItems="center">
          {/* Left Content */}
          <VStack spacing={{ base: 6, md: 8 }} align="start">
            <Text 
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} 
              fontWeight="800" 
              color="gray.900"
              lineHeight="shorter"
            >
              Get Your Favorite Meals
              <chakra.span display="block" color="gray.900">
                Delivered Anytime
              </chakra.span>
              <chakra.span display="block" color="gray.900">
                Anywhere
              </chakra.span>
            </Text>
            
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" maxW="500px" lineHeight="tall">
              Order from local stores, run errands, and track deliveries in one app. 
              Experience seamless service at your fingertips.
            </Text>
            
            <HStack spacing={4} pt={2}>
              <Button
                size="lg"
                bg="purple.500"
                color="white"
                _hover={{ bg: "purple.600" }}
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="600"
              >
                Order Now
              </Button>
              <Button
                size="lg"
                variant="ghost"
                color="purple.500"
                _hover={{ bg: "purple.50" }}
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="600"
                leftIcon={<Text fontSize="xl">▶</Text>}
              >
                See the demo
              </Button>
            </HStack>

            {/* Trust Indicators */}
            <HStack spacing={8} pt={4} flexWrap="wrap">
              <VStack spacing={0} align="start">
                <HStack>
                  <Image src="/path-to-icon.png" width="24px" height="24px" alt="" fallback={<Box w="24px" h="24px" bg="purple.100" borderRadius="md" />} />
                  <Text fontWeight="700" fontSize="sm">2M+</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">Happy Customers</Text>
              </VStack>

              <VStack spacing={0} align="start">
                <HStack>
                  <Image src="/path-to-icon.png" width="24px" height="24px" alt="" fallback={<Box w="24px" h="24px" bg="purple.100" borderRadius="md" />} />
                  <Text fontWeight="700" fontSize="sm">15K+</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">Restaurant Partners</Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Right Content - Phone Mockup */}
          <Box position="relative" display="flex" justifyContent="center">
            <Box position="relative" maxW="400px" w="full">
              {/* Main Phone */}
              <Box
                bg="white"
                borderRadius="3xl"
                overflow="hidden"
                boxShadow="2xl"
                border="8px solid"
                borderColor="gray.900"
              >
                <Image 
                  src="/media04.png" 
                  alt="App Screenshot"
                  width="100%"
                  height="auto"
                  objectFit="cover"
                />
              </Box>

              {/* Floating Elements */}
              <Box
                position="absolute"
                top="10%"
                right="-10%"
                bg="white"
                p={3}
                borderRadius="xl"
                boxShadow="lg"
                display={{ base: 'none', lg: 'block' }}
              >
                <HStack spacing={2}>
                  <Image src="/food-carousel.png" width="40px" height="40px" borderRadius="md" alt="" />
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" fontWeight="700">Chicken Burger</Text>
                    <Text fontSize="xs" color="gray.500">₦2,500</Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                position="absolute"
                bottom="15%"
                left="-10%"
                bg="purple.500"
                color="white"
                p={3}
                borderRadius="xl"
                boxShadow="lg"
                display={{ base: 'none', lg: 'block' }}
              >
                <VStack spacing={0} align="start">
                  <Text fontSize="xs" fontWeight="700">Fast Delivery</Text>
                  <Text fontSize="xs">Within 30 mins</Text>
                </VStack>
              </Box>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
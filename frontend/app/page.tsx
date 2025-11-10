
"use client"
import { Box, Container, Heading, Text, Button, VStack, HStack, SimpleGrid, Image, Flex, Badge, Icon, Skeleton, useToast, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { FiClock, FiStar, FiShoppingBag, FiTruck, FiDollarSign, FiMenu, FiPackage } from "react-icons/fi";
import { motion } from "framer-motion";
import Head from "next/head";
import AppDownload from "./components/sections/AppDownload";
import FeaturesSection from "./components/sections/FeaturesSection";
import FoodDeliverySection from "./components/sections/FoodDeliverySection";
import Footer from "./components/Footer";

const MotionBox = motion(Box);

type Vendor = { 
  id?: string; 
  _id?: string;
  name?: string; 
  businessName?: string;
  logoUrl?: string; 
  coverImage?: string; 
  image?: string;
  rating?: number;
  description?: string;
};

export default function LandingPage() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  // Fetch vendors - with fallback to mock data if API requires auth
  const { data, isLoading, error: queryError } = useQuery({ 
    queryKey: ["public-vendors"], 
    queryFn: async () => {
      console.log('🔄 Fetching vendors...');
      
      try {
        // Try with authentication first if available
        const token = getAuthToken();
        if (token) {
          console.log('✅ Token found, using authenticated API');
          const result = await api.vendors();
          console.log('✅ Vendors fetched (authenticated):', result);
          return result;
        }
        
        // Try public endpoint
        console.log('📡 No token, trying public vendors endpoint');
        const response = await fetch('https://useboiboi.onrender.com/api/vendors', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Response status:', response.status);
        
        // If 401, the endpoint requires auth
        if (response.status === 401) {
          console.error('⚠️ API requires authentication. Backend needs to allow public access to /api/vendors');
          console.error('💡 Solution: Modify backend to make /api/vendors endpoint public or create /api/public/vendors');
          return { data: [] };
        }
        
        if (!response.ok) {
          console.error('❌ Public API call failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          return { data: [] };
        }
        
        const data = await response.json();
        console.log('✅ Vendors fetched (public):', data);
        return data;
      } catch (err) {
        console.error('❌ Error fetching vendors:', err);
        return { data: [] };
      }
    },
    retry: 0, // Don't retry since we have fallback
    staleTime: 60000, // Cache for 1 minute
  });

  // Log query error if any
  useEffect(() => {
    if (queryError) {
      console.error('❌ Query error:', queryError);
    }
  }, [queryError]);

  const vendors = (data as any)?.data || data || [];
  const loading = isLoading;

  const handleStoreClick = (vendorId: string) => {
    if (isAuthenticated) {
      router.push(`/user-dashboard/stores/${vendorId}`);
    } else {
      toast({
        title: "Sign up to order",
        description: "Create an account to start ordering from our stores",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      router.push('/sign-up');
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/user-dashboard');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <Box bg="#FAFAFA" minH="100vh">
      <Head>
        <title>Boiboi | Order Food & Groceries from Local Stores</title>
        <meta name="description" content="Order from local stores, track deliveries, and get your favorite items delivered to your doorstep." />
      </Head>
      
      {/* Navigation */}
      <Box 
        bg="white" 
        borderBottom="1px solid" 
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Container maxW="7xl" py={{ base: 2, md: 3 }}>
          <Flex justify="space-between" align="center">
            <HStack spacing={2} cursor="pointer" onClick={() => router.push('/')}>
              <Image
                src="/boiboi (02).png"
                alt="Boiboi Logo"
                width="80px"
                height="auto"
                objectFit="contain"
              />
            </HStack>
            
            {/* Desktop Navigation */}
            <HStack spacing={3} display={{ base: "none", md: "flex" }}>
              {isAuthenticated ? (
                <Button
                  onClick={() => router.push('/user-dashboard')}
                  bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  borderRadius="8px"
                  fontWeight="600"
                  px={5}
                  size="sm"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => router.push('/login')}
                    variant="ghost"
                    color="gray.700"
                    _hover={{ bg: "gray.100" }}
                    borderRadius="8px"
                    fontWeight="600"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push('/sign-up')}
                    bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)"
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    borderRadius="8px"
                    fontWeight="600"
                    px={5}
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </HStack>

            {/* Mobile Hamburger Menu */}
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu />}
              onClick={onOpen}
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              fontSize="24px"
              color="gray.700"
            />
          </Flex>
        </Container>
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Image
              src="/boiboi (02).png"
              alt="Boiboi Logo"
              width="90px"
              height="auto"
              objectFit="contain"
            />
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    router.push('/user-dashboard');
                    onClose();
                  }}
                  bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  borderRadius="10px"
                  fontWeight="600"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      router.push('/login');
                      onClose();
                    }}
                    variant="outline"
                    borderColor="gray.300"
                    color="gray.700"
                    _hover={{ bg: "gray.100" }}
                    borderRadius="10px"
                    fontWeight="600"
                    size="lg"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/sign-up');
                      onClose();
                    }}
                    bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)"
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    borderRadius="10px"
                    fontWeight="600"
                    size="lg"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Hero Section with Overlapping Cards */}
      <Box 
        position="relative"
        pb={{ base: "200px", md: "180px" }}
      >
        {/* Hero Background */}
        <Box 
          position="relative"
          h={{ base: "600px", md: "700px" }}
          overflow="hidden"
          bg="gray.900"
        >
          {/* Hero Background Video */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
          >
            <Box
              as="video"
              autoPlay
              loop
              muted
              playsInline
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              objectFit="cover"
              sx={{
                filter: "brightness(0.75)",
                objectPosition: "center"
              }}
            >
              <source src="/boiboivideo.mp4" type="video/mp4" />
              {/* Fallback image if video doesn't load */}
              Your browser does not support the video tag.
            </Box>
            
            {/* Video Overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)"
            />
          </Box>
          
          {/* Hero Content - Centered */}
          <Container maxW="7xl" h="full" position="relative" zIndex={1}>
            <Flex h="full" align="center" justify="center">
              <VStack spacing={6} textAlign="center" maxW="800px">
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Text fontSize="sm" fontWeight="600" color="purple.300" letterSpacing="wider" textTransform="uppercase">
                    Welcome To
                  </Text>
                </MotionBox>
                
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Heading 
                    fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} 
                    fontWeight="700" 
                    color="white"
                    lineHeight="1.1"
                  >
                    Order Food & Groceries
                  </Heading>
                  <Text 
                    fontSize={{ base: "lg", md: "xl" }} 
                    color="gray.200" 
                    mt={6}
                    fontWeight="500"
                    maxW="600px"
                    mx="auto"
                  >
                    From your favorite local stores, delivered fresh to your doorstep
                  </Text>
                </MotionBox>
                
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button
                    size="lg"
                    bg="linear-gradient(135deg, #6B2A8F 0%, #3B174F 100%)"
                    color="white"
                    _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
                    _active={{ opacity: 0.8 }}
                    borderRadius="12px"
                    px={10}
                    py={7}
                    fontSize="lg"
                    fontWeight="700"
                    onClick={handleGetStarted}
                    mt={4}
                  >
                    {isAuthenticated ? 'Browse Stores' : 'Get Started'}
                  </Button>
                </MotionBox>
              </VStack>
            </Flex>
          </Container>
        </Box>

        {/* Quick Features Cards - Overlapping Hero */}
        <Container maxW="7xl" position="relative" zIndex={2} mt={{ base: "-120px", md: "-100px" }}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiTruck,
                title: "Fast Delivery",
                description: "Get your orders delivered quickly and safely to your doorstep"
              },
              {
                icon: FiDollarSign,
                title: "Best Prices",
                description: "Competitive prices and great deals from local stores"
              },
              {
                icon: FiShoppingBag,
                title: "Wide Selection",
                description: "Choose from hundreds of items across multiple stores"
              }
            ].map((feature, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                bg="white"
                p={8}
                borderRadius="20px"
                border="1px solid"
                borderColor="gray.200"
                textAlign="center"
                whileHover={{ y: -8 }}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "purple.300"
                  }
                }}
              >
                <Flex
                  w={16}
                  h={16}
                  bg="purple.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  mx="auto"
                  mb={4}
                >
                  <Icon as={feature.icon} boxSize={8} color="purple.600" />
                </Flex>
                <Heading size="md" color="gray.900" fontWeight="600" mb={3}>
                  {feature.title}
                </Heading>
                <Text color="gray.600" fontSize="sm" fontWeight="500" lineHeight="tall">
                  {feature.description}
                </Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Stores Section */}
      {(loading || vendors.length > 0) && (
        <Box py={16}>
          <Container maxW="7xl">
            <VStack spacing={8} align="stretch">
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="600" color="purple.600" letterSpacing="wider" textTransform="uppercase" mb={2}>
                  Our Stores
                </Text>
                <Heading size="xl" color="gray.900" fontWeight="700" mb={4}>
                  Browse Available Stores
                </Heading>
                <Text color="gray.600" fontSize="lg" maxW="600px" mx="auto">
                  {isAuthenticated 
                    ? "Click on any store to start shopping" 
                    : "Sign up to start ordering from these amazing stores"}
                </Text>
              </Box>

              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Box key={i} bg="white" borderRadius="16px" overflow="hidden" border="1px solid" borderColor="gray.200">
                      <Skeleton height="180px" />
                      <Box p={4}>
                        <Skeleton height="20px" mb={2} />
                        <Skeleton height="14px" width="80%" />
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {vendors.map((vendor: Vendor, index: number) => {
                  const vendorId = vendor.id || vendor._id || '';
                  const vendorName = vendor.businessName || vendor.name || 'Store';
                  const vendorImage = vendor.image || vendor.coverImage || vendor.logoUrl;
                  
                  return (
                    <MotionBox
                      key={vendorId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      bg="white"
                      borderRadius="16px"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                      cursor="pointer"
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        borderColor: "purple.300"
                      }}
                      onClick={() => handleStoreClick(vendorId)}
                    >
                      <Box
                        h="180px"
                        bg="gray.100"
                        bgImage={vendorImage ? `url(${vendorImage})` : undefined}
                        bgSize="cover"
                        bgPosition="center"
                        position="relative"
                      >
                        {!vendorImage && (
                          <Flex h="full" align="center" justify="center">
                            <Icon as={FiPackage} boxSize={12} color="gray.400" />
                          </Flex>
                        )}
                        <Badge
                          position="absolute"
                          top={3}
                          right={3}
                          colorScheme="green"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="10px"
                          fontWeight="600"
                        >
                          • Open
                        </Badge>
                      </Box>
                      <Box p={4}>
                        <VStack align="stretch" spacing={2}>
                          <Heading size="sm" color="gray.900" fontWeight="600" noOfLines={1}>
                            {vendorName}
                          </Heading>
                          <Text fontSize="sm" color="gray.600" noOfLines={2} fontWeight="500">
                            {vendor.description || "Quality products delivered fresh to your location"}
                          </Text>
                          <Flex justify="space-between" align="center" pt={2}>
                            <HStack spacing={1}>
                              <Icon as={FiStar} color="purple.500" boxSize={4} />
                              <Text fontSize="sm" fontWeight="600" color="gray.900">
                                {vendor.rating || (Math.random() * 1.5 + 3.5).toFixed(1)}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Icon as={FiClock} color="gray.400" boxSize={4} />
                              <Text fontSize="sm" color="gray.600" fontWeight="500">
                                {Math.floor(Math.random() * 15 + 20)}-{Math.floor(Math.random() * 15 + 35)} min
                              </Text>
                            </HStack>
                          </Flex>
                        </VStack>
                      </Box>
                    </MotionBox>
                  );
                })}
              </SimpleGrid>
              )}
            </VStack>
          </Container>
        </Box>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Food Delivery Section */}
      <FoodDeliverySection />

      {/* App Download Section */}
      <AppDownload />

      {/* Footer */}
      <Footer />
    </Box>
  );
}


"use client"
<<<<<<< HEAD
import { Box } from "@chakra-ui/react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HeroSection from "./components/sections/HeroSection";
import LocationSelector from "./components/sections/LocationSelector";
import FeaturedStores from "./components/sections/FeaturedStores";
import PopularCategories from "./components/sections/PopularCategories";
import PromotionalBanners from "./components/sections/PromotionalBanners";
import RecentOrders from "./components/sections/RecentOrders";
import AppDownload from "./components/sections/AppDownload";
import HeroWithImage from "./components/sections/HeroWithImage";
=======
import { 
  Box, 
  Text, 
  Button, 
  HStack, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  chakra, 
  Image,
  VStack,
  Container,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Icon
} from "@chakra-ui/react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Card from "./components/Card";
import { AddIcon, ArrowForwardIcon, MinusIcon } from "@chakra-ui/icons";
import { FaLocationArrow, FaRocket, FaClock, FaShieldAlt } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
>>>>>>> 7b2dac5ad31857fb9988d7da9edc160c70241baf
import Head from "next/head";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useColorModeValue } from "@chakra-ui/react";
import FeaturesSection from "./components/sections/FeaturesSection";
import FoodDeliverySection from "./components/sections/FoodDeliverySection";

type Vendor = { id: string; name: string; logoUrl?: string; coverImage?: string; rating?: number };
type Order = { id: string; status: string; createdAt?: string; vendorName?: string };

export default function LandingPage() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const [me, setMe] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [meRes, vendorsRes] = await Promise.allSettled([
          api.me() as Promise<any>,
          api.vendors() as Promise<Vendor[]>,
        ]);
        if (mounted && meRes.status === 'fulfilled') setMe(meRes.value);
        if (mounted && vendorsRes.status === 'fulfilled') setVendors(vendorsRes.value || []);
        if (mounted && meRes.status === 'fulfilled' && meRes.value?.id) {
          try {
            const myOrders = await api.ordersByCustomer(meRes.value.id);
            if (Array.isArray(myOrders)) setOrders(myOrders as Order[]);
          } catch {}
        }
      } catch {}
      finally {
        if (mounted) setLoading(false);
      }
    })();
    
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => void 0,
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
      );
    }
    return () => { mounted = false };
  }, []);

<<<<<<< HEAD
=======
  const featuredStoreItems = vendors.slice(0, 10).map(v => ({
    id: v.id,
    image: v.coverImage || v.logoUrl || '/Food-item-1.jpeg',
    title: v.name,
    rating: v.rating || 4.5,
    content: null as any,
  }));

  const categoriesData = [
    { name: 'Food', image: '/food-carousel.png' },
    { name: 'Groceries', image: '/Food-item-2.jpg' },
    { name: 'Pharmacy', image: '/Food-item-3.jpg' },
    { name: 'Errands', image: '/senderrand.jpg' },
    { name: 'Electronics', image: '/Food-item-4.jpg' },
    { name: 'Fashion', image: '/Food-item-5.jpg' },
    { name: 'Beauty', image: '/Food-item-6.jpg' },
    { name: 'More', image: '/image.webp' },
  ];

>>>>>>> 7b2dac5ad31857fb9988d7da9edc160c70241baf
  return (
    <Box bg={bg}>
      <Head>
        <title>Boiboi | Food, Errands, and Local Stores near you</title>
        <meta name="description" content="Order from local stores, track deliveries, and run errands with Boiboi." />
      </Head>
      
      <Navigation />
<<<<<<< HEAD
      <HeroSection />
      <LocationSelector coords={coords} setCoords={setCoords} />
      <FeaturedStores vendors={vendors} loading={loading} />
      <PopularCategories loading={loading} />
      <PromotionalBanners />
      {me && <RecentOrders orders={orders} />}
      <AppDownload />
      <HeroWithImage />
      <FeaturesSection />
      <FoodDeliverySection />
=======

      {/* Hero Section */}
      <Box 
        minH={{ base: "90vh", md: "80vh" }}
        bg="brand.primary"
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl" minH="inherit" display="flex" alignItems="center" py={{ base: 8, md: 16 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 12 }} alignItems="center" w="full">
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: 'center', lg: 'start' }} textAlign={{ base: 'center', lg: 'left' }}>
              <Badge bg="whiteAlpha.300" color="white" px={4} py={2} borderRadius="full" fontSize="sm">
                🚀 Now available on mobile
              </Badge>
              <Text fontSize={{ base: '4xl', md: '6xl' }} fontWeight={800} color="white" lineHeight="shorter">
                At your service
                <chakra.span display="block" color="whiteAlpha.700">- boiboi</chakra.span>
              </Text>
              <Text color="whiteAlpha.800" fontSize={{ base: 'lg', md: 'xl' }} maxW="lg" lineHeight="tall">
                Order from local stores, run errands, and track deliveries in one app. 
                Experience seamless delivery and logistics services.
              </Text>
              
              {/* Search Bar */}
              <Box w="full" maxW="xl" bg="white" borderRadius="xl" overflow="hidden" boxShadow="xl" mt={4}>
                <HStack>
                  <Box flex={1} px={4} py={4}>
                    <chakra.input 
                      placeholder="Search restaurants, stores, or items" 
                      width="100%" 
                      _placeholder={{ color: 'gray.500' }}
                      fontSize="md"
                      border="none"
                      outline="none"
                    />
                  </Box>
                  <Button bg="brand.primaryLight" color="white" _hover={{ bg: "brand.primary" }} px={8} py={4} borderRadius={0} fontWeight="600">Search</Button>
                </HStack>
              </Box>
              
              {/* Quick Categories */}
              <HStack spacing={3} pt={2} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                {['Food', 'Groceries', 'Pharmacy', 'Errands'].map((t) => (
                  <Badge key={t} bg="whiteAlpha.300" color="white" px={4} py={2} borderRadius="full" fontSize="sm">{t}</Badge>
                ))}
              </HStack>
              
              {/* CTA Buttons */}
              <VStack spacing={3} pt={4} w={{ base: "100%", sm: "auto" }}>
                <HStack spacing={4} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                  <Button 
                    as={chakra.a} 
                    href="/check-out" 
                    bg="white" 
                    color="brand.primary" 
                    _hover={{ bg: 'gray.50', transform: 'translateY(-2px)' }}
                    borderRadius="xl" 
                    px={8} 
                    py={6}
                    fontWeight="600"
                    size="lg"
                  >
                    Order Now
                  </Button>
                  <Button 
                    as={chakra.a} 
                    href="/dashboard/orders" 
                    variant="outline" 
                    colorScheme="whiteAlpha" 
                    borderColor="whiteAlpha.600" 
                    color="white" 
                    borderRadius="xl"
                    px={8} 
                    py={6}
                    fontWeight="600"
                    size="lg"
                    _hover={{ bg: 'whiteAlpha.100' }}
                  >
                    Track Order
                  </Button>
                </HStack>
                <Button 
                  as={chakra.a} 
                  href="/dashboard/stores" 
                  variant="link" 
                  colorScheme="whiteAlpha" 
                  color="white" 
                  fontSize="md"
                  _hover={{ color: 'whiteAlpha.800' }}
                >
                  Browse Stores →
                </Button>
              </VStack>
            </VStack>
            
            {/* Hero Image */}
            <Box position="relative" display={{ base: 'none', lg: 'block' }}>
              <Box position="absolute" top="-8" right="-8" bottom="-8" left="-8" bg="whiteAlpha.200" borderRadius="3xl" transform="rotate(3deg)" />
              <Image src="/dGuy.png" alt="Delivery service" width="100%" height="auto" borderRadius="2xl" />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Location selector */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
        <HStack justify="space-between" flexWrap="wrap" spacing={4}>
          <HStack>
            <Box p={3} bg="rgba(107, 42, 143, 0.1)" borderRadius="lg">📍</Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" color="gray.500">Delivering to</Text>
              <Text fontWeight={600}>{coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : 'Use current location'}</Text>
            </VStack>
          </HStack>
          <Button 
            size="sm" 
            onClick={() => navigator.geolocation?.getCurrentPosition((pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }))}
            color="brand.primary"
            borderColor="brand.primary"
            _hover={{ bg: "brand.primary", color: "white" }}
            variant="outline"
          >
            {coords ? 'Update location' : 'Use my location'}
          </Button>
        </HStack>
      </Container>

      {/* Featured Stores */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <HStack justify="space-between" mb={{ base: 6, md: 8 }} flexWrap="wrap">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="gray.900">Featured stores</Text>
          <Button as={chakra.a} href="/dashboard/stores" variant="link" color="brand.primary" fontSize="md">See all →</Button>
        </HStack>
        <Carousel
          items={featuredStoreItems}
          itemsPerView={4}
          spacing={16}
          showDots
          autoPlay
          autoPlayInterval={3500}
          variant='stores'
          loading={loading}
        />
      </Container>

      {/* Popular categories */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="gray.900" mb={{ base: 6, md: 8 }}>Popular categories</Text>
        
        {/* Mobile horizontal scroller */}
        <HStack spacing={4} overflowX="auto" py={2} display={{ base: 'flex', md: 'none' }} sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          {(loading ? Array.from({ length: 8 }) : categoriesData).map((c: any, idx: number) => (
            <Card key={`m-${idx}`} minW="140px" variant="elevated" p={0} overflow="hidden" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.3s ease">
              {loading ? (
                <Box h="100px" bg="gray.100" />
              ) : (
                <Box position="relative" h="100px" bg="gray.100">
                  <Image src={c.image} alt={c.name} width="100%" height="100%" objectFit="cover" />
                </Box>
              )}
              <Box p={3}>
                {loading ? <Box h="16px" w="70px" bg="gray.100" /> : <Text fontWeight={700} fontSize="sm">{c.name}</Text>}
              </Box>
            </Card>
          ))}
        </HStack>
        
        {/* Desktop grid */}
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={6} display={{ base: 'none', md: 'grid' }}>
          {(loading ? Array.from({ length: 8 }) : categoriesData).map((c: any, idx: number) => (
            <Card key={idx} variant="elevated" p={0} overflow="hidden" _hover={{ transform: 'translateY(-4px)' }} transition="all 0.3s ease">
              {loading ? (
                <Box h="150px" bg="gray.100" />
              ) : (
                <Box position="relative" h="150px" bg="gray.100">
                  <Image src={c.image} alt={c.name} width="100%" height="100%" objectFit="cover" />
                </Box>
              )}
              <Box p={4}>
                {loading ? <Box h="20px" w="80px" bg="gray.100" /> : <Text fontWeight={700} fontSize="md">{c.name}</Text>}
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Services Section */}
      <Box py={{ base: 12, md: 20 }} bg="white">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 12, md: 16 }}>
            {/* Section Header */}
            <VStack spacing={{ base: 4, md: 6 }} textAlign="center">
              <Badge bg="rgba(107, 42, 143, 0.15)" color="brand.primary" variant="subtle" px={4} py={2} borderRadius="full" fontSize="sm">
                Our Services
              </Badge>
              <Text fontSize={{ base: "3xl", md: "5xl" }} fontWeight="800" color="gray.900">
                Everything you need, delivered
              </Text>
              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="2xl">
                From food delivery to errands and logistics, we handle it all with reliable, on-time service.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 16 }} alignItems="center">
              {/* Services List */}
              <VStack spacing={{ base: 6, md: 8 }} align="start" order={{ base: 2, lg: 1 }}>
                <Card variant="elevated" p={{ base: 6, md: 8 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 6, md: 8 }} align="start">
                    <Box
                      p={{ base: 4, md: 5 }}
                      bg="rgba(107, 42, 143, 0.15)"
                      borderRadius="xl"
                      color="brand.primary"
                      fontSize={{ base: "2xl", md: "3xl" }}
                    >
                      <FaRocket />
                    </Box>
                    <VStack spacing={3} align="start">
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                        Send Us!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        Whether it's picking up groceries, dropping off packages, or running any last-minute tasks, we handle it all.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>

                <Card variant="elevated" p={{ base: 6, md: 8 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 6, md: 8 }} align="start">
                    <Box
                      p={{ base: 4, md: 5 }}
                      bg="blue.100"
                      borderRadius="xl"
                      color="blue.600"
                      fontSize={{ base: "2xl", md: "3xl" }}
                    >
                      <FaClock />
                    </Box>
                    <VStack spacing={3} align="start">
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                        Plan ahead, and we'll take care of the rest!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        Choose a time that works for you — whether it's today, tomorrow, next week, or any other day. We'll be there when you need us.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>

                <Card variant="elevated" p={{ base: 6, md: 8 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 6, md: 8 }} align="start">
                    <Box
                      p={{ base: 4, md: 5 }}
                      bg="green.100"
                      borderRadius="xl"
                      color="green.600"
                      fontSize={{ base: "2xl", md: "3xl" }}
                    >
                      <FaShieldAlt />
                    </Box>
                    <VStack spacing={3} align="start">
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                        Reliable and stress-free!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        Simply schedule your errands, and we'll ensure they're completed on time. No rush, no hassle — just dependable service when you need it.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>
              </VStack>

              {/* Feature Image */}
              <Box position="relative" order={{ base: 1, lg: 2 }}>
                <Box
                  position="absolute"
                  top={{ base: "-10px", md: "-20px" }}
                  right={{ base: "-10px", md: "-20px" }}
                  left={{ base: "10px", md: "20px" }}
                  bottom={{ base: "10px", md: "20px" }}
                  bg="rgba(107, 42, 143, 0.1)"
                  borderRadius={{ base: "2xl", md: "3xl" }}
                  transform="rotate(3deg)"
                  zIndex={0}
                />
                <Image 
                  src={"/senderrand1.jpg"} 
                  alt="Errand service illustration"
                  width="100%"
                  height="auto"
                  maxW={{ base: "300px", sm: "400px", md: "500px" }}
                  borderRadius={{ base: "xl", md: "2xl" }}
                  position="relative"
                  zIndex={1}
                  _hover={{ transform: "scale(1.02)" }}
                  transition="transform 0.3s ease"
                  mx="auto"
                />
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Recent orders (if logged in) */}
      {me && (
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
          <HStack justify="space-between" mb={{ base: 6, md: 8 }} flexWrap="wrap">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800">Your recent orders</Text>
            <Button as={chakra.a} href="/dashboard/orders" variant="link" color="brand.primary" fontSize="md">View all →</Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {(orders.length ? orders : Array.from({ length: 3 })).map((o: any, idx: number) => (
              <Card key={idx} variant="elevated" p={6} _hover={{ transform: "translateY(-2px)" }} transition="all 0.3s ease">
                {o ? (
                  <>
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight={700} fontSize="lg">{o.vendorName || 'Order'} <chakra.span color="gray.500" fontSize="sm">• {o.status}</chakra.span></Text>
                      <Badge bg="rgba(107, 42, 143, 0.15)" color="brand.primary">#{o.id?.slice?.(0,6) || '•••'}</Badge>
                    </HStack>
                    <Text color="gray.600" fontSize="md">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</Text>
                  </>
                ) : (
                  <Box h="80px" bg="gray.100" borderRadius="md" />
                )}
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      )}

      {/* App Download Section */}
      <Box py={{ base: 12, md: 20 }} bg="brand.primary" position="relative" overflow="hidden">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 12 }} alignItems="center">
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: "center", md: "start" }} textAlign={{ base: "center", md: "left" }}>
              <Badge 
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }} 
                variant="subtle" 
                px={4} 
                py={2} 
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
              >
                📱 Download Now
              </Badge>
              
              <Text 
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} 
                fontWeight="800" 
                color="white"
                lineHeight="shorter"
              >
                Get the app
              </Text>
              
              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                color="whiteAlpha.800" 
                maxW="lg"
                lineHeight="tall"
              >
                Download Boiboi for the best ordering and tracking experience. 
                Available for iOS and Android devices.
              </Text>
              
              <HStack spacing={4} pt={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                <Button
                  leftIcon={<Image src={"/google-play.png"} width="20px" height="20px" alt=""/>}
                  size="lg"
                  bg="white"
                  color="brand.primary"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={8}
                  py={6}
                  fontWeight="600"
                >
                  Play Store
                </Button>
                <Button
                  leftIcon={<Image src={"/apple-logo.png"} width="20px" height="20px" alt=""/>}
                  size="lg"
                  bg="white"
                  color="brand.primary"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={8}
                  py={6}
                  fontWeight="600"
                >
                  App Store
                </Button>
              </HStack>
            </VStack>
            
            {/* App Image */}
            <Box position="relative" order={{ base: -1, md: 0 }}>
              <Box
                position="absolute"
                top={{ base: "-10px", md: "-20px" }}
                right={{ base: "-10px", md: "-20px" }}
                left={{ base: "10px", md: "20px" }}
                bottom={{ base: "10px", md: "20px" }}
                bg="rgba(255,255,255,0.1)"
                borderRadius={{ base: "2xl", md: "3xl" }}
                transform="rotate(3deg)"
                zIndex={0}
              />
              <Image 
                src={"/media04.png"} 
                alt="Mobile app interface"
                width="100%"
                maxW={{ base: "250px", sm: "350px", md: "450px" }}
                height="auto"
                borderRadius={{ base: "xl", md: "2xl" }}
                position="relative"
                zIndex={1}
                _hover={{ transform: "scale(1.02)" }}
                transition="transform 0.3s ease"
                mx="auto"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={{ base: 12, md: 20 }} bg="gray.50" id="FAQs">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 12, md: 16 }}>
            <VStack spacing={{ base: 4, md: 6 }} textAlign="center">
              <Badge bg="rgba(107, 42, 143, 0.15)" color="brand.primary" variant="subtle" px={4} py={2} borderRadius="full" fontSize="sm">
                FAQ
              </Badge>
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="800" color="gray.900">
                Frequently Asked Questions
              </Text>
              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="2xl">
                Everything you need to know about our services
              </Text>
            </VStack>

            <Box maxW="4xl" w="full">
              <Accordion allowToggle>
                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden" bg="white">
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={{ base: 6, md: 8 }}
                        bg={isExpanded ? "rgba(107, 42, 143, 0.1)" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                            How does this work?
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        ) : (
                          <AddIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={{ base: 6, md: 8 }} px={{ base: 6, md: 8 }} color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        Each and every errand is fulfilled within 20 minutes of the scheduled hour. 
                        Implying that orders will only be fulfilled within the preferred schedules.
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden" bg="white">
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={{ base: 6, md: 8 }}
                        bg={isExpanded ? "rgba(107, 42, 143, 0.1)" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                            Does Boiboi offer only food delivery?
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        ) : (
                          <AddIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={{ base: 6, md: 8 }} px={{ base: 6, md: 8 }} color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        No, we also offer grocery delivery and errands service from your favorite local stores. 
                        No additional app downloads are required — search for the store and items of your choice 
                        directly within the Boiboi app.
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden" bg="white">
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={{ base: 6, md: 8 }}
                        bg={isExpanded ? "rgba(107, 42, 143, 0.1)" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                            Can I order with the app without using delivery service?
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        ) : (
                          <AddIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={{ base: 6, md: 8 }} px={{ base: 6, md: 8 }} color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        Yes, with <chakra.span fontWeight="700" color="brand.primary">BoiJump</chakra.span> you can! 
                        Select <chakra.span fontWeight="700" color="brand.primary">"Pickup"</chakra.span> as your delivery 
                        option when you place your order, and the store will prepare it for you to pick up without you having to queue up.
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg="white">
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={{ base: 6, md: 8 }}
                        bg={isExpanded ? "rgba(107, 42, 143, 0.1)" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                            What are the scheduled delivery periods?
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        ) : (
                          <AddIcon fontSize={{ base: "18px", md: "20px" }} color="brand.primary" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={{ base: 6, md: 8 }} px={{ base: 6, md: 8 }} color="gray.600" lineHeight="tall" fontSize={{ base: "md", md: "lg" }}>
                        The scheduled periods are <chakra.span fontWeight="700" color="brand.primary">10am, 12pm, 3pm, 6pm, 8pm</chakra.span>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Sticky mobile action bar */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={50} display={{ base: 'block', md: 'none' }}>
        <HStack spacing={3} p={4} bg="white" borderTop="1px solid" borderColor="gray.200" boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)">
          <Button as={chakra.a} href="/check-out" flex={1} bg="brand.primary" color="white" _hover={{ bg: "brand.primaryDark" }} borderRadius="lg" size="lg">Order Now</Button>
          <Button as={chakra.a} href="/dashboard/orders" flex={1} variant="outline" color="brand.primary" borderColor="brand.primary" _hover={{ bg: "brand.primary", color: "white" }} borderRadius="lg" size="lg">Track</Button>
        </HStack>
      </Box>

>>>>>>> 7b2dac5ad31857fb9988d7da9edc160c70241baf
      <Footer />
    </Box>
  );
}
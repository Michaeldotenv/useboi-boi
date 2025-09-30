"use client"
import { 
  Box, 
  Flex, 
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
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Card from "./components/Card";
import { Bs1CircleFill, Bs2CircleFill, Bs3CircleFill } from "react-icons/bs";
import { AddIcon, ArrowForwardIcon, MinusIcon } from "@chakra-ui/icons";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaApple, FaLocationArrow, FaRocket, FaClock, FaShieldAlt } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Head from "next/head";
import Carousel from "./components/Carousel";
import { api } from "@/lib/api";

type Vendor = { id: string; name: string; logoUrl?: string; coverImage?: string; rating?: number };
type Order = { id: string; status: string; createdAt?: string; vendorName?: string };


export default function LandingPage() {
  const router = useRouter();
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

  const scrollToFaqs = () => {
    const faqsSection = document.getElementById('FAQs');
    if (faqsSection) {
      faqsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box bg={bg}>
      <Head>
        <title>Boiboi | Food, Errands, and Local Stores near you</title>
        <meta name="description" content="Order from local stores, track deliveries, and run errands with Boiboi. Seamless checkout, real-time tracking, and location-based recommendations." />
        <meta property="og:title" content="Boiboi" />
        <meta property="og:description" content="Order from local stores, track deliveries, and run errands with Boiboi." />
        <meta property="og:type" content="website" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Boiboi",
              url: "https://useboiboi.com/",
              logo: "/Boiboi (Palatinate blue).png",
            })
          }}
        />
      </Head>
      <Navigation />

      {/* Hero with search and CTAs */}
      <Box 
        minH={{ base: "70vh", md: "80vh" }}
        bgGradient="linear(to-br, purple.600, purple.700)"
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" inset={0} opacity={0.15}>
          <Image src="/Pattern.png" alt="" width="100%" height="100%" objectFit="cover" />
        </Box>
        <Container maxW="container.xl" minH="inherit" display="flex" alignItems="center" py={{ base: 10, md: 16 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 12 }} alignItems="center" w="full">
            <VStack spacing={{ base: 5, md: 6 }} align={{ base: 'center', lg: 'start' }} textAlign={{ base: 'center', lg: 'left' }}>
              <Badge colorScheme="purple" variant="subtle" bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full">
                🚀 Now available on mobile
              </Badge>
              <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight={800} color="white" lineHeight="shorter">
                At your service
                <chakra.span display="block" color="purple.200">- boiboi</chakra.span>
              </Text>
              <Text color="purple.100" fontSize={{ base: 'md', md: 'lg' }} maxW="lg">
                Order from local stores, run errands, and track deliveries in one app.
              </Text>
              <Box w="full" maxW="xl" bg="white" borderRadius="2xl" overflow="hidden" boxShadow="2xl">
                <HStack>
                  <Box flex={1} px={4} py={3}>
                    <chakra.input placeholder="Search restaurants, stores, or items" width="100%" _placeholder={{ color: 'gray.500' }} />
                  </Box>
                  <Button colorScheme="purple" px={6} borderRadius={0}>Search</Button>
                </HStack>
              </Box>
              <HStack spacing={3} pt={2}>
                {['Pizza', 'Groceries', 'Pharmacy', 'Errands'].map((t) => (
                  <Badge key={t} bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full">{t}</Badge>
                ))}
              </HStack>
              <HStack spacing={3} pt={2} flexWrap="wrap">
                <Button as={chakra.a} href="/check-out" bg="white" color="purple.700" _hover={{ bg: 'gray.50' }} borderRadius="xl">Order Now</Button>
                <Button as={chakra.a} href="/dashboard/orders" colorScheme="purple" borderRadius="xl">Track Order</Button>
                <Button as={chakra.a} href="/dashboard/stores" variant="outline" colorScheme="whiteAlpha" borderColor="whiteAlpha.600" color="white" borderRadius="xl">Browse Stores</Button>
              </HStack>
            </VStack>
            <Box position="relative" display={{ base: 'none', lg: 'block' }}>
              <Box position="absolute" top="-6" right="-6" bottom="-6" left="-6" bg="whiteAlpha.200" borderRadius="3xl" transform="rotate(3deg)" />
              <Image src="/media04.png" alt="App" width="100%" height="auto" borderRadius="2xl" />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Location selector */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
        <HStack justify="space-between">
          <HStack>
            <Box p={2} bg="purple.50" borderRadius="lg">📍</Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" color="gray.500">Delivering to</Text>
              <Text fontWeight={600}>{coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : 'Use current location'}</Text>
            </VStack>
          </HStack>
          <Button size="sm" onClick={() => navigator.geolocation?.getCurrentPosition((pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }))}>
            {coords ? 'Update location' : 'Use my location'}
          </Button>
        </HStack>
      </Container>

      {/* Featured Stores */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <HStack justify="space-between" mb={{ base: 3, md: 4 }}>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" color="gray.900">Featured stores</Text>
          <Button as={chakra.a} href="/dashboard/stores" variant="link" colorScheme="purple">See all</Button>
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
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 5, md: 10 }}>
        <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="800" color="gray.900" mb={3}>Popular categories</Text>
        {/* Mobile horizontal scroller */}
        <HStack spacing={3} overflowX="auto" py={2} display={{ base: 'flex', md: 'none' }}>
          {(loading ? Array.from({ length: 8 }) : categoriesData).map((c: any, idx: number) => (
            <Card key={`m-${idx}`} minW="140px" variant="elevated" p={0} overflow="hidden">
              {loading ? (
                <Box h="80px" bg="gray.100" />
              ) : (
                <Box position="relative" h="80px" bg="gray.100">
                  <Image src={c.image} alt={c.name} width="100%" height="100%" objectFit="cover" />
                </Box>
              )}
              <Box p={2}>
                {loading ? <Box h="12px" w="70px" bg="gray.100" /> : <Text fontWeight={700} fontSize="sm">{c.name}</Text>}
              </Box>
            </Card>
          ))}
        </HStack>
        {/* Desktop grid */}
        <Box display={{ base: 'none', md: 'block' }}>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4}>
            {(loading ? Array.from({ length: 8 }) : categoriesData).map((c: any, idx: number) => (
              <Card key={idx} variant="elevated" p={0} overflow="hidden">
                {loading ? (
                  <Box h="128px" bg="gray.100" />
                ) : (
                  <Box position="relative" h="128px" bg="gray.100">
                    <Image src={c.image} alt={c.name} width="100%" height="100%" objectFit="cover" />
                  </Box>
                )}
                <Box p={3}>
                  {loading ? <Box h="16px" w="80px" bg="gray.100" /> : <Text fontWeight={700}>{c.name}</Text>}
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Container>

      {/* Promotional banners */}
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 10 }}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
          {['Save on first order', 'Schedule errands', 'Fast delivery'].map((t, i) => (
            <Box key={t} p={6} borderRadius="2xl" color="white" boxShadow="xl" as={motion.div} whileHover={{ y: -6 }}
              bgGradient={i === 0 ? 'linear(to-br, purple.600, fuchsia.600)' : i === 1 ? 'linear(to-br, teal.500, green.600)' : 'linear(to-br, orange.500, pink.500)'}>
              <Text fontWeight={800} fontSize="xl">{t}</Text>
              <Text mt={1} color="whiteAlpha.800">Exclusive deals and better scheduling.</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* Recent orders (if logged in) */}
      {me && (
        <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 5, md: 10 }}>
          <HStack justify="space-between" mb={3}>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800}>Your recent orders</Text>
            <Button as={chakra.a} href="/dashboard/orders" variant="link" colorScheme="purple">View all</Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {(orders.length ? orders : Array.from({ length: 3 })).map((o: any, idx: number) => (
              <Card key={idx} variant="elevated" p={4}>
                {o ? (
                  <>
                    <HStack justify="space-between">
                      <Text fontWeight={700}>{o.vendorName || 'Order'} <chakra.span color="gray.500" fontSize="xs">• {o.status}</chakra.span></Text>
                      <Badge>#{o.id?.slice?.(0,6) || '•••'}</Badge>
                    </HStack>
                    <Text mt={1} color="gray.600" fontSize="sm">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</Text>
                  </>
                ) : (
                  <Box h="64px" bg="gray.100" />
                )}
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      )}

      {/* App download with QR */}
      <Box py={{ base: 10, md: 16 }}>
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center" bg="gray.900" color="white" p={8} borderRadius="3xl">
            <VStack align="start" spacing={3}>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800}>Get the app</Text>
              <Text color="whiteAlpha.800">Download Boiboi for the best ordering and tracking experience.</Text>
              <HStack spacing={3}>
                <Button bg="white" color="gray.900">Play Store</Button>
                <Button bg="white" color="gray.900">App Store</Button>
              </HStack>
            </VStack>
            <SimpleGrid columns={2} spacing={4}>
              <Card variant="elevated" p={3} bg="white" color="gray.900">
                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://example.com/app/android')}`} alt="Android QR" width="100%" height="auto" />
                <Text mt={2} textAlign="center" fontSize="sm">Scan for Android</Text>
              </Card>
              <Card variant="elevated" p={3} bg="white" color="gray.900">
                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://example.com/app/ios')}`} alt="iOS QR" width="100%" height="auto" />
                <Text mt={2} textAlign="center" fontSize="sm">Scan for iOS</Text>
              </Card>
            </SimpleGrid>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        minH="100vh" 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        position="relative" 
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255,255,255,0.05)"
          opacity={0.3}
        />
        
        <Container maxW="container.xl" minH="100vh" display="flex" alignItems="center" py={{ base: 8, md: 16 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, md: 16 }} alignItems="center">
            {/* Left Content */}
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }}>
              <Badge 
                colorScheme="purple" 
                variant="subtle" 
                px={{ base: 3, md: 4 }} 
                py={{ base: 1, md: 2 }} 
                borderRadius="full"
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="600"
              >
                🚀 Now Available on Mobile
              </Badge>
              
              <Text 
                fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }} 
                fontWeight="800" 
                color="white"
                lineHeight="shorter"
                letterSpacing="-0.02em"
                px={{ base: 4, md: 0 }}
              >
                At your service
                <chakra.span display="block" color="purple.200">- boiboi</chakra.span>
              </Text>
              
              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }} 
                color="purple.100" 
                maxW={{ base: "100%", md: "500px" }}
                lineHeight="tall"
                px={{ base: 4, md: 0 }}
              >
                Experience seamless delivery, errands, and logistics services. 
                From groceries to packages, we've got you covered with reliable, 
                on-time service.
              </Text>
              
              <VStack spacing={3} pt={2} w={{ base: "100%", sm: "auto" }} px={{ base: 4, sm: 0 }}>
                <Button
                  leftIcon={<Image src={"/google-play.png"} width="18px" height="18px" alt=""/>}
                  size={{ base: "md", md: "lg" }}
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 4, md: 6 }}
                  fontWeight="600"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Play Store
                </Button>
                <Button
                  leftIcon={<Image src={"/apple-logo.png"} width="18px" height="18px" alt=""/>}
                  size={{ base: "md", md: "lg" }}
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 4, md: 6 }}
                  fontWeight="600"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Apple Store
                </Button>
              </VStack>
            </VStack>
            
            {/* Right Content - Image */}
            <Box position="relative" order={{ base: -1, lg: 0 }}>
              <Box
                position="absolute"
                top={{ base: "-10px", md: "-20px" }}
                left={{ base: "-10px", md: "-20px" }}
                right={{ base: "10px", md: "20px" }}
                bottom={{ base: "10px", md: "20px" }}
                bg="rgba(255,255,255,0.1)"
                borderRadius={{ base: "2xl", md: "3xl" }}
                transform="rotate(-3deg)"
                zIndex={0}
              />
              <Image 
                src={"/dGuy.png"} 
                alt="Delivery person with package"
                width="100%"
                maxW={{ base: "300px", sm: "400px", md: "500px", lg: "600px" }}
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

      {/* Features Section */}
      <Box py={{ base: 12, md: 20 }} bg="white">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 12, md: 16 }}>
            {/* Section Header */}
            <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
              <Badge colorScheme="purple" variant="subtle" px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>
                Our Services
              </Badge>
              <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }} fontWeight="800" color="gray.900" px={{ base: 4, md: 0 }}>
                Errands? We've got it handled!
              </Text>
              <Text fontSize={{ base: "md", sm: "lg", md: "xl" }} color="gray.600" maxW={{ base: "100%", md: "600px" }} px={{ base: 4, md: 0 }}>
                From groceries to packages, we handle all your delivery needs with reliable, on-time service.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 16 }} alignItems="center">
              {/* Features List */}
              <VStack spacing={{ base: 6, md: 8 }} align="start" order={{ base: 2, lg: 1 }}>
                <Card variant="elevated" p={{ base: 4, md: 6 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 4, md: 6 }} align="start">
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg="purple.100"
                      borderRadius="xl"
                      color="purple.600"
                      fontSize={{ base: "xl", md: "2xl" }}
                    >
                      <FaRocket />
                    </Box>
                    <VStack spacing={2} align="start">
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                        Send Us!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                        Whether it's picking up groceries, dropping off packages, or running any last-minute tasks, we handle it all.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>

                <Card variant="elevated" p={{ base: 4, md: 6 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 4, md: 6 }} align="start">
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg="blue.100"
                      borderRadius="xl"
                      color="blue.600"
                      fontSize={{ base: "xl", md: "2xl" }}
                    >
                      <FaClock />
                    </Box>
                    <VStack spacing={2} align="start">
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                        Plan ahead, and we'll take care of the rest!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                        Choose a time that works for you — whether it's today, tomorrow, next week, or any other day. We'll be there when you need us.
                      </Text>
                    </VStack>
                  </HStack>
                </Card>

                <Card variant="elevated" p={{ base: 4, md: 6 }} w="full" _hover={{ transform: "translateY(-4px)" }} transition="all 0.3s ease">
                  <HStack spacing={{ base: 4, md: 6 }} align="start">
                    <Box
                      p={{ base: 3, md: 4 }}
                      bg="green.100"
                      borderRadius="xl"
                      color="green.600"
                      fontSize={{ base: "xl", md: "2xl" }}
                    >
                      <FaShieldAlt />
                    </Box>
                    <VStack spacing={2} align="start">
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.900">
                        Reliable and stress-free!
                      </Text>
                      <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
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
                  bg="purple.50"
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


      {/* Food Delivery Section */}
      <Box py={{ base: 12, md: 20 }} bg="gray.50">
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 16 }} alignItems="center">
            {/* Feature Image */}
            <Box order={{ base: 2, lg: 1 }} position="relative">
              <Box
                position="absolute"
                top="-20px"
                left="-20px"
                right="20px"
                bottom="20px"
                bg="blue.50"
                borderRadius="3xl"
                transform="rotate(-3deg)"
                zIndex={0}
              />
              <Image 
                src={"/trackorder.jpg"} 
                alt="Food delivery tracking"
                width="100%"
                height="auto"
                borderRadius="2xl"
                position="relative"
                zIndex={1}
                _hover={{ transform: "scale(1.02)" }}
                transition="transform 0.3s ease"
              />
          </Box>

            {/* Content */}
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }} order={{ base: 1, lg: 2 }}>
              <Badge colorScheme="blue" variant="subtle" px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>
                Food Delivery
              </Badge>
              
              <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} fontWeight="800" color="gray.900" px={{ base: 4, md: 0 }}>
                Discover, order, and track in the App!
              </Text>
              
              <VStack spacing={{ base: 4, md: 6 }} align="start" w="full" px={{ base: 4, md: 0 }}>
                <HStack spacing={{ base: 4, md: 6 }} align="start">
                  <Box
                    p={{ base: 2, md: 3 }}
                    bg="blue.100"
                    borderRadius="xl"
                    color="blue.600"
                    fontSize={{ base: "lg", md: "xl" }}
                  >
                    <FaLocationArrow />
                  </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700" color="gray.900">
                      Discover restaurants near you!
                    </Text>
                    <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                      Taste the flavours of the world with our wide selection of restaurants — be it your favourite local spot or a hidden gem.
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={{ base: 4, md: 6 }} align="start">
                  <Box
                    p={{ base: 2, md: 3 }}
                    bg="green.100"
                    borderRadius="xl"
                    color="green.600"
                    fontSize={{ base: "lg", md: "xl" }}
                  >
                    <FaShieldAlt />
                  </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700" color="gray.900">
                      Order and pay with ease!
                    </Text>
                    <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                      Just a few clicks and you're done! Place your order, choose your delivery time, and pay with your preferred method.
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={{ base: 4, md: 6 }} align="start">
                  <Box
                    p={{ base: 2, md: 3 }}
                    bg="purple.100"
                    borderRadius="xl"
                    color="purple.600"
                    fontSize={{ base: "lg", md: "xl" }}
                  >
                    <FaClock />
                  </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700" color="gray.900">
                      Track your order!
                    </Text>
                    <Text color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                      Stay informed with real-time updates. Track your food from preparation to your doorstep, knowing exactly when it will arrive.
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              <Button
                size={{ base: "md", md: "lg" }}
                colorScheme="blue"
                rightIcon={<ArrowForwardIcon />}
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.3s ease"
                borderRadius="xl"
                px={{ base: 6, md: 8 }}
                py={{ base: 4, md: 6 }}
                fontWeight="600"
                w={{ base: "100%", sm: "auto" }}
              >
                Order food online
              </Button>
            </VStack>
          </SimpleGrid>
        </Container>
          </Box>

      {/* Business Logistics Section */}
      <Box py={20} bg="white" display={{ base: 'none', md: 'block' }}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            {/* Content */}
            <VStack spacing={8} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }}>
              <Badge colorScheme="green" variant="subtle" px={4} py={2} borderRadius="full">
                Business Solutions
              </Badge>
              
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="800" color="gray.900">
                Simplify your business logistics!
              </Text>
              
              <VStack spacing={6} align="start" w="full">
                <HStack spacing={6} align="start">
                  <Box
                    p={3}
                    bg="green.100"
                    borderRadius="xl"
                    color="green.600"
                    fontSize="xl"
                  >
                    <FaRocket />
              </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize="lg" fontWeight="700" color="gray.900">
                      Focus on growth, we'll handle the rest!
                    </Text>
                    <Text color="gray.600" lineHeight="tall">
                      Join the many businesses using our scheduled errand services to streamline deliveries and simplify operations.
                    </Text>
                  </VStack>
            </HStack>

                <HStack spacing={6} align="start">
                  <Box
                    p={3}
                    bg="blue.100"
                    borderRadius="xl"
                    color="blue.600"
                    fontSize="xl"
                  >
                    <FaShieldAlt />
              </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize="lg" fontWeight="700" color="gray.900">
                      Detailed insights at your fingertips!
                    </Text>
                    <Text color="gray.600" lineHeight="tall">
                      Track your errands, delivery schedules, and performance data to optimize your business processes and improve efficiency.
                    </Text>
                  </VStack>
            </HStack>

                <HStack spacing={6} align="start">
                  <Box
                    p={3}
                    bg="purple.100"
                    borderRadius="xl"
                    color="purple.600"
                    fontSize="xl"
                  >
                    <FaClock />
              </Box>
                  <VStack spacing={2} align="start">
                    <Text fontSize="lg" fontWeight="700" color="gray.900">
                      Reliable logistics, tailored to your needs!
                    </Text>
                    <Text color="gray.600" lineHeight="tall">
                      No need to worry about managing multiple tasks. Let us handle the pickups, deliveries, and errands while you focus on running your business smoothly.
                    </Text>
                  </VStack>
            </HStack>
              </VStack>

              <Button
                size="lg"
                colorScheme="green"
                rightIcon={<ArrowForwardIcon />}
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.3s ease"
                borderRadius="xl"
                px={8}
                py={6}
                fontWeight="600"
              >
                Learn more
              </Button>
            </VStack>

            {/* Feature Image */}
            <Box order={{ base: 2, lg: 1 }} position="relative">
              <Box
                position="absolute"
                top="-20px"
                right="-20px"
                left="20px"
                bottom="20px"
                bg="green.50"
                borderRadius="3xl"
                transform="rotate(3deg)"
                zIndex={0}
              />
              <Image 
                src={"/logistics.jpg"} 
                alt="Business logistics illustration"
                width="100%"
                height="auto"
                borderRadius="2xl"
                position="relative"
                zIndex={1}
                _hover={{ transform: "scale(1.02)" }}
                transition="transform 0.3s ease"
              />
          </Box>
          </SimpleGrid>
        </Container>
        </Box>

      {/* FAQ Section */}
      <Box py={{ base: 12, md: 20 }} bg="gray.50" id="FAQs" display={{ base: 'none', md: 'block' }}>
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 12, md: 16 }}>
            <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
              <Badge colorScheme="purple" variant="subtle" px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>
                FAQ
              </Badge>
              <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} fontWeight="800" color="gray.900" px={{ base: 4, md: 0 }}>
                Frequently Asked Questions
              </Text>
              <Text fontSize={{ base: "md", sm: "lg", md: "xl" }} color="gray.600" maxW={{ base: "100%", md: "600px" }} px={{ base: 4, md: 0 }}>
                Everything you need to know about our services
              </Text>
            </VStack>

            <Box maxW="4xl" w="full">
              <Accordion allowToggle>
                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={{ base: 4, md: 6 }}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700" color="gray.900">
                            How does this work?
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon fontSize={{ base: "16px", md: "18px" }} color="purple.500" />
                        ) : (
                          <AddIcon fontSize={{ base: "16px", md: "18px" }} color="purple.500" />
                        )}
                      </AccordionButton>
                      <AccordionPanel pb={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }} color="gray.600" lineHeight="tall" fontSize={{ base: "sm", md: "md" }}>
                        Each and every errand is fulfilled within 20 minutes of the scheduled hour. 
                        Implying that orders will only be fulfilled within the preferred schedules.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            Does Boiboi Food offer only food delivery?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        No, we also offer grocery delivery and errands service from your favorite local stores. 
                        No additional app downloads are required — search for the store and items of your choice 
                        directly within the Boiboi Food delivery app.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            Can I order with the app without having to use the delivery service?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        Yes, with <chakra.span fontWeight="900" color="purple.600">BoiJump</chakra.span> you can! 
                        Select <chakra.span fontWeight="900" color="purple.600">"Pickup"</chakra.span> as your delivery 
                        option when you place your order, and the store will prepare it for you to pick up without you having to queue up.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            How long does it take to complete an order?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        The duration of order completion is based on the customer's requirements. 
                        We will always communicate with our customers when their task(s) is completed.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            What are the scheduled delivery periods?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        The scheduled periods are <chakra.span fontWeight="900" color="purple.600">10am, 12pm, 3pm, 6pm, 8pm</chakra.span>
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" mb={4} overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            Are there extra charges?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        We provide the cost of our services upfront. However, if miscellaneous charges come up 
                        in the process of executing the errand task, we will update the price and inform you about the changes.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>

                <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden">
        {({ isExpanded }) => (
        <>
                      <AccordionButton 
                        _hover={{ bg: "gray.50" }} 
                        p={6}
                        bg={isExpanded ? "purple.50" : "white"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            What if I decide to cancel a request?
                          </Text>
              </Box>
              {isExpanded ? (
                          <MinusIcon fontSize="18px" color="purple.500" />
              ) : (
                          <AddIcon fontSize="18px" color="purple.500" />
              )}
            </AccordionButton>
                      <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                        Once we receive your order and assign and dispatch a delivery hero to the pickup point, 
                        we can no longer refund the cost to the customer. However, if canceled before dispatch, 
                        refunds come with a 20% deduction.
          </AccordionPanel>
        </>
        )}
        </AccordionItem>
      </Accordion>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 12, md: 20 }} bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" position="relative" overflow="hidden" display={{ base: 'none', md: 'block' }}>
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255,255,255,0.05)"
          opacity={0.3}
        />
        
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 16 }} alignItems="center">
            {/* Content */}
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }}>
              <Badge 
                colorScheme="purple" 
                variant="subtle" 
                px={{ base: 3, md: 4 }} 
                py={{ base: 1, md: 2 }} 
                borderRadius="full"
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="600"
                bg="rgba(255,255,255,0.2)"
                color="white"
              >
                📱 Download Now
              </Badge>
              
              <Text 
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }} 
                fontWeight="800" 
                color="white"
                lineHeight="shorter"
                px={{ base: 4, md: 0 }}
              >
                At your service
                <chakra.span display="block" color="purple.200">- boiboi</chakra.span>
              </Text>
              
              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }} 
                color="purple.100" 
                maxW={{ base: "100%", md: "500px" }}
                lineHeight="tall"
                px={{ base: 4, md: 0 }}
              >
                Available for iOS and Android devices. Experience seamless delivery and errands services on the go.
              </Text>
              
              <VStack spacing={3} pt={2} w={{ base: "100%", sm: "auto" }} px={{ base: 4, sm: 0 }}>
                <Button
                  leftIcon={<Image src={"/google-play.png"} width="18px" height="18px" alt=""/>}
                  size={{ base: "md", md: "lg" }}
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 4, md: 6 }}
                  fontWeight="600"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Play Store
                </Button>
                <Button
                  leftIcon={<Image src={"/apple-logo.png"} width="18px" height="18px" alt=""/>}
                  size={{ base: "md", md: "lg" }}
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s ease"
                  borderRadius="xl"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 4, md: 6 }}
                  fontWeight="600"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Apple Store
                </Button>
              </VStack>
            </VStack>
            
            {/* Image */}
            <Box position="relative" order={{ base: -1, lg: 0 }}>
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
                maxW={{ base: "250px", sm: "350px", md: "450px", lg: "500px" }}
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

      {/* Footer */}
      {/* Sticky mobile action bar */}
      <Box position="fixed" bottom={0} left={0} right={0} zIndex={50} display={{ base: 'block', md: 'none' }}>
        <HStack spacing={3} p={3} bg="white" borderTop="1px solid" borderColor="gray.200">
          <Button as={chakra.a} href="/check-out" flex={1} colorScheme="purple" borderRadius="lg">Order Now</Button>
          <Button as={chakra.a} href="/dashboard/orders" flex={1} variant="outline" colorScheme="purple" borderRadius="lg">Track</Button>
        </HStack>
      </Box>

      <Footer />
            </Box>
  );
}

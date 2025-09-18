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
import Wrapper from "./components/Wrapper";
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


export default function LandingPage() {
  const router = useRouter();
  const bg = useColorModeValue("gray.50", "gray.900");

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
      <Navigation />

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
      <Box py={20} bg="white">
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
      <Box py={{ base: 12, md: 20 }} bg="gray.50" id="FAQs">
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
      <Box py={{ base: 12, md: 20 }} bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" position="relative" overflow="hidden">
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
      <Footer />
            </Box>
  );
}

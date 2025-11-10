"use client";
import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  chakra,
  Icon,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { FaLocationArrow, FaClock, FaShieldAlt, FaStar, FaFire, FaUtensils, FaRocket } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

export default function FoodDeliverySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: FaLocationArrow,
      title: "Discover restaurants near you!",
      desc: "Browse hundreds of local favorites and hidden gems with smart recommendations.",
      bg: "purple.50",
      color: "purple.600",
      gradient: "linear(to-br, purple.400, purple.600)",
    },
    {
      icon: FaShieldAlt,
      title: "Order and pay with ease!",
      desc: "Seamless checkout with multiple payment options. Fast, secure, and hassle-free.",
      bg: "pink.50",
      color: "pink.600",
      gradient: "linear(to-br, pink.400, pink.600)",
    },
    {
      icon: FaClock,
      title: "Track your order live!",
      desc: "Real-time updates from kitchen to doorstep. Know exactly when your food arrives.",
      bg: "blue.50",
      color: "blue.600",
      gradient: "linear(to-br, blue.400, blue.600)",
    },
  ];

  return (
    <Box
      ref={containerRef}
      py={{ base: 20, md: 28 }}
      bg="white"
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      <MotionBox
        position="absolute"
        top="5%"
        left="-10%"
        w={{ base: "300px", md: "500px" }}
        h={{ base: "300px", md: "500px" }}
        bgGradient="radial(purple.300, transparent)"
        filter="blur(80px)"
        opacity={0.5}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <MotionBox
        position="absolute"
        bottom="10%"
        right="-10%"
        w={{ base: "350px", md: "600px" }}
        h={{ base: "350px", md: "600px" }}
        bgGradient="radial(fuchsia.300, transparent)"
        filter="blur(90px)"
        opacity={0.4}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Dots Pattern */}
      {[...Array(15)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          w="6px"
          h="6px"
          bg="purple.300"
          borderRadius="full"
          top={`${Math.random() * 100}%`}
          left={`${Math.random() * 100}%`}
          opacity={0.3}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, lg: 20 }} alignItems="center">
          {/* Image Section */}
          <MotionBox
            order={{ base: 2, lg: 1 }}
            position="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={imageVariants}
          >
            {/* Decorative Background Elements */}
            <MotionBox
              position="absolute"
              top="-6%"
              left="-6%"
              right="6%"
              bottom="6%"
              bgGradient="linear(to-br, purple.100, pink.100)"
              borderRadius="3xl"
              transform="rotate(-6deg)"
              zIndex={0}
              animate={{
                rotate: [-6, -8, -6],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <MotionBox
              position="absolute"
              top="-3%"
              left="-3%"
              right="3%"
              bottom="3%"
              bg="white"
              borderRadius="3xl"
              transform="rotate(-3deg)"
              zIndex={0}
              animate={{
                rotate: [-3, -5, -3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main Image */}
            <MotionBox
              position="relative"
              zIndex={1}
              borderRadius="2xl"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/trackorder.jpg"
                alt="Food delivery tracking"
                width="100%"
                height="auto"
                borderRadius="xl"
              />

              {/* Overlay gradient for better contrast */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="40%"
                bgGradient="linear(to-t, blackAlpha.600, transparent)"
                pointerEvents="none"
              />
            </MotionBox>

            {/* Floating Stats Badges */}
            <MotionBox
              position="absolute"
              top={{ base: "5%", md: "8%" }}
              right={{ base: "-4%", md: "-6%" }}
              bg="white"
              px={4}
              py={3}
              borderRadius="xl"
              border="1px solid"
              borderColor="orange.200"
              zIndex={2}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HStack spacing={2}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  bgGradient="linear(to-br, orange.400, orange.600)"
                  display="grid"
                  placeItems="center"
                  color="white"
                >
                  <Icon as={FaFire} />
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="800" color="gray.900">
                    Hot Deal
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    30% OFF
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>

            <MotionBox
              position="absolute"
              bottom={{ base: "8%", md: "12%" }}
              left={{ base: "-4%", md: "-8%" }}
              bg="white"
              px={4}
              py={3}
              borderRadius="xl"
              border="1px solid"
              borderColor="purple.200"
              zIndex={2}
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <HStack spacing={2}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  bgGradient="linear(to-br, purple.400, purple.600)"
                  display="grid"
                  placeItems="center"
                  color="white"
                >
                  <Icon as={FaStar} />
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="800" color="gray.900">
                    4.8★
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Top Rated
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          </MotionBox>

          {/* Content Section */}
          <MotionBox
            order={{ base: 1, lg: 2 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <VStack spacing={8} align={{ base: "center", lg: "start" }} textAlign={{ base: "center", lg: "left" }}>
              {/* Badge */}
              <MotionBox variants={itemVariants}>
                <Badge
                  bgGradient="linear(to-r, purple.50, pink.50)"
                  color="purple.700"
                  px={5}
                  py={2}
                  borderRadius="full"
                  fontWeight="700"
                  fontSize="sm"
                  border="1px solid"
                  borderColor="purple.200"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FaUtensils} />
                  Food Delivery
                </Badge>
              </MotionBox>

              {/* Heading */}
              <MotionBox variants={itemVariants}>
                <HStack spacing={3} align="center" flexWrap="wrap">
                  <Text
                    fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
                    fontWeight="800"
                    color="gray.900"
                    lineHeight="1.1"
                  >
                    Discover, order & track{" "}
                    <Box
                      as="span"
                      bgGradient="linear(to-r, purple.600, fuchsia.500)"
                      bgClip="text"
                    >
                      instantly
                    </Box>
                  </Text>
                  <Icon as={FaRocket} color="purple.500" boxSize={{ base: 6, md: 8 }} />
                </HStack>
              </MotionBox>

              {/* Feature Cards */}
              <VStack spacing={4} w="full" align="stretch">
                {features.map((feature, i) => (
                  <MotionBox key={i} variants={itemVariants}>
                    <MotionBox
                      p={5}
                      bg="gray.50"
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="gray.200"
                      whileHover={{
                        scale: 1.02,
                        borderColor: "purple.300",
                      }}
                      transition={{ duration: 0.3 }}
                      cursor="pointer"
                    >
                      <HStack spacing={4} align="start">
                        <MotionBox
                          p={3}
                          bg={feature.bg}
                          borderRadius="xl"
                          color={feature.color}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon as={feature.icon} w={5} h={5} />
                        </MotionBox>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="lg" fontWeight="700" color="gray.900">
                            {feature.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" lineHeight="tall">
                            {feature.desc}
                          </Text>
                        </VStack>
                      </HStack>
                    </MotionBox>
                  </MotionBox>
                ))}
              </VStack>


            </VStack>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
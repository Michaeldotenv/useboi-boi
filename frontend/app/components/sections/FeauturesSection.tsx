"use client";

import React from "react";
import {
  Box,
  Container,
  VStack,
  SimpleGrid,
  HStack,
  Text,
  Badge,
  Image,
  Icon,
} from "@chakra-ui/react";
import { FaRocket, FaClock, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

// Enhanced Card Component with glassmorphism
const Card: React.FC<React.ComponentProps<typeof Box>> = ({ children, ...rest }) => (
  <Box
    bg="white"
    backdropFilter="blur(10px)"
    borderRadius="2xl"
    p={{ base: 5, md: 7 }}
    boxShadow="0 8px 32px rgba(124, 58, 237, 0.08)"
    border="1px solid"
    borderColor="rgba(124, 58, 237, 0.1)"
    transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    position="relative"
    overflow="hidden"
    _before={{
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      bgGradient: "linear(to-r, purple.400, purple.600, fuchsia.500)",
      opacity: 0,
      transition: "opacity 0.3s ease",
    }}
    _hover={{
      transform: "translateY(-8px)",
      boxShadow: "0 20px 60px rgba(124, 58, 237, 0.15)",
      borderColor: "purple.200",
      _before: {
        opacity: 1,
      },
    }}
    {...rest}
  >
    {children}
  </Box>
);

// Framer motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
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

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const features = [
    {
      icon: FaRocket,
      title: "Send Us!",
      description: "Whether it's picking groceries, dropping packages, or running last-minute tasks — we handle it carefully and quickly.",
      gradient: "linear(to-br, purple.50, purple.100)",
      color: "purple.600",
    },
    {
      icon: FaClock,
      title: "Plan ahead — we'll do the rest",
      description: "Choose when you want your errands completed — today, tomorrow, or any date. We'll show up on time.",
      gradient: "linear(to-br, blue.50, purple.100)",
      color: "purple.600",
    },
    {
      icon: FaShieldAlt,
      title: "Reliable & Stress-free",
      description: "Schedule it once and relax — real-time tracking and verified couriers make every errand worry-free.",
      gradient: "linear(to-br, fuchsia.50, purple.100)",
      color: "purple.600",
    },
  ];

  return (
    <Box
      bg="linear-gradient(180deg, #f8f7ff 0%, #faf9ff 50%, #ffffff 100%)"
      position="relative"
      overflow="hidden"
      py={{ base: 16, md: 24 }}
    >
      {/* Animated Background Shapes */}
      <MotionBox
        position="absolute"
        top="10%"
        right="-5%"
        w="400px"
        h="400px"
        borderRadius="full"
        bgGradient="radial(purple.200, transparent)"
        opacity={0.3}
        filter="blur(60px)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <MotionBox
        position="absolute"
        bottom="20%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bgGradient="radial(fuchsia.200, transparent)"
        opacity={0.2}
        filter="blur(70px)"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.15, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <MotionVStack
          spacing={{ base: 12, md: 20 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Header Section */}
          <MotionVStack
            spacing={{ base: 4, md: 5 }}
            textAlign="center"
            variants={itemVariants}
            maxW="3xl"
            mx="auto"
          >
            <MotionBox
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Badge
                colorScheme="purple"
                variant="subtle"
                px={{ base: 4, md: 5 }}
                py={{ base: 2, md: 2.5 }}
                borderRadius="full"
                fontSize={{ base: "xs", md: "sm" }}
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="600"
                boxShadow="0 4px 14px rgba(124, 58, 237, 0.15)"
              >
                ✨ Our Services
              </Badge>
            </MotionBox>

            <Text
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="800"
              color="gray.900"
              lineHeight="1.1"
              px={{ base: 4, md: 0 }}
            >
              Errands?{" "}
              <Box
                as="span"
                bgGradient="linear(to-r, purple.600, fuchsia.500)"
                bgClip="text"
                display="inline-block"
              >
                We've got it handled!
              </Box>
            </Text>

            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="gray.600"
              lineHeight="tall"
              maxW="2xl"
              px={{ base: 4, md: 0 }}
            >
              From groceries to packages, we handle all your delivery needs with a reliable,
              punctual, and friendly courier network — designed for busy lives.
            </Text>
          </MotionVStack>

          {/* Main Content Grid */}
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 12, lg: 20 }}
            alignItems="center"
            w="full"
          >
            {/* Left: Feature Cards */}
            <MotionVStack
              spacing={{ base: 5, md: 6 }}
              align="stretch"
              order={{ base: 2, lg: 1 }}
              variants={containerVariants}
            >
              {features.map((feature, idx) => (
                <MotionBox key={idx} variants={itemVariants}>
                  <Card>
                    <HStack spacing={{ base: 4, md: 6 }} align="start">
                      <MotionBox
                        minW="64px"
                        minH="64px"
                        display="grid"
                        placeItems="center"
                        borderRadius="xl"
                        bgGradient={feature.gradient}
                        boxShadow="0 8px 24px rgba(124, 58, 237, 0.12)"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon as={feature.icon} w={6} h={6} color={feature.color} />
                      </MotionBox>

                      <VStack spacing={2} align="start" flex={1}>
                        <Text
                          fontSize={{ base: "lg", md: "xl" }}
                          fontWeight="700"
                          color="gray.900"
                        >
                          {feature.title}
                        </Text>
                        <Text
                          color="gray.600"
                          lineHeight="tall"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {feature.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card>
                </MotionBox>
              ))}
            </MotionVStack>

            {/* Right: Image Section with Floating Elements */}
            <MotionBox
              position="relative"
              order={{ base: 1, lg: 2 }}
              display="flex"
              justifyContent="center"
              alignItems="center"
              variants={imageVariants}
              h={{ base: "400px", md: "500px", lg: "600px" }}
            >
              {/* Animated Glow Background */}
              <MotionBox
                position="absolute"
                w={{ base: "300px", md: "450px" }}
                h={{ base: "300px", md: "450px" }}
                bgGradient="radial(purple.300, purple.100, transparent)"
                borderRadius="full"
                filter="blur(50px)"
                opacity={0.4}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
                zIndex={0}
              />

              {/* Decorative Card Behind */}
              <MotionBox
                position="absolute"
                w={{ base: "280px", md: "420px", lg: "500px" }}
                h={{ base: "350px", md: "500px", lg: "580px" }}
                bg="white"
                borderRadius="3xl"
                transform="rotate(4deg)"
                zIndex={1}
                boxShadow="0 30px 90px rgba(124, 58, 237, 0.12)"
                border="2px solid"
                borderColor="purple.100"
                animate={{
                  rotate: [4, 6, 4],
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
                zIndex={2}
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="0 25px 70px rgba(124, 58, 237, 0.2)"
                maxW={{ base: "260px", md: "380px", lg: "460px" }}
                border="4px solid white"
                animate={floatingAnimation}
              >
                <Image
                  src="/senderrand1.jpg"
                  alt="Errand service"
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  borderRadius="xl"
                />
              </MotionBox>

              {/* Floating Stat Badge 1 */}
              <MotionBox
                position="absolute"
                top={{ base: 4, md: 8 }}
                left={{ base: -2, md: -4 }}
                bg="white"
                px={4}
                py={3}
                borderRadius="xl"
                boxShadow="0 12px 40px rgba(124, 58, 237, 0.15)"
                border="1px solid"
                borderColor="purple.100"
                zIndex={3}
                animate={{
                  y: [0, -8, 0],
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <HStack spacing={3}>
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="lg"
                    display="grid"
                    placeItems="center"
                    bgGradient="linear(to-br, purple.600, fuchsia.500)"
                    color="white"
                  >
                    <FaRocket size={20} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="gray.900">
                      2M+
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                      Happy users
                    </Text>
                  </VStack>
                </HStack>
              </MotionBox>

              {/* Floating Stat Badge 2 */}
              <MotionBox
                position="absolute"
                bottom={{ base: 6, md: 10 }}
                right={{ base: -2, md: -6 }}
                bg="white"
                px={4}
                py={3}
                borderRadius="xl"
                boxShadow="0 12px 40px rgba(124, 58, 237, 0.15)"
                border="1px solid"
                borderColor="purple.100"
                zIndex={3}
                animate={{
                  y: [0, 8, 0],
                  x: [0, -4, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <HStack spacing={3}>
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="lg"
                    display="grid"
                    placeItems="center"
                    bgGradient="linear(to-br, purple.600, fuchsia.500)"
                    color="white"
                  >
                    <FaClock size={20} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontSize="lg" fontWeight="800" color="gray.900">
                      30 min
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                      Avg delivery
                    </Text>
                  </VStack>
                </HStack>
              </MotionBox>

              {/* Floating Check Badge */}
              <MotionBox
                position="absolute"
                top={{ base: "40%", md: "45%" }}
                right={{ base: -4, md: -10 }}
                bg="green.500"
                color="white"
                p={3}
                borderRadius="full"
                boxShadow="0 8px 30px rgba(72, 187, 120, 0.3)"
                zIndex={3}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Icon as={FaCheckCircle} w={6} h={6} />
              </MotionBox>
            </MotionBox>
          </SimpleGrid>
        </MotionVStack>
      </Container>
    </Box>
  );
}
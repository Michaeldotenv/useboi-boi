"use client"
import { Box, Container, SimpleGrid, VStack, HStack, Text, Badge, Button, Image, Icon } from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"
import { FaLocationArrow, FaClock, FaShieldAlt, FaStar, FaFire } from "react-icons/fa"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionImage = motion(Image)

export default function FoodDeliverySection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

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
  }

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
  }

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
  ]

  return (
    <Box
      ref={containerRef}
      py={{ base: 20, md: 28 }}
      bgGradient="linear(to-br, #faf5ff, #f3e8ff, #fae8ff)"
      position="relative"
      overflow="hidden"
    >
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
            <MotionBox
              position="absolute"
              top={{ base: "5%", md: "8%" }}
              right={{ base: "-4%", md: "-6%" }}
              bg="white"
              px={4}
              py={3}
              borderRadius="xl"
              boxShadow="0 12px 40px rgba(124, 58, 237, 0.2)"
              border="2px solid"
              borderColor="purple.100"
              zIndex={2}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
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
                  boxShadow="0 4px 12px rgba(245, 158, 11, 0.3)"
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
              boxShadow="0 12px 40px rgba(124, 58, 237, 0.2)"
              border="2px solid"
              borderColor="purple.100"
              zIndex={2}
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Number.POSITIVE_INFINITY,
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
                  boxShadow="0 4px 12px rgba(124, 58, 237, 0.3)"
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
                  boxShadow="0 4px 14px rgba(124, 58, 237, 0.1)"
                >
                  Food Delivery
                </Badge>
              </MotionBox>

              {/* Heading */}
              <MotionBox variants={itemVariants}>
                <Text
                  fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
                  fontWeight="800"
                  color="gray.900"
                  lineHeight="1.1"
                >
                  Discover, order & track{" "}
                  <Box as="span" bgGradient="linear(to-r, purple.600, fuchsia.500)" bgClip="text">
                    instantly
                  </Box>
                </Text>
              </MotionBox>

              {/* Feature Cards */}
              <VStack spacing={4} w="full" align="stretch">
                {features.map((feature, i) => (
                  <MotionBox key={i} variants={itemVariants}>
                    <MotionBox
                      p={5}
                      bg="white"
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="purple.100"
                      boxShadow="0 4px 20px rgba(124, 58, 237, 0.08)"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 12px 40px rgba(124, 58, 237, 0.15)",
                        borderColor: "purple.200",
                        y: -4,
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
                          boxShadow="0 4px 12px rgba(124, 58, 237, 0.1)"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          minW="64px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
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

              {/* CTA Button */}
              <MotionBox variants={itemVariants} w={{ base: "full", sm: "auto" }}>
                <MotionButton
                  size="lg"
                  bgGradient="linear(to-r, purple.500, fuchsia.500)"
                  color="white"
                  px={10}
                  py={7}
                  borderRadius="xl"
                  fontWeight="700"
                  fontSize="lg"
                  boxShadow="0 8px 30px rgba(124, 58, 237, 0.3)"
                  rightIcon={<ArrowForwardIcon />}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 12px 40px rgba(124, 58, 237, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  _hover={{
                    bgGradient: "linear(to-r, purple.600, fuchsia.600)",
                  }}
                  w={{ base: "full", sm: "auto" }}
                >
                  Order food online
                </MotionButton>
              </MotionBox>
            </VStack>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

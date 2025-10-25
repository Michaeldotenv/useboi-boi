"use client"
import { Box, Container, SimpleGrid, VStack, Text, Button, Image, chakra, HStack, Icon, Badge } from "@chakra-ui/react";
import { FaApple, FaGooglePlay, FaCheckCircle, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

export default function HeroWithImage() {
  return (
    <Box 
      bgGradient="linear(135deg, purple.600, purple.700, fuchsia.600)" 
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background Elements */}
      <MotionBox
        position="absolute"
        top="-20%"
        right="-10%"
        w={{ base: "400px", md: "700px" }}
        h={{ base: "400px", md: "700px" }}
        bgGradient="radial(fuchsia.400, transparent)"
        filter="blur(100px)"
        opacity={0.4}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <MotionBox
        position="absolute"
        bottom="-20%"
        left="-10%"
        w={{ base: "500px", md: "800px" }}
        h={{ base: "500px", md: "800px" }}
        bgGradient="radial(purple.400, transparent)"
        filter="blur(120px)"
        opacity={0.3}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid Pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        bgImage="radial-gradient(circle, white 1px, transparent 1px)"
        bgSize="30px 30px"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            bg="white"
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="0 30px 100px rgba(0, 0, 0, 0.3)"
            position="relative"
          >
            {/* Gradient Top Border */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="5px"
              bgGradient="linear(to-r, purple.400, fuchsia.400, purple.400)"
            />

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0}>
              {/* Left Content Section */}
              <Box p={{ base: 8, md: 12, lg: 14 }} position="relative">
                <VStack align="start" spacing={8}>
                  {/* Badge */}
                  <MotionBox
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge
                      bgGradient="linear(to-r, purple.50, fuchsia.50)"
                      color="purple.700"
                      px={5}
                      py={2}
                      fontWeight="700"
                      borderRadius="full"
                      fontSize="sm"
                      border="1px solid"
                      borderColor="purple.200"
                      boxShadow="0 4px 14px rgba(124, 58, 237, 0.1)"
                    >
                      🚀 Now on Mobile – Experience Speed
                    </Badge>
                  </MotionBox>

                  {/* Heading */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Text 
                      fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} 
                      fontWeight="800" 
                      color="gray.900" 
                      lineHeight="1.1"
                    >
                      Delivering Moments,
                      <chakra.span 
                        display="block" 
                        bgGradient="linear(to-r, purple.600, fuchsia.500)"
                        bgClip="text"
                      >
                        Not Just Packages.
                      </chakra.span>
                    </Text>
                  </MotionBox>

                  {/* Description */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" lineHeight="tall" maxW="520px">
                      From meals to errands, get it delivered effortlessly. Your city, your rhythm — 
                      powered by seamless logistics and real-time tracking.
                    </Text>
                  </MotionBox>

                  {/* Feature Highlights */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    w="full"
                  >
                    <HStack spacing={6} flexWrap="wrap">
                      {[
                        { icon: FaCheckCircle, text: "Fast Delivery" },
                        { icon: FaStar, text: "4.8★ Rated" },
                        { icon: FaCheckCircle, text: "2M+ Users" },
                      ].map((item, i) => (
                        <HStack key={i} spacing={2}>
                          <Icon as={item.icon} color="purple.600" w={4} h={4} />
                          <Text fontSize="sm" fontWeight="600" color="gray.700">
                            {item.text}
                          </Text>
                        </HStack>
                      ))}
                    </HStack>
                  </MotionBox>

                  {/* App Store Buttons */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    w="full"
                  >
                    <VStack spacing={3} w="full" maxW="480px">
                      <MotionButton
                        as="a"
                        // href="#"
                        size="lg"
                        w="full"
                        bg="purple.600"
                        color="white"
                        leftIcon={<Icon as={FaGooglePlay} w={5} h={5} />}
                        borderRadius="xl"
                        fontWeight="700"
                        boxShadow="0 8px 25px rgba(124, 58, 237, 0.3)"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 12px 35px rgba(124, 58, 237, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        _hover={{
                          bg: "purple.700"
                        }}
                      >
                        <VStack spacing={0} align="start" flex={1}>
                          <Text fontSize="xs" fontWeight="400" opacity={0.9}>Get it on</Text>
                          <Text fontSize="md" fontWeight="700">Google Play</Text>
                        </VStack>
                      </MotionButton>

                      <MotionButton
                        as="a"
                        // href="#"
                        size="lg"
                        w="full"
                        variant="outline"
                        borderColor="purple.600"
                        borderWidth="2px"
                        color="purple.600"
                        leftIcon={<Icon as={FaApple} w={6} h={6} />}
                        borderRadius="xl"
                        fontWeight="700"
                        whileHover={{ 
                          scale: 1.02,
                          // bg: "purple.50"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <VStack spacing={0} align="start" flex={1}>
                          <Text fontSize="xs" fontWeight="400">Download on the</Text>
                          <Text fontSize="md" fontWeight="700">App Store</Text>
                        </VStack>
                      </MotionButton>
                    </VStack>
                  </MotionBox>
                </VStack>
              </Box>

              {/* Right Image Section */}
              <Box 
                bg="gray.50" 
                p={{ base: 8, md: 12 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
              >
                {/* Decorative Background Elements */}
                <Box
                  position="absolute"
                  top="-20%"
                  right="-20%"
                  w="300px"
                  h="300px"
                  bgGradient="radial(purple.200, transparent)"
                  filter="blur(60px)"
                  opacity={0.4}
                />

                <Box
                  position="absolute"
                  bottom="-10%"
                  left="-10%"
                  w="250px"
                  h="250px"
                  bgGradient="radial(fuchsia.200, transparent)"
                  filter="blur(50px)"
                  opacity={0.3}
                />

                {/* Image Container */}
                <Box position="relative">
                  {/* Decorative Card Behind */}
                  <MotionBox
                    position="absolute"
                    top="-4%"
                    left="-4%"
                    right="4%"
                    bottom="4%"
                    bgGradient="linear(to-br, purple.100, fuchsia.100)"
                    borderRadius="3xl"
                    transform="rotate(-4deg)"
                    zIndex={0}
                    animate={{
                      rotate: [-4, -6, -4],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Main Image */}
                  <MotionBox
                    position="relative"
                    zIndex={1}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotateY: 0,
                      y: [0, -15, 0]
                    }}
                    transition={{
                      opacity: { duration: 0.8, delay: 0.4 },
                      scale: { duration: 0.8, delay: 0.4 },
                      rotateY: { duration: 0.8, delay: 0.4 },
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Image
                      src="/dGuy.png"
                      alt="Delivery person"
                      maxW={{ base: "280px", md: "360px", lg: "420px" }}
                      borderRadius="2xl"
                      boxShadow="0 25px 70px rgba(124, 58, 237, 0.25)"
                      border="4px solid white"
                    />
                  </MotionBox>

                  {/* Floating Badge 1 */}
                  <MotionBox
                    position="absolute"
                    top="10%"
                    left="-8%"
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
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <VStack spacing={0}>
                      <Text fontSize="2xl" fontWeight="800" color="purple.600">
                        30min
                      </Text>
                      <Text fontSize="xs" color="gray.600" fontWeight="600">
                        Avg Delivery
                      </Text>
                    </VStack>
                  </MotionBox>

                  {/* Floating Badge 2 */}
                  <MotionBox
                    position="absolute"
                    bottom="15%"
                    right="-8%"
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
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FaStar} color="orange.400" w={5} h={5} />
                      <VStack spacing={0} align="start">
                        <Text fontSize="lg" fontWeight="800" color="gray.900">
                          4.8
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          Rating
                        </Text> 
                      </VStack>
                    </HStack>
                  </MotionBox>
                </Box>
              </Box>
            </SimpleGrid>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
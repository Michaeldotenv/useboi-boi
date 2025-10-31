"use client"
import { Box, Container, SimpleGrid, VStack, HStack, Text, Button, Image, Icon, Badge } from "@chakra-ui/react";
import { FaApple, FaGooglePlay, FaQrcode, FaMobileAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function AppDownload() {
  return (
    <Box 
      py={{ base: 16, md: 24 }} 
      bgGradient="linear(to-br, gray.50, purple.50)"
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.03}
        bgImage="radial-gradient(circle, gray.400 1px, transparent 1px)"
        bgSize="30px 30px"
      />

      {/* Floating Gradient Orbs */}
      <MotionBox
        position="absolute"
        top="20%"
        right="-10%"
        w="400px"
        h="400px"
        bgGradient="radial(purple.200, transparent)"
        filter="blur(80px)"
        opacity={0.5}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box
            bg="white"
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="0 20px 80px rgba(124, 58, 237, 0.15)"
            border="1px solid"
            borderColor="purple.100"
            position="relative"
          >
            {/* Gradient Top Border */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, purple.400, fuchsia.400, purple.400)"
            />

            <SimpleGrid 
              columns={{ base: 1, lg: 2 }} 
              spacing={0}
            >
              {/* Left Content */}
              <Box
                bgGradient="linear(135deg, purple.600, purple.700)"
                color="white"
                p={{ base: 8, md: 12 }}
                position="relative"
                overflow="hidden"
              >
                {/* Background Pattern */}
                <Box
                  position="absolute"
                  inset={0}
                  opacity={0.1}
                  bgImage="radial-gradient(circle, white 1px, transparent 1px)"
                  bgSize="20px 20px"
                />

                {/* Floating Icon */}
                <MotionBox
                  position="absolute"
                  top="10%"
                  right="5%"
                  opacity={0.1}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon as={FaMobileAlt} w={32} h={32} />
                </MotionBox>

                <VStack align="start" spacing={6} position="relative" zIndex={1}>
                  <Badge
                    bg="whiteAlpha.300"
                    color="white"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontWeight="700"
                    fontSize="sm"
                    backdropFilter="blur(10px)"
                  >
                    📱 Download Now
                  </Badge>

                  <VStack align="start" spacing={3}>
                    <Text 
                      fontSize={{ base: '3xl', md: '4xl' }} 
                      fontWeight={800}
                      lineHeight="1.1"
                    >
                      Get the Boiboi App
                    </Text>
                    <Text 
                      color="purple.100" 
                      fontSize={{ base: 'md', md: 'lg' }}
                      lineHeight="tall"
                    >
                      Experience seamless ordering, real-time tracking, and exclusive deals. 
                      Available for iOS and Android.
                    </Text>
                  </VStack>

                  {/* App Store Buttons */}
                  <VStack spacing={3} w="full" pt={2}>
                    <Box as="a" href="#" w="full">
                      <MotionButton
                        size="lg"
                        w="full"
                        bg="white"
                        color="gray.900"
                        leftIcon={<Icon as={FaApple} w={6} h={6} />}
                        borderRadius="xl"
                        fontWeight="700"
                        boxShadow="lg"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        _hover={{
                          bg: "gray.50"
                        }}
                      >
                        <VStack spacing={0} align="start" flex={1}>
                          <Text fontSize="xs" fontWeight="400">Download on the</Text>
                          <Text fontSize="md" fontWeight="700">App Store</Text>
                        </VStack>
                      </MotionButton>
                    </Box>

                    <Box as="a" href="#" w="full">
                      <MotionButton
                        size="lg"
                        w="full"
                        bg="white"
                        color="gray.900"
                        leftIcon={<Icon as={FaGooglePlay} w={5} h={5} />}
                        borderRadius="xl"
                        fontWeight="700"
                        boxShadow="lg"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        _hover={{
                          bg: "gray.50"
                        }}
                      >
                        <VStack spacing={0} align="start" flex={1}>
                          <Text fontSize="xs" fontWeight="400">Get it on</Text>
                          <Text fontSize="md" fontWeight="700">Google Play</Text>
                        </VStack>
                      </MotionButton>
                    </Box>
                  </VStack>

                  {/* Stats */}
                  <HStack spacing={8} pt={4} divider={<Box h="30px" w="1px" bg="whiteAlpha.300" />}>
                    <VStack spacing={0} align="start">
                      <Text fontSize="2xl" fontWeight="800">2M+</Text>
                      <Text fontSize="xs" color="purple.200">Downloads</Text>
                    </VStack>
                    <VStack spacing={0} align="start">
                      <Text fontSize="2xl" fontWeight="800">4.8★</Text>
                      <Text fontSize="xs" color="purple.200">Rating</Text>
                    </VStack>
                    <VStack spacing={0} align="start">
                      <Text fontSize="2xl" fontWeight="800">50K+</Text>
                      <Text fontSize="xs" color="purple.200">Reviews</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Right QR Codes */}
              <Box
                bg="gray.50"
                p={{ base: 8, md: 12 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={6} w="full">
                  <VStack spacing={2} textAlign="center">
                    <Icon as={FaQrcode} w={8} h={8} color="purple.600" />
                    <Text fontSize="xl" fontWeight="700" color="gray.900">
                      Scan to Download
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Point your camera at the QR code
                    </Text>
                  </VStack>

                  <SimpleGrid columns={2} spacing={4} w="full" maxW="400px">
                    {/* iOS QR */}
                    <MotionBox
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        bg="white"
                        p={4}
                        borderRadius="2xl"
                        boxShadow="md"
                        border="2px solid"
                        borderColor="purple.100"
                        transition="all 0.3s ease"
                        _hover={{
                          borderColor: "purple.400",
                          boxShadow: "0 10px 30px rgba(124, 58, 237, 0.2)"
                        }}
                      >
                        <Box
                          p={3}
                          bg="gray.50"
                          borderRadius="xl"
                          mb={3}
                        >
                          <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://example.com/app/ios')}`} 
                            alt="iOS QR" 
                            width="100%" 
                            height="auto"
                            borderRadius="lg"
                          />
                        </Box>
                        <HStack justify="center" spacing={2}>
                          <Icon as={FaApple} color="gray.700" />
                          <Text fontSize="sm" fontWeight="700" color="gray.700">
                            iOS
                          </Text>
                        </HStack>
                      </Box>
                    </MotionBox>

                    {/* Android QR */}
                    <MotionBox
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        bg="white"
                        p={4}
                        borderRadius="2xl"
                        boxShadow="md"
                        border="2px solid"
                        borderColor="purple.100"
                        transition="all 0.3s ease"
                        _hover={{
                          borderColor: "purple.400",
                          boxShadow: "0 10px 30px rgba(124, 58, 237, 0.2)"
                        }}
                      >
                        <Box
                          p={3}
                          bg="gray.50"
                          borderRadius="xl"
                          mb={3}
                        >
                          <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://example.com/app/android')}`} 
                            alt="Android QR" 
                            width="100%" 
                            height="auto"
                            borderRadius="lg"
                          />
                        </Box>
                        <HStack justify="center" spacing={2}>
                          <Icon as={FaGooglePlay} color="gray.700" />
                          <Text fontSize="sm" fontWeight="700" color="gray.700">
                            Android
                          </Text>
                        </HStack>
                      </Box>
                    </MotionBox>
                  </SimpleGrid>

                  {/* Features List */}
                  <VStack spacing={3} pt={4} align="start" w="full">
                    {[
                      "Real-time order tracking",
                      "Exclusive in-app deals",
                      "Fast & secure checkout",
                      "Save favorite stores"
                    ].map((feature, i) => (
                      <HStack key={i} spacing={3}>
                        <Box
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg="purple.100"
                          display="grid"
                          placeItems="center"
                        >
                          <Box w="8px" h="8px" bg="purple.600" borderRadius="full" />
                        </Box>
                        <Text fontSize="sm" color="gray.700" fontWeight="600">
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
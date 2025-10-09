"use client";

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Container,
  Icon,
  useColorModeValue,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { FiShoppingCart, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function CheckOutPage() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #F2F2F7 0%, #E5E7EB 50%, #F9FAFB 100%)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(59, 23, 79, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(107, 42, 143, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Container maxW="container.xl" pt={{ base: 16, md: 24 }} pb={12} position="relative" zIndex={1}>
        <VStack spacing={{ base: 6, md: 8 }} align="center">
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={4}>
              <Flex 
                w={{ base: "80px", md: "100px" }} 
                h={{ base: "80px", md: "100px" }} 
                bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" 
                borderRadius="full" 
                align="center" 
                justify="center"
                boxShadow="0 20px 40px rgba(59, 23, 79, 0.3)"
              >
                <Icon as={FiShoppingCart} fontSize={{ base: "36px", md: "48px" }} color="white" />
              </Flex>
              
              <VStack spacing={2}>
                <Text 
                  fontSize={{ base: "2xl", md: "4xl" }} 
                  fontWeight="900" 
                  bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)" 
                  bgClip="text" 
                  color="transparent"
                  textAlign="center"
                >
                  Checkout
                </Text>
                <Badge
                  colorScheme="orange"
                  fontSize={{ base: "xs", md: "sm" }}
                  px={{ base: 2, md: 3 }}
                  py={1}
                  borderRadius="full"
                >
                  Coming Soon
                </Badge>
              </VStack>
            </VStack>
          </MotionBox>

          {/* Content */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(20px)"
            borderRadius="20px"
            p={{ base: 6, md: 8 }}
            border="1px solid rgba(255, 255, 255, 0.2)"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.08)"
            maxW="2xl"
            w="full"
          >
            <VStack spacing={{ base: 4, md: 6 }} align="center" textAlign="center">
              <Icon as={FiClock} fontSize={{ base: "40px", md: "48px" }} color="brand.primary" />
              
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="gray.800">
                We're Working on Something Great!
              </Text>
              
              <Text fontSize={{ base: "sm", md: "md" }} color="gray.600" lineHeight="1.7">
                Our dedicated checkout page is currently under development. For now, you can complete your purchase through the shopping cart page.
              </Text>

              <Box 
                bg="rgba(59, 23, 79, 0.05)" 
                p={{ base: 4, md: 6 }} 
                borderRadius="16px"
                w="full"
              >
                <VStack spacing={3} align="start">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600" color="brand.primary">
                    What's Coming:
                  </Text>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.primary" />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Enhanced checkout experience</Text>
                    </HStack>
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.primary" />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Multiple payment options</Text>
                    </HStack>
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.primary" />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Order tracking in real-time</Text>
                    </HStack>
                    <HStack>
                      <Box w="6px" h="6px" borderRadius="full" bg="brand.primary" />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">Saved delivery addresses</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}

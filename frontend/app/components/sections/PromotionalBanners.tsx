"use client"
import { Box, Container, SimpleGrid, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function PromotionalBanners() {
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 4, md: 10 }}>
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
        {['Save on first order', 'Schedule errands', 'Fast delivery'].map((t, i) => (
          <Box 
            key={t} 
            p={6} 
            borderRadius="2xl" 
            color="white" 
            boxShadow="xl" 
            as={motion.div} 
            whileHover={{ y: -6 }}
            bgGradient={
              i === 0 ? 'linear(to-br, purple.600, fuchsia.600)' : 
              i === 1 ? 'linear(to-br, teal.500, green.600)' : 
              'linear(to-br, orange.500, pink.500)'
            }
          >
            <Text fontWeight={800} fontSize="xl">{t}</Text>
            <Text mt={1} color="whiteAlpha.800">Exclusive deals and better scheduling.</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
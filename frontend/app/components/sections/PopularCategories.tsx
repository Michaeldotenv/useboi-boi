"use client"
import { Container, Text, Box, SimpleGrid, VStack, Badge, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);

const categoriesData = [
  { name: 'Foods', image: '/Food.png', color: 'orange.500', emoji: '🍔', gradient: 'linear(to-br, orange.400, orange.600)' },
  { name: 'Groceries', image: '/Groceries.png', color: 'green.500', emoji: '🛒', gradient: 'linear(to-br, green.400, green.600)' },
  { name: 'Pharmacy', image: '/pharmacy.png', color: 'blue.500', emoji: '💊', gradient: 'linear(to-br, blue.400, blue.600)' },
  { name: 'Errands', image: '/senderrand.jpg', color: 'purple.500', emoji: '📦', gradient: 'linear(to-br, purple.400, purple.600)' },
  { name: 'Electronics', image: '/Electronies.png', color: 'yellow.500', emoji: '📱', gradient: 'linear(to-br, yellow.400, yellow.600)' },
  { name: 'Fashion', image: '/Fashoin.png', color: 'pink.500', emoji: '👕', gradient: 'linear(to-br, pink.400, pink.600)' },
  { name: 'Snacks', image: '/snacks.jpeg', color: 'red.500', emoji: '🍿', gradient: 'linear(to-br, red.400, red.600)' },
  { name: 'More', image: '/image.webp', color: 'gray.500', emoji: '➕', gradient: 'linear(to-br, gray.400, gray.600)' },
];

type Props = {
  loading: boolean;
};

export default function PopularCategories({ loading }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
  };

  return (
    <Box
      bg="purple.600"
      position="relative"
      overflow="hidden"
      py={{ base: 16, md: 24 }}
    >
      {/* Animated Background Effects */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-5%"
        w={{ base: "300px", md: "600px" }}
        h={{ base: "300px", md: "600px" }}
        bgGradient="radial(whiteAlpha.200, transparent)"
        filter="blur(80px)"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-5%"
        w={{ base: "400px", md: "700px" }}
        h={{ base: "400px", md: "700px" }}
        bgGradient="radial(fuchsia.400, transparent)"
        filter="blur(100px)"
        opacity={0.6}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -80, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid Pattern Overlay */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        bgImage="radial-gradient(circle, white 1px, transparent 1px)"
        bgSize="40px 40px"
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          w={{ base: "4px", md: "6px" }}
          h={{ base: "4px", md: "6px" }}
          bg="whiteAlpha.400"
          borderRadius="full"
          top={`${Math.random() * 100}%`}
          left={`${Math.random() * 100}%`}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <VStack spacing={3} mb={{ base: 10, md: 14 }} textAlign="center">
            <Badge
              bg="whiteAlpha.300"
              color="white"
              px={5}
              py={2}
              borderRadius="full"
              fontWeight="700"
              fontSize="sm"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.400"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              ✨ Browse Categories
            </Badge>

            <Text
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="800"
              color="white"
              lineHeight="1.1"
              textShadow="0 4px 20px rgba(0,0,0,0.3)"
            >
              What would you like to order?
            </Text>

            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="purple.100"
              maxW="2xl"
            >
              Choose from our popular categories and get your favorites delivered fast
            </Text>
          </VStack>
        </MotionBox>

        {/* Categories Grid */}
        <MotionSimpleGrid
          columns={{ base: 2, md: 4, lg: 4 }}
          spacing={{ base: 4, md: 6 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {(loading ? Array.from({ length: 8 }) : categoriesData).map((c: any, idx: number) => (
            <MotionBox
              key={idx}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -8,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                position="relative"
                h={{ base: "160px", md: "200px" }}
                borderRadius="2xl"
                overflow="hidden"
                cursor="pointer"
                boxShadow="0 10px 40px rgba(0,0,0,0.3)"
                transition="all 0.3s ease"
                bg="white"
                _hover={{
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                {loading ? (
                  <Box w="full" h="full" bg="gray.200" />
                ) : (
                  <>
                    {/* Background Image with Gradient Overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgImage={`url(${c.image})`}
                      bgSize="cover"
                      bgPosition="center"
                      transition="transform 0.5s ease"
                      _groupHover={{
                        transform: 'scale(1.1)',
                      }}
                    />

                    {/* Gradient Overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient="linear(to-t, blackAlpha.800, blackAlpha.400, transparent)"
                    />

                    {/* Color Accent at Top */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient={c.gradient}
                    />

                    {/* Content */}
                    <Box
                      position="relative"
                      zIndex={1}
                      h="full"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      p={4}
                    >
                      {/* Emoji Badge */}
                      <Box
                        alignSelf="flex-end"
                        bg="whiteAlpha.200"
                        backdropFilter="blur(10px)"
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        display="grid"
                        placeItems="center"
                        fontSize="2xl"
                        boxShadow="0 4px 14px rgba(0,0,0,0.2)"
                      >
                        {c.emoji}
                      </Box>

                      {/* Category Name & Arrow */}
                      <VStack align="start" spacing={2}>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="800"
                          color="white"
                          textShadow="0 2px 10px rgba(0,0,0,0.5)"
                        >
                          {c.name}
                        </Text>

                        <Box
                          bg="whiteAlpha.300"
                          backdropFilter="blur(10px)"
                          w="36px"
                          h="36px"
                          borderRadius="lg"
                          display="grid"
                          placeItems="center"
                          color="white"
                          transition="all 0.3s ease"
                          _groupHover={{
                            bg: 'white',
                            color: c.color,
                            transform: 'translateX(4px)',
                          }}
                        >
                          <Icon as={FaArrowRight} />
                        </Box>
                      </VStack>
                    </Box>

                    {/* Hover Glow Effect */}
                    <MotionBox
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient={c.gradient}
                      opacity={0}
                      transition="opacity 0.3s ease"
                      _groupHover={{
                        opacity: 0.15,
                      }}
                    />
                  </>
                )}
              </Box>
            </MotionBox>
          ))}
        </MotionSimpleGrid>

        {/* Bottom CTA */}
        <MotionBox
          mt={{ base: 10, md: 14 }}
          textAlign="center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="purple.100"
            fontWeight="600"
          >
            Can't find what you're looking for?{" "}
            <Box
              as="span"
              color="white"
              textDecoration="underline"
              cursor="pointer"
              _hover={{ color: 'purple.200' }}
            >
              Browse all stores
            </Box>
          </Text>
        </MotionBox>
      </Container>
    </Box>
  );
}
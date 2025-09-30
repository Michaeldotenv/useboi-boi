"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  useBreakpointValue,
  VStack,
  Text,
  Flex,
  Spacer,
  Badge,
  Image,
  useColorModeValue,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselItem {
  id: string;
  content: ReactNode;
  image?: string;
  title?: string;
  price?: number;
  rating?: number;
  category?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  itemsPerView?: number;
  spacing?: number;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: string | number;
  variant?: 'default' | 'cards' | 'products' | 'stores';
  loading?: boolean;
  onItemClick?: (item: CarouselItem) => void;
}

export default function Carousel({
  items,
  itemsPerView = 3,
  spacing = 4,
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  height = 'auto',
  variant = 'default',
  loading = false,
  onItemClick
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  
  // Adjust items per view based on screen size
  const responsiveItemsPerView = isMobile ? 1 : isTablet ? 2 : itemsPerView;
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');

  const maxIndex = Math.max(0, items.length - responsiveItemsPerView);

  useEffect(() => {
    if (autoPlay && !isHovered && items.length > responsiveItemsPerView) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, isHovered, items.length, responsiveItemsPerView, maxIndex, autoPlayInterval]);

  const goToNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('en-NG', { 
        style: 'currency', 
        currency: 'NGN', 
        maximumFractionDigits: 0 
      }).format(value || 0);
    } catch {
      return `₦${Number(value || 0).toLocaleString()}`;
    }
  };

  const renderItem = (item: CarouselItem, index: number) => {
    if (loading) {
      return (
        <Box
          key={`skeleton-${index}`}
          flex={`0 0 ${100 / responsiveItemsPerView}%`}
          px={spacing / 2}
        >
          <Skeleton height={height} borderRadius="16px" />
          <SkeletonText mt="4" noOfLines={3} spacing="4" skeletonHeight="2" />
        </Box>
      );
    }

    switch (variant) {
      case 'products':
        return (
          <motion.div
            key={item.id}
            style={{
              flex: `0 0 ${100 / responsiveItemsPerView}%`,
              paddingLeft: spacing / 2,
              paddingRight: spacing / 2
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Box
              bg={cardBg}
              borderRadius="16px"
              border="1px solid"
              borderColor={borderColor}
              p={4}
              h="full"
              cursor="pointer"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 40px ${shadowColor}`,
                borderColor: 'brand.primary'
              }}
              onClick={() => onItemClick?.(item)}
            >
              <VStack align="stretch" spacing={3} h="full">
                {item.image && (
                  <Box
                    position="relative"
                    borderRadius="12px"
                    overflow="hidden"
                    h="200px"
                    bg="gray.100"
                  >
                    <Image
                      src={item.image}
                      alt={item.title || 'Product'}
                      w="full"
                      h="full"
                      objectFit="cover"
                      fallback={<Skeleton h="full" />}
                    />
                    {item.category && (
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme="purple"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {item.category}
                      </Badge>
                    )}
                  </Box>
                )}
                
                <VStack align="stretch" spacing={2} flex={1}>
                  {item.title && (
                    <Text
                      fontWeight={700}
                      color="text.primary"
                      fontSize="md"
                      noOfLines={2}
                    >
                      {item.title}
                    </Text>
                  )}
                  
                  {item.rating && (
                    <HStack spacing={1}>
                      <Icon as={FiStar} color="yellow.400" boxSize={3} />
                      <Text fontSize="sm" color="gray.600">
                        {item.rating.toFixed(1)}
                      </Text>
                    </HStack>
                  )}
                  
                  {item.price && (
                    <Text
                      fontWeight={700}
                      color="brand.primary"
                      fontSize="lg"
                    >
                      {formatCurrency(item.price)}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>
          </motion.div>
        );

      case 'stores':
        return (
          <motion.div
            key={item.id}
            style={{
              flex: `0 0 ${100 / responsiveItemsPerView}%`,
              paddingLeft: spacing / 2,
              paddingRight: spacing / 2
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Box
              bg={cardBg}
              borderRadius="16px"
              border="1px solid"
              borderColor={borderColor}
              p={4}
              h="full"
              cursor="pointer"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 20px 40px ${shadowColor}`,
                borderColor: 'brand.primary'
              }}
              onClick={() => onItemClick?.(item)}
            >
              <VStack align="stretch" spacing={3} h="full">
                {item.image && (
                  <Box
                    position="relative"
                    borderRadius="12px"
                    overflow="hidden"
                    h="150px"
                    bg="gray.100"
                  >
                    <Image
                      src={item.image}
                      alt={item.title || 'Store'}
                      w="full"
                      h="full"
                      objectFit="cover"
                      fallback={<Skeleton h="full" />}
                    />
                  </Box>
                )}
                
                <VStack align="stretch" spacing={2} flex={1}>
                  {item.title && (
                    <Text
                      fontWeight={700}
                      color="text.primary"
                      fontSize="lg"
                      noOfLines={1}
                    >
                      {item.title}
                    </Text>
                  )}
                  
                  {item.rating && (
                    <HStack spacing={1}>
                      <Icon as={FiStar} color="yellow.400" boxSize={3} />
                      <Text fontSize="sm" color="gray.600">
                        {item.rating.toFixed(1)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </Box>
          </motion.div>
        );

      default:
        return (
          <Box
            key={item.id}
            flex={`0 0 ${100 / responsiveItemsPerView}%`}
            px={spacing / 2}
          >
            {item.content}
          </Box>
        );
    }
  };

  if (loading || items.length === 0) {
    return (
      <Box w="full">
        <HStack spacing={spacing} overflow="hidden">
          {Array.from({ length: responsiveItemsPerView }).map((_, index) => renderItem({} as CarouselItem, index))}
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Carousel Container */}
      <Box
        ref={containerRef}
        overflow="hidden"
        borderRadius="16px"
        w="full"
      >
        <motion.div
          style={{
            display: 'flex',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(-${currentIndex * (100 / responsiveItemsPerView)}%)`,
            width: `${(items.length / responsiveItemsPerView) * 100}%`
          }}
          animate={{
            x: `-${currentIndex * (100 / responsiveItemsPerView)}%`
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          {items.map((item, index) => renderItem(item, index))}
        </motion.div>
      </Box>

      {/* Navigation Arrows */}
      {showArrows && items.length > responsiveItemsPerView && (
        <>
          <Button
            position="absolute"
            left={-4}
            top="50%"
            transform="translateY(-50%)"
            size="sm"
            borderRadius="full"
            bg="white"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            zIndex={2}
            onClick={goToPrevious}
            _hover={{
              bg: 'gray.50',
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: 'xl'
            }}
            transition="all 0.2s ease"
            display={{ base: 'none', md: 'flex' }}
          >
            <Icon as={FiChevronLeft} />
          </Button>

          <Button
            position="absolute"
            right={-4}
            top="50%"
            transform="translateY(-50%)"
            size="sm"
            borderRadius="full"
            bg="white"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            zIndex={2}
            onClick={goToNext}
            _hover={{
              bg: 'gray.50',
              transform: 'translateY(-50%) scale(1.1)',
              boxShadow: 'xl'
            }}
            transition="all 0.2s ease"
            display={{ base: 'none', md: 'flex' }}
          >
            <Icon as={FiChevronRight} />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && items.length > responsiveItemsPerView && (
        <Flex
          justify="center"
          mt={4}
          gap={2}
        >
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <Box
              key={index}
              w={2}
              h={2}
              borderRadius="full"
              bg={index === currentIndex ? 'brand.primary' : 'gray.300'}
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{
                bg: index === currentIndex ? 'brand.primaryDark' : 'gray.400',
                transform: 'scale(1.2)'
              }}
              onClick={() => goToSlide(index)}
            />
          ))}
        </Flex>
      )}

      {/* Mobile Swipe Instructions */}
      {isMobile && items.length > 1 && (
        <Text
          fontSize="xs"
          color="gray.500"
          textAlign="center"
          mt={2}
        >
          Swipe to explore more
        </Text>
      )}
    </Box>
  );
}

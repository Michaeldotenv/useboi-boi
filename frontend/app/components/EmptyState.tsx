"use client";

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaBox, FaBookmark, FaHeadset, FaUser, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal' | 'illustrated';
  iconType?: 'orders' | 'saved' | 'support' | 'profile' | 'cart' | 'error';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  variant = 'default',
  iconType,
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const titleColor = useColorModeValue('gray.900', 'white');
  const illustratedCircleBg = useColorModeValue('gray.100', 'gray.700');
  const defaultCircleBg = useColorModeValue('rgba(107, 42, 143, 0.1)', 'rgba(107, 42, 143, 0.3)');

  const getIconComponent = () => {
    if (iconType) {
      switch (iconType) {
        case 'orders':
          return FaBox;
        case 'saved':
          return FaBookmark;
        case 'support':
          return FaHeadset;
        case 'profile':
          return FaUser;
        case 'cart':
          return FaShoppingBag;
        case 'error':
          return FaExclamationTriangle;
        default:
          return FaBox;
      }
    }
    return null;
  };

  const IconComponent = getIconComponent();

  if (variant === 'minimal') {
    return (
      <Box textAlign="center" py={8}>
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="600" color={titleColor}>
            {title}
          </Text>
          <Text color={textColor} maxW="sm">
            {description}
          </Text>
          {actionText && onAction && (
            <Button bg="brand.primary" color="white" _hover={{ bg: "brand.primaryDark" }} onClick={onAction} mt={2}>
              {actionText}
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  if (variant === 'illustrated') {
    return (
      <Box textAlign="center" py={12}>
        <VStack spacing={6}>
          <Avatar
            size="2xl"
            bg={illustratedCircleBg}
            icon={IconComponent ? <Icon as={IconComponent} fontSize="48px" color="brand.primary" /> : undefined}
            src={icon}
            mb={4}
          />
          <VStack spacing={3}>
            <Text fontSize="xl" fontWeight="700" color={titleColor}>
              {title}
            </Text>
            <Text color={textColor} maxW="md" lineHeight="tall">
              {description}
            </Text>
            {actionText && onAction && (
              <Button
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.primaryDark", transform: 'translateY(-2px)' }}
                onClick={onAction}
                mt={4}
                size="lg"
                transition="all 0.3s ease"
              >
                {actionText}
              </Button>
            )}
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box textAlign="center" py={16}>
      <VStack spacing={6}>
        <Avatar
          size="xl"
          bg={defaultCircleBg}
          icon={IconComponent ? <Icon as={IconComponent} fontSize="40px" color="brand.primary" /> : undefined}
          src={icon}
        />
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="700" color={titleColor}>
            {title}
          </Text>
          <Text color={textColor} maxW="lg" lineHeight="tall" fontSize="md">
            {description}
          </Text>
          {actionText && onAction && (
            <Button
              bg="brand.primary"
              color="white"
              _hover={{ bg: "brand.primaryDark", transform: 'translateY(-2px)' }}
              onClick={onAction}
              mt={6}
              size="lg"
              px={8}
              transition="all 0.3s ease"
            >
              {actionText}
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default EmptyState;

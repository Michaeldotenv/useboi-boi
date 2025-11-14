"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  Portal,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownOption {
  label: string;
  value: string;
  icon?: any;
  description?: string;
}

interface MobileDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <Box position="relative" w="full">
      {label && (
        <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
          {label}
        </Text>
      )}
      
      {/* Trigger Button */}
      <Flex
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        bg="white"
        border="2px solid"
        borderColor={isOpen ? "purple.500" : "gray.200"}
        borderRadius="12px"
        p={3}
        cursor="pointer"
        align="center"
        justify="space-between"
        transition="all 0.2s"
        _hover={{ borderColor: "purple.300" }}
        _active={{ transform: "scale(0.98)" }}
      >
        <HStack spacing={2} flex={1}>
          {selectedOption?.icon && (
            <Icon as={selectedOption.icon} boxSize={5} color="purple.600" />
          )}
          <Text
            fontSize="sm"
            fontWeight="600"
            color={selectedOption ? "gray.900" : "gray.400"}
          >
            {selectedOption?.label || placeholder}
          </Text>
        </HStack>
        <Icon
          as={FiChevronDown}
          boxSize={5}
          color="gray.400"
          transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
          transition="transform 0.2s"
        />
      </Flex>

      {/* Dropdown Menu */}
      {isOpen && (
        <Portal>
          {/* Backdrop */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
            zIndex={1400}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <Box
            ref={dropdownRef}
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            bg="white"
            borderTopRadius="24px"
            boxShadow="0 -10px 40px rgba(0, 0, 0, 0.2)"
            zIndex={1401}
            maxH="70vh"
            overflowY="auto"
            animation="slideUp 0.3s ease-out"
            sx={{
              '@keyframes slideUp': {
                from: { transform: 'translateY(100%)' },
                to: { transform: 'translateY(0)' }
              }
            }}
          >
            {/* Handle Bar */}
            <Flex justify="center" pt={3} pb={2}>
              <Box w="40px" h="4px" bg="gray.300" borderRadius="full" />
            </Flex>

            {/* Header */}
            <Box px={4} pb={3} borderBottom="1px solid" borderColor="gray.100">
              <Text fontSize="lg" fontWeight="800" color="gray.900">
                {label || 'Select Option'}
              </Text>
            </Box>

            {/* Options */}
            <VStack spacing={0} align="stretch" p={2}>
              {options.map((option) => (
                <Flex
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  p={3}
                  borderRadius="12px"
                  cursor="pointer"
                  bg={value === option.value ? "purple.50" : "transparent"}
                  border="2px solid"
                  borderColor={value === option.value ? "purple.500" : "transparent"}
                  transition="all 0.2s"
                  _hover={{ bg: "gray.50" }}
                  _active={{ transform: "scale(0.98)" }}
                  align="center"
                  mb={1}
                >
                  {option.icon && (
                    <Flex
                      w={10}
                      h={10}
                      bg={value === option.value ? "purple.100" : "gray.100"}
                      borderRadius="10px"
                      align="center"
                      justify="center"
                      mr={3}
                    >
                      <Icon
                        as={option.icon}
                        boxSize={5}
                        color={value === option.value ? "purple.600" : "gray.600"}
                      />
                    </Flex>
                  )}
                  <Box flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color={value === option.value ? "purple.600" : "gray.900"}
                    >
                      {option.label}
                    </Text>
                    {option.description && (
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {option.description}
                      </Text>
                    )}
                  </Box>
                  {value === option.value && (
                    <Box
                      w={5}
                      h={5}
                      bg="purple.600"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box w={2} h={2} bg="white" borderRadius="full" />
                    </Box>
                  )}
                </Flex>
              ))}
            </VStack>

            {/* Safe area padding for mobile */}
            <Box h="env(safe-area-inset-bottom, 20px)" />
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default MobileDropdown;

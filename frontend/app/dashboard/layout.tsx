"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Box, 
  HStack, 
  Icon, 
  Link as CLink, 
  Text, 
  Flex,
  VStack,
  useBreakpointValue,
  Badge,
  Avatar,
  useColorModeValue
} from "@chakra-ui/react";
import { 
  FiHome, 
  FiShoppingBag, 
  FiCreditCard, 
  FiShoppingCart, 
  FiUser, 
  FiBell,
  FiMenu,
  FiX,
  FiShoppingBag as FiStore
} from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const mobileHeaderBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
  const mobileHeaderBorder = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(74, 85, 104, 0.6)");
  const mobileNavBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
  const mobileNavBorder = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(74, 85, 104, 0.6)");
  const mobileIconColor = useColorModeValue("gray.500", "gray.400");
  const mobileHoverBg = useColorModeValue("gray.100", "gray.700");
  const mobileTextColor = useColorModeValue("gray.500", "gray.400");
  const mobileTopBar = useColorModeValue("gray.300", "gray.600");
  const mobileHomeIndicator = useColorModeValue("gray.400", "gray.500");

  const navigationItems = [
    { href: "/dashboard", label: "Overview", icon: FiHome },
    { href: "/dashboard/orders", label: "Orders", icon: FiShoppingBag },
    { href: "/dashboard/wallet", label: "Wallet", icon: FiCreditCard },
    { href: "/dashboard/stores", label: "Stores", icon: FiStore },
    { href: "/dashboard/cart", label: "Cart", icon: FiShoppingCart },
    { href: "/dashboard/profile", label: "Profile", icon: FiUser },
    { href: "/dashboard/notifications", label: "Notifications", icon: FiBell },
  ];

  const TopLink = ({ href, label, icon: IconComponent }: { href: string; label: string; icon: any }) => {
    const isActive = pathname === href;
    
    return (
      <CLink
        as={Link}
        href={href}
        _hover={{ textDecoration: "none" }}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Box
          px={4}
          py={3}
          borderRadius="12px"
          bg={isActive ? "brand.primary" : "transparent"}
          color={isActive ? "white" : "gray.600"}
          fontWeight={isActive ? "600" : "500"}
          transition="all 0.3s ease"
          _hover={{ 
            bg: isActive ? "brand.primaryDark" : "gray.100", 
            color: isActive ? "white" : "brand.primary",
            transform: "translateY(-1px)",
            boxShadow: isActive ? "0 4px 12px rgba(82, 52, 229, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}
          display="flex"
          alignItems="center"
          gap={2}
          minW="120px"
          justifyContent={isMobile ? "center" : "flex-start"}
        >
          <Icon as={IconComponent} boxSize={5} />
          {!isMobile && <Text>{label}</Text>}
        </Box>
      </CLink>
    );
  };

  const active = (href: string) => pathname === href;

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Desktop Navigation */}
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        backdropFilter="blur(20px)"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
        display={{ base: "none", md: "block" }}
      >
        <Flex
          maxW="7xl"
          mx="auto"
          px={6}
          py={4}
          justify="space-between"
          align="center"
        >
          {/* Logo */}
          <Box>
            <Text fontSize="xl" fontWeight="700" color="brand.primary">
              BoiBoi
            </Text>
          </Box>

          {/* Navigation Links */}
          <HStack spacing={2}>
            {navigationItems.map((item) => (
              <TopLink 
                key={item.href}
                href={item.href} 
                label={item.label} 
                icon={item.icon}
              />
            ))}
          </HStack>

          {/* User Profile */}
          <HStack spacing={3}>
            <Badge
              bg="brand.primary"
              color="white"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="600"
            >
              Pro
            </Badge>
            <Avatar size="sm" name="User" bg="brand.primary" />
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Header - Chowdeck Style */}
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        display={{ base: "block", md: "none" }}
        px={5}
        py={4}
        pt="calc(env(safe-area-inset-top) + 1rem)"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      >
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
              BoiBoi
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="500">
              Good morning! 👋
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Box
              position="relative"
              cursor="pointer"
              p={2}
              borderRadius="12px"
              bg="gray.50"
              _hover={{ 
                transform: "scale(1.05)",
                bg: "gray.100"
              }}
              transition="all 0.2s ease"
            >
              <Icon as={FiBell} boxSize={5} color="gray.700" />
              <Box
                position="absolute"
                top="1px"
                right="1px"
                w="10px"
                h="10px"
                bg="red.500"
                borderRadius="full"
                border="2px solid white"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
              />
            </Box>
            <Avatar 
              size="md" 
              name="User" 
              bg="brand.primary"
              cursor="pointer"
              border="3px solid"
              borderColor="white"
              boxShadow="0 4px 12px rgba(82, 52, 229, 0.2)"
              _hover={{ 
                transform: "scale(1.05)",
                boxShadow: "0 6px 16px rgba(82, 52, 229, 0.3)"
              }}
              transition="all 0.2s ease"
            />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box 
        as="main" 
        pb={{ base: 24, md: 0 }} 
        px={{ base: 5, md: 6 }}
        py={{ base: 6, md: 6 }}
        bg="gray.50"
        minH="calc(100vh - 160px)"
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation - Chowdeck Style */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={20}
        bg="white"
        display={{ base: "block", md: "none" }}
        borderTop="1px solid"
        borderColor="gray.200"
        boxShadow="0 -4px 25px rgba(0, 0, 0, 0.15)"
        pb="env(safe-area-inset-bottom)"
      >
        <HStack
          justify="space-around"
          py={3}
          px={2}
          spacing={0}
          h="80px"
        >
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = active(item.href);
            const IconComponent = item.icon;
            
            return (
              <CLink 
                key={item.href}
                as={Link} 
                href={item.href} 
                _hover={{ textDecoration: "none" }}
                flex={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
              >
                <VStack spacing={1} align="center" h="100%" justify="center">
                  <Box
                    position="relative"
                    p={3}
                    borderRadius="16px"
                    bg={isActive ? "brand.primary" : "transparent"}
                    color={isActive ? "white" : "gray.400"}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _active={{
                      transform: "scale(0.9)"
                    }}
                    minW="50px"
                    minH="50px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={isActive ? "0 4px 12px rgba(82, 52, 229, 0.3)" : "none"}
                  >
                    <Icon as={IconComponent} boxSize={6} />
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <Box
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        w="8px"
                        h="8px"
                        bg="white"
                        borderRadius="full"
                        border="2px solid"
                        borderColor="brand.primary"
                        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                      />
                    )}
                  </Box>
                  
                  <Text 
                    fontSize="xs" 
                    color={isActive ? "brand.primary" : "gray.400"}
                    fontWeight={isActive ? "700" : "500"}
                    transition="all 0.3s ease"
                    textAlign="center"
                    lineHeight="tight"
                    letterSpacing="-0.01em"
                  >
                    {item.label}
                  </Text>
                </VStack>
              </CLink>
            );
          })}
        </HStack>
      </Box>
    </Box>
  );
}



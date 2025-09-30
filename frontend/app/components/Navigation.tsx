"use client";

import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  DrawerHeader,
  Image,
  VStack,
  IconButton,
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Avatar,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, SearchIcon, BellIcon } from "@chakra-ui/icons";
import { FiShoppingCart, FiUser, FiHeart, FiMapPin } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavigationProps {
  variant?: "default" | "transparent";
}

export default function Navigation({ variant = "default" }: NavigationProps) {
  const [navbarBg, setNavbarBg] = useState("white");
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  // Seamless responsive breakpoint values
  const logoSize = useBreakpointValue({
    base: { width: "240px", height: "68px" },
    xs: { width: "260px", height: "76px" },
    sm: { width: "280px", height: "80px" },
    md: { width: "300px", height: "86px" },
    lg: { width: "340px", height: "96px" },
    xl: { width: "380px", height: "108px" },
    "2xl": { width: "420px", height: "120px" },
  });

  const buttonSize = useBreakpointValue({
    base: "xs",
    xs: "sm", 
    sm: "sm",
    md: "sm",
    lg: "md",
    xl: "md",
    "2xl": "lg",
  });

  const showFullNav = useBreakpointValue({
    base: false,
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: true,
    "2xl": true,
  });

  const showPartialNav = useBreakpointValue({
    base: false,
    xs: false,
    sm: false,
    md: false,
    lg: true,
    xl: false,
    "2xl": false,
  });

  const showCTAButtons = useBreakpointValue({
    base: false,
    xs: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
    "2xl": true,
  });

  // Waitlist button label (must be a top-level hook usage)
  const waitlistLabel = useBreakpointValue({
    md: "Waitlist",
    lg: "Join Waitlist",
    xl: "Join Waitlist",
  });

  const headerPadding = useBreakpointValue({
    base: { py: 1, px: 2 },
    xs: { py: 1, px: 3 },
    sm: { py: 2, px: 4 },
    md: { py: 2, px: 5 },
    lg: { py: 3, px: 6 },
    xl: { py: 3, px: 8 },
    "2xl": { py: 3, px: 8 },
  });

  useEffect(() => {
    const handleScroll = () => {
      const showBg = window.scrollY > 50;
      setIsScrolled(showBg);
      if (variant === "transparent") {
        setNavbarBg(showBg ? "white" : "transparent");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [variant]);

  const navigationItems = [
    { label: "Home", href: "/", onClick: () => router.push("/") },
    { label: "About Us", href: "/about-us", onClick: () => router.push("/about-us") },
    { label: "Contact", href: "#contact", onClick: () => scrollToSection("contact-section") },
    { label: "Blog", href: "/blog", onClick: () => router.push("/blog") },
    { label: "FAQs", href: "#faqs", onClick: () => scrollToSection("FAQs") },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    onClose();
  };

  const handleLogin = () => {
    router.push("/login");
    onClose();
  };

  const handleSignUp = () => {
    router.push("/sign-up");
    onClose();
  };

  return (
    <>
      <Box
        position="sticky"
        zIndex="1000"
        top="0"
        bg={isScrolled ? "rgba(255, 255, 255, 0.95)" : "white"}
        backdropFilter={isScrolled ? "blur(20px)" : "none"}
        borderBottom="1px solid"
        borderColor={isScrolled ? "rgba(226, 232, 240, 0.8)" : "gray.100"}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        py={3}
        px={6}
        boxShadow={isScrolled ? "0 8px 32px -8px rgba(0, 0, 0, 0.12)" : "0 4px 16px -4px rgba(0, 0, 0, 0.06)"}
        w="100%"
        minH="72px"
      >
        <Flex
          maxW="7xl"
          mx="auto"
          justify="space-between"
          align="center"
          gap={4}
          wrap="nowrap"
          h="full"
        >
          {/* Logo - Always visible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Box 
              cursor="pointer" 
              onClick={() => router.push("/")}
              flexShrink={0}
              display="flex"
              alignItems="center"
            >
              <Image
                src="/Boiboi (Palatinate blue).png"
                alt="BoiBoi Logo"
                width="160px"
                height="46px"
                objectFit="contain"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  transform: "scale(1.05)",
                  filter: "drop-shadow(0 8px 24px rgba(82, 52, 229, 0.3))"
                }}
                loading="eager"
              />
            </Box>
          </motion.div>

          {/* Location & Search Bar - Desktop */}
          <Flex
            flex={1}
            maxW="600px"
            mx={8}
            display={{ base: "none", md: "flex" }}
            align="center"
            gap={4}
          >
            {/* Location */}
            <HStack
              spacing={3}
              px={4}
              py={3}
              bg="gray.50"
              borderRadius="xl"
              cursor="pointer"
              transition="all 0.3s ease"
              _hover={{ 
                bg: "gray.100",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
              border="1px solid"
              borderColor="gray.200"
            >
              <Box
                bg="brand.primary"
                borderRadius="full"
                p={1.5}
              >
                <FiMapPin color="white" size={14} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color="gray.500" fontWeight="500">Deliver to</Text>
                <Text fontSize="sm" fontWeight="700" color="gray.800">Lagos, Nigeria</Text>
              </VStack>
            </HStack>

            {/* Search Bar */}
            <InputGroup flex={1} maxW="400px">
              <InputLeftElement pointerEvents="none" pl={4}>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search for food, restaurants..."
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                borderRadius="xl"
                fontSize="sm"
                pl={12}
                py={3}
                h="48px"
                _focus={{
                  bg: "white",
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                }}
                _hover={{
                  bg: "gray.100",
                  borderColor: "gray.300"
                }}
                transition="all 0.3s ease"
              />
            </InputGroup>
          </Flex>

          {/* Action Buttons - Desktop */}
          <HStack
            spacing={2}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            {/* Cart Button */}
            <IconButton
              aria-label="Shopping Cart"
              icon={<FiShoppingCart />}
              variant="ghost"
              size="lg"
              borderRadius="xl"
              position="relative"
              bg="gray.50"
              _hover={{ 
                bg: "gray.100",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
              transition="all 0.3s ease"
            >
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                bg="red.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="22px"
                h="22px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="600"
                boxShadow="0 2px 8px rgba(239, 68, 68, 0.3)"
              >
                3
              </Badge>
            </IconButton>

            {/* Notifications */}
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              variant="ghost"
              size="lg"
              borderRadius="xl"
              position="relative"
              bg="gray.50"
              _hover={{ 
                bg: "gray.100",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
              transition="all 0.3s ease"
            >
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                bg="orange.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="600"
                boxShadow="0 2px 8px rgba(245, 158, 11, 0.3)"
              >
                2
              </Badge>
            </IconButton>

            {/* Profile/Auth */}
            <Button
              leftIcon={<FiUser />}
              variant="outline"
              size="md"
              borderRadius="xl"
              borderColor="brand.primary"
              color="brand.primary"
              fontWeight="600"
              px={6}
              py={3}
              h="48px"
              _hover={{
                bg: "brand.primary",
                color: "white",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(82, 52, 229, 0.2)"
              }}
              transition="all 0.3s ease"
              onClick={handleLogin}
            >
              Login
            </Button>
          </HStack>

          {/* Mobile Search & Menu */}
          <HStack spacing={2} display={{ base: "flex", md: "none" }}>
            {/* Mobile Search */}
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              variant="ghost"
              size="md"
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            />

            {/* Mobile Cart */}
            <IconButton
              aria-label="Shopping Cart"
              icon={<FiShoppingCart />}
              variant="ghost"
              size="md"
              borderRadius="lg"
              position="relative"
              _hover={{ bg: "gray.100" }}
            >
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                bg="red.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                3
              </Badge>
            </IconButton>
          {/* Mobile Menu Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="md"
              borderRadius="lg"
              onClick={onOpen}
              color="gray.600"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                bg: "gray.100",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
              _active={{
                transform: "scale(0.95)"
              }}
            />
          </motion.div>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={onClose} 
        size="full"
        blockScrollOnMount={false}
      >
        <DrawerOverlay 
          bg="rgba(0, 0, 0, 0.4)" 
          backdropFilter="blur(8px)" 
        />
        <DrawerContent>
          <DrawerHeader 
            borderBottom="1px solid" 
            borderColor="gray.100"
            py={4}
            px={6}
            bg="white"
          >
            <Flex justify="space-between" align="center">
              <Image
                src="/Boiboi (Palatinate blue).png"
                alt="BoiBoi Logo"
                width="120px"
                height="35px"
                objectFit="contain"
              />
              <DrawerCloseButton 
                size="md"
                position="relative"
                top={0}
                right={0}
                _hover={{ bg: "gray.100" }}
              />
            </Flex>
          </DrawerHeader>
          
          <DrawerBody 
            py={6} 
            px={6}
            bg="gray.50"
            overflowY="auto"
          >
            <VStack spacing={6} align="stretch">
              {/* Location Section */}
              <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                <HStack spacing={3}>
                  <FiMapPin color="#666" size={20} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" color="gray.500">Deliver to</Text>
                    <Text fontSize="md" fontWeight="600" color="gray.800">Lagos, Nigeria</Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Menu Items */}
              <VStack spacing={3} align="stretch">
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  borderRadius="lg"
                  _hover={{ bg: "white" }}
                  leftIcon={<FiShoppingCart />}
                >
                  My Orders
                </Button>
                
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  borderRadius="lg"
                  _hover={{ bg: "white" }}
                  leftIcon={<FiHeart />}
                >
                  Favorites
                </Button>
                
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  borderRadius="lg"
                  _hover={{ bg: "white" }}
                  leftIcon={<FiUser />}
                >
                  Profile
                </Button>
              </VStack>
              
              {/* Auth Buttons */}
              <VStack spacing={3} align="stretch" mt={6}>
                <Button
                  variant="outline"
                  size="lg"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  borderRadius="lg"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{
                    bg: "white",
                    borderColor: "gray.400"
                  }}
                  onClick={handleLogin}
                >
                  Login
                </Button>
                
                <Button
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  size="lg"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  borderRadius="lg"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  }}
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
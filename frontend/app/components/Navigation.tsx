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
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        bg={navbarBg}
        backdropFilter={isScrolled ? "blur(10px)" : "none"}
        borderBottom={isScrolled ? "1px solid" : "none"}
        borderColor="gray.200"
        transition="all 0.3s ease"
        py={headerPadding?.py}
        px={headerPadding?.px}
        boxShadow={isScrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none"}
        w="100%"
        minH={{ base: "56px", sm: "62px", md: "68px", lg: "72px" }}
      >
        <Flex
          maxW={{ base: "100%", sm: "100%", md: "6xl", lg: "7xl", xl: "8xl" }}
          mx="auto"
          px={{ base: 1, xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }}
          justify="space-between"
          align="center"
          gap={{ base: 1, xs: 2, sm: 3, md: 4 }}
          wrap="nowrap"
          h="full"
        >
          {/* Logo - Always visible */}
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
              width={logoSize?.width}
              height={logoSize?.height}
              maxH={{ base: "48px", sm: "54px", md: "58px", lg: "62px", xl: "66px" }}
              objectFit="contain"
              transition="transform 0.2s ease"
              _hover={{ transform: "scale(1.05)" }}
              loading="eager"
            />
          </Box>

          {/* Full Desktop Navigation - XL screens and up */}
          {showFullNav && (
            <HStack
              spacing={{ xl: 6, "2xl": 8 }}
              align="center"
              flex={1}
              justify="center"
              maxW={{ xl: "600px", "2xl": "700px" }}
              mx={6}
            >
              {navigationItems.map((item) => (
                <Text
                  key={item.label}
                  color="text.primary"
                  fontWeight="600"
                  fontSize={{ xl: "md", "2xl": "lg" }}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    color: "brand.primary",
                    transform: "translateY(-1px)",
                    bg: "gray.50",
                  }}
                  onClick={item.onClick}
                  whiteSpace="nowrap"
                  px={3}
                  py={2}
                  borderRadius="md"
                >
                  {item.label}
                </Text>
              ))}
            </HStack>
          )}

          {/* Partial Navigation - Large screens only */}
          {showPartialNav && (
            <HStack 
              spacing={3}
              align="center" 
              flex={1} 
              justify="center" 
              mx={4}
              maxW="400px"
            >
              {navigationItems.slice(0, 3).map((item) => (
                <Text
                  key={item.label}
                  color="text.primary"
                  fontWeight="600"
                  fontSize="sm"
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    color: "brand.primary",
                    transform: "translateY(-1px)",
                    bg: "gray.50",
                  }}
                  onClick={item.onClick}
                  whiteSpace="nowrap"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {item.label}
                </Text>
              ))}
            </HStack>
          )}

          {/* CTA Buttons - Medium screens and up */}
          {showCTAButtons && (
            <HStack
              spacing={{ md: 1, lg: 2, xl: 3 }}
              align="center"
              flexShrink={0}
              wrap="nowrap"
            >
              {/* Login button - hidden on medium to save space */}
              {(showPartialNav || showFullNav) && (
                <Button
                  variant="ghost"
                  color="text.primary"
                  onClick={handleLogin}
                  size={buttonSize}
                  fontSize={{ lg: "sm", xl: "md" }}
                  px={{ lg: 3, xl: 4 }}
                  _hover={{
                    color: "brand.primary",
                    bg: "gray.50",
                    transform: "translateY(-1px)",
                  }}
                  display={{ base: "none", lg: "flex" }}
                >
                  Login
                </Button>
              )}
              
              <Button
                variant="outline"
                borderColor="brand.primary"
                color="brand.primary"
                onClick={handleSignUp}
                size={buttonSize}
                fontSize={{ md: "xs", lg: "sm", xl: "md" }}
                px={{ md: 2, lg: 3, xl: 4 }}
                _hover={{
                  bg: "brand.primary",
                  color: "white",
                  transform: "translateY(-1px)",
                }}
                display={{ base: "none", md: "flex" }}
              >
                Sign Up
              </Button>
              
              <Button
                variant="primary"
                size={buttonSize}
                onClick={() => router.push("/waitlist")}
                px={{ md: 2, lg: 3, xl: 4 }}
                fontSize={{ md: "xs", lg: "sm", xl: "md" }}
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(82, 52, 229, 0.3)",
                }}
                whiteSpace="nowrap"
                display={{ base: "none", md: "flex" }}
              >
                {waitlistLabel}
              </Button>
            </HStack>
          )}

          {/* Mobile Menu Button - Always visible when nav items are hidden */}
          {(!showCTAButtons || !showFullNav) && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              size={{ base: "sm", xs: "sm", sm: "md" }}
              onClick={onOpen}
              color="text.primary"
              minW={{ base: "32px", xs: "36px", sm: "40px" }}
              h={{ base: "32px", xs: "36px", sm: "40px" }}
              borderRadius="md"
              _hover={{
                bg: "gray.50",
                transform: "scale(1.05)",
              }}
              _active={{
                bg: "gray.100",
                transform: "scale(0.95)",
              }}
              flexShrink={0}
            />
          )}
        </Flex>
      </Box>

      {/* Mobile & Tablet Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={onClose} 
        size={{ base: "full", xs: "full", sm: "full", md: "md", lg: "sm" }}
        blockScrollOnMount={false}
      >
        <DrawerOverlay 
          bg="rgba(0, 0, 0, 0.5)" 
          backdropFilter="blur(4px)" 
        />
        <DrawerContent maxW={{ base: "100vw", xs: "90vw", sm: "85vw" }}>
          <DrawerHeader 
            borderBottom="1px solid" 
            borderColor="gray.200"
            py={{ base: 3, xs: 4, sm: 5, md: 6 }}
            px={{ base: 3, xs: 4, sm: 5, md: 6 }}
          >
            <Flex justify="space-between" align="center">
              <Image
                src="/Boiboi (Palatinate blue).png"
                alt="BoiBoi Logo"
                width={{ base: "120px", xs: "140px", sm: "150px", md: "120px" }}
                height={{ base: "35px", xs: "40px", sm: "42px", md: "35px" }}
                objectFit="contain"
              />
              <DrawerCloseButton 
                size={{ base: "md", xs: "lg", md: "lg" }} 
                position="relative"
                top={0}
                right={0}
                _hover={{ bg: "gray.100" }}
                fontSize={{ base: "18px", xs: "20px", md: "18px" }}
              />
            </Flex>
          </DrawerHeader>
          
          <DrawerBody 
            py={{ base: 4, xs: 5, sm: 6, md: 8 }} 
            px={{ base: 3, xs: 4, sm: 5, md: 6 }}
            overflowY="auto"
          >
            <VStack spacing={{ base: 4, xs: 5, sm: 6, md: 8 }} align="stretch" h="full">
              {/* Navigation Items */}
              <VStack spacing={{ base: 2, xs: 3, sm: 3, md: 4 }} align="stretch">
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    justifyContent="flex-start"
                    size={{ base: "md", xs: "md", sm: "lg", md: "lg" }}
                    onClick={item.onClick}
                    fontSize={{ base: "md", xs: "md", sm: "lg", md: "lg" }}
                    fontWeight="600"
                    h={{ base: "45px", xs: "50px", sm: "55px", md: "60px" }}
                    borderRadius="12px"
                    _hover={{
                      bg: "brand.primary",
                      color: "white",
                      transform: "translateX(4px)",
                    }}
                    transition="all 0.2s ease"
                    borderLeft="4px solid transparent"
                    _active={{
                      bg: "brand.primary",
                      color: "white",
                      borderLeftColor: "brand.primary",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </VStack>
              
              {/* Divider */}
              <Box 
                h="1px" 
                bg="gray.200" 
                my={{ base: 3, xs: 4, sm: 5, md: 6 }}
              />
              
              {/* CTA Buttons */}
              <VStack spacing={{ base: 2, xs: 3, sm: 3, md: 4 }} align="stretch">
                <Text 
                  fontSize={{ base: "sm", xs: "sm", sm: "md", md: "md" }} 
                  fontWeight="600" 
                  color="text.secondary"
                  textAlign="center"
                  mb={{ base: 1, xs: 2 }}
                >
                  Get Started
                </Text>
                
                <Button
                  variant="outline"
                  size={{ base: "md", xs: "md", sm: "lg", md: "lg" }}
                  width="full"
                  onClick={handleLogin}
                  h={{ base: "40px", xs: "45px", sm: "48px", md: "50px" }}
                  borderRadius="12px"
                  borderColor="brand.primary"
                  color="brand.primary"
                  fontSize={{ base: "sm", xs: "sm", sm: "md", md: "md" }}
                  _hover={{
                    bg: "brand.primary",
                    color: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(82, 52, 229, 0.3)",
                  }}
                  transition="all 0.2s ease"
                >
                  Login
                </Button>
                
                <Button
                  variant="primary"
                  size={{ base: "md", xs: "md", sm: "lg", md: "lg" }}
                  width="full"
                  onClick={handleSignUp}
                  h={{ base: "40px", xs: "45px", sm: "48px", md: "50px" }}
                  borderRadius="12px"
                  fontSize={{ base: "sm", xs: "sm", sm: "md", md: "md" }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(82, 52, 229, 0.4)",
                  }}
                  transition="all 0.2s ease"
                >
                  Sign Up
                </Button>
                
                <Button
                  variant="secondary"
                  size={{ base: "md", xs: "md", sm: "lg", md: "lg" }}
                  width="full"
                  onClick={() => {
                    router.push("/waitlist");
                    onClose();
                  }}
                  h={{ base: "40px", xs: "45px", sm: "48px", md: "50px" }}
                  borderRadius="12px"
                  fontSize={{ base: "sm", xs: "sm", sm: "md", md: "md" }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.4)",
                  }}
                  transition="all 0.2s ease"
                >
                  Join Waitlist
                </Button>
              </VStack>

              {/* Contact Info for Mobile */}
              <Box 
                mt={{ base: 4, xs: 5, sm: 6, md: 8 }} 
                p={{ base: 3, xs: 4, sm: 4, md: 4 }} 
                bg="gray.50" 
                borderRadius="12px"
                display={{ base: "block", xl: "none" }}
              >
                <VStack spacing={{ base: 2, xs: 2, sm: 3, md: 3 }} align="start">
                  <Text 
                    fontSize={{ base: "sm", xs: "sm", sm: "md", md: "sm" }} 
                    fontWeight="600" 
                    color="text.primary"
                  >
                    Contact Us
                  </Text>
                  <Text 
                    fontSize={{ base: "xs", xs: "sm", sm: "sm", md: "sm" }} 
                    color="text.secondary"
                    wordBreak="break-word"
                  >
                    📧 boiboi.nigeria@gmail.com
                  </Text>
                  <Text fontSize={{ base: "xs", xs: "sm", sm: "sm", md: "sm" }} color="text.secondary">
                    📱 Available 24/7
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
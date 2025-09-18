"use client";

import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Link,
  Divider,
  Image,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { RiInstagramFill, RiTiktokFill, RiTwitterXFill } from "react-icons/ri";
import { FaApple, FaLocationArrow } from "react-icons/fa";
import { BiLogoPlayStore } from "react-icons/bi";

interface FooterProps {
  variant?: "default" | "minimal";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About us", href: "/about-us" },
    { label: "Contact us", href: "#contact" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Blog", href: "/blog" },
    { label: "FAQs", href: "#faqs" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/useboiboi",
      icon: <RiInstagramFill fontSize="20px" />,
    },
    {
      label: "Twitter/X",
      href: "https://www.x.com/useboiboi",
      icon: <RiTwitterXFill fontSize="20px" />,
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@useboiboi",
      icon: <RiTiktokFill fontSize="20px" />,
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (variant === "minimal") {
    return (
      <Box bg="gray.900" color="white" py={{ base: 6, md: 8 }}>
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8 }}
          justify="space-between"
          align="center"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 4 }}
        >
          <Image
            src="/Boiboi (Palatinate blue).png"
            alt="BoiBoi Logo"
            width={{ base: "360px", xs: "420px", sm: "450px" }}
            height={{ base: "105px", xs: "120px", sm: "120px" }}
            objectFit="contain"
          />
          <Text 
            fontSize={{ base: "xs", sm: "sm" }} 
            color="gray.400"
            textAlign={{ base: "center", md: "left" }}
          >
            © Boi Technologies {currentYear}. All rights reserved.
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="white" borderTop="1px solid" borderColor="gray.200">
      {/* Download Apps Section - Mobile Optimized */}
      <Box bg="white" py={{ base: 8, xs: 10, sm: 12 }} borderTop="1px solid" borderColor="gray.200">
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8 }}
          justify="space-between"
          align="center"
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 6, sm: 8 }}
        >
          <VStack 
            align={{ base: "center", lg: "start" }} 
            spacing={{ base: 3, xs: 4, sm: 4 }}
            w={{ base: "100%", lg: "auto" }}
          >
            <Text
              fontSize={{ base: "xl", xs: "2xl", sm: "2xl", md: "3xl" }}
              fontWeight="700"
              color="gray.900"
              textAlign={{ base: "center", lg: "left" }}
              lineHeight={{ base: "1.2", sm: "1.3" }}
            >
              Get the BoiBoi app
            </Text>
            <Text
              fontSize={{ base: "md", xs: "lg", sm: "lg" }}
              color="gray.600"
              textAlign={{ base: "center", lg: "left" }}
              maxW={{ base: "280px", xs: "320px", sm: "400px" }}
            >
              Available for iOS and Android devices
            </Text>
            <Stack
              direction={{ base: "column", xs: "row" }}
              spacing={{ base: 3, xs: 4 }}
              pt={{ base: 2, sm: 4 }}
              w={{ base: "100%", xs: "auto" }}
              align="center"
            >
              <Link
                href="https://play.google.com/store"
                isExternal
                _hover={{ transform: "translateY(-2px)" }}
                transition="transform 0.2s ease"
                w={{ base: "100%", xs: "auto" }}
                maxW={{ base: "280px", xs: "auto" }}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg="purple.600"
                  color="white"
                  px={{ base: 4, xs: 5, sm: 6 }}
                  py={{ base: 3, sm: 3 }}
                  borderRadius="12px"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{
                    bg: "purple.700",
                    boxShadow: "0 4px 12px rgba(82, 52, 229, 0.3)",
                  }}
                  minH={{ base: "48px", sm: "52px" }}
                  w="full"
                >
                  <BiLogoPlayStore fontSize="20px" color="white" />
                  <Text 
                    ml={2} 
                    color="white" 
                    fontSize={{ base: "sm", xs: "md", sm: "md" }}
                  >
                    Play Store
                  </Text>
                </Flex>
              </Link>
              <Link
                href="https://apps.apple.com"
                isExternal
                _hover={{ transform: "translateY(-2px)" }}
                transition="transform 0.2s ease"
                w={{ base: "100%", xs: "auto" }}
                maxW={{ base: "280px", xs: "auto" }}
              >
                <Flex
                  align="center"
                  justify="center"
                  bg="gray.900"
                  color="white"
                  px={{ base: 4, xs: 5, sm: 6 }}
                  py={{ base: 3, sm: 3 }}
                  borderRadius="12px"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{
                    bg: "gray.800",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  minH={{ base: "48px", sm: "52px" }}
                  w="full"
                >
                  <FaApple fontSize="20px" color="white" />
                  <Text 
                    ml={2} 
                    color="white" 
                    fontSize={{ base: "sm", xs: "md", sm: "md" }}
                  >
                    App Store
                  </Text>
                </Flex>
              </Link>
            </Stack>
          </VStack>

          <Box 
            display={{ base: "none", lg: "block" }}
            flexShrink={0}
          >
            <Image
              src="/media04.png"
              alt="Mobile app preview"
              height="300px"
              width="250px"
              objectFit="contain"
            />
          </Box>
        </Flex>
      </Box>

      {/* Main Footer - Mobile Optimized Grid Layout */}
      <Box py={{ base: 8, xs: 10, sm: 12 }}>
        <Box
          maxW="7xl"
          mx="auto"
          px={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8 }}
        >
          {/* Mobile: Stacked Layout, Desktop: Grid Layout */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 8, md: 8, lg: 8 }}
            alignItems="start"
          >
            {/* Logo and Description */}
            <VStack 
              align={{ base: "center", md: "start" }} 
              spacing={{ base: 4, sm: 4 }} 
              gridColumn={{ base: "1", lg: "1 / 2" }}
            >
              <Image
                src="/Boiboi (Palatinate blue).png"
                alt="BoiBoi Logo"
                width={{ base: "160px", xs: "180px", sm: "200px" }}
                height={{ base: "45px", xs: "50px", sm: "50px" }}
                objectFit="contain"
              />
              <Text
                color="text.secondary"
                fontSize={{ base: "sm", xs: "md", sm: "md" }}
                lineHeight="1.6"
                textAlign={{ base: "center", md: "left" }}
                maxW={{ base: "320px", sm: "400px" }}
              >
                Delivering convenience and quality to campus communities through
                efficient, sustainable, and technology-driven errand services.
              </Text>
              <HStack 
                spacing={{ base: 3, sm: 4 }} 
                pt={2} 
                justify={{ base: "center", md: "flex-start" }}
                flexWrap="wrap"
              >
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    isExternal
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="transform 0.2s ease"
                  >
                    <Box
                      p={{ base: 2, xs: 3, sm: 3 }}
                      bg="gray.100"
                      borderRadius="full"
                      cursor="pointer"
                      _hover={{
                        bg: "brand.primary",
                        color: "white",
                        transform: "translateY(-2px)",
                      }}
                      transition="all 0.2s ease"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      minW={{ base: "40px", sm: "44px" }}
                      minH={{ base: "40px", sm: "44px" }}
                    >
                      {social.icon}
                    </Box>
                  </Link>
                ))}
              </HStack>
            </VStack>

            {/* Quick Links */}
            <VStack 
              align={{ base: "center", md: "start" }} 
              spacing={{ base: 4, sm: 4 }} 
              gridColumn={{ base: "1", md: "2", lg: "2 / 3" }}
            >
              <Text
                fontSize={{ base: "md", xs: "lg", sm: "lg" }}
                fontWeight="700"
                color="brand.primary"
                textAlign={{ base: "center", md: "left" }}
              >
                Quick Links
              </Text>
              <SimpleGrid
                columns={{ base: 2, sm: 2, md: 1 }}
                spacing={{ base: 2, xs: 3, sm: 3 }}
                w="full"
                maxW={{ base: "300px", md: "none" }}
              >
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="text.secondary"
                    fontSize={{ base: "sm", xs: "md", sm: "md" }}
                    textAlign={{ base: "center", md: "left" }}
                    _hover={{
                      bg: "gray.50",
                      color: "brand.primary",
                      textDecoration: "none",
                      transform: "translateX(2px)",
                    }}
                    transition="all 0.2s ease"
                    onClick={
                      link.href.startsWith("#")
                        ? (e) => {
                            e.preventDefault();
                            scrollToSection(link.href.slice(1));
                          }
                        : undefined
                    }
                    py={1}
                    px={2}
                    borderRadius="md"
                  >
                    {link.label}
                  </Link>
                ))}
              </SimpleGrid>
            </VStack>

            {/* Contact Info */}
            <VStack 
              align={{ base: "center", md: "start" }} 
              spacing={{ base: 4, sm: 4 }} 
              gridColumn={{ base: "1", md: "1 / 3", lg: "3 / 4" }}
            >
              <Text
                fontSize={{ base: "md", xs: "lg", sm: "lg" }}
                fontWeight="700"
                color="brand.primary"
                textAlign={{ base: "center", md: "left" }}
              >
                Get in Touch
              </Text>
              <VStack
                spacing={{ base: 3, sm: 3 }}
                align={{ base: "center", md: "start" }}
                fontSize={{ base: "sm", xs: "md", sm: "md" }}
                w="full"
                maxW={{ base: "300px", md: "none" }}
              >
                <HStack 
                  spacing={3} 
                  align="start"
                  justify={{ base: "center", md: "flex-start" }}
                  w="full"
                >
                  <Box color="brand.primary" pt={1} flexShrink={0}>
                    <FaLocationArrow size="14px" />
                  </Box>
                  <Text 
                    color="text.secondary" 
                    textAlign={{ base: "center", md: "left" }}
                    lineHeight="1.5"
                  >
                    Campus communities nationwide
                  </Text>
                </HStack>
                <VStack 
                  spacing={2} 
                  align={{ base: "center", md: "start" }}
                  w="full"
                >
                  <Text 
                    color="text.secondary" 
                    textAlign={{ base: "center", md: "left" }}
                    wordBreak="break-word"
                  >
                    <Text as="span" fontWeight="600">Email:</Text> boiboi.nigeria@gmail.com
                  </Text>
                  <Text 
                    color="text.secondary" 
                    textAlign={{ base: "center", md: "left" }}
                  >
                    <Text as="span" fontWeight="600">Support:</Text> Available 24/7
                  </Text>
                </VStack>
              </VStack>
            </VStack>
          </SimpleGrid>
        </Box>
      </Box>

      <Divider />

      {/* Copyright - Mobile Optimized */}
      <Box py={{ base: 4, xs: 5, sm: 6 }}>
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 3, xs: 4, sm: 5, md: 6, lg: 8 }}
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "column", md: "row" }}
          gap={{ base: 2, xs: 3, sm: 4 }}
          textAlign="center"
        >
          <Text 
            color="text.tertiary" 
            fontSize={{ base: "xs", xs: "sm", sm: "sm" }}
            order={{ base: 1, md: 1 }}
          >
            © Boi Technologies {currentYear}. All rights reserved.
          </Text>
          <Text 
            color="text.tertiary" 
            fontSize={{ base: "xs", xs: "sm", sm: "sm" }}
            order={{ base: 2, md: 2 }}
          >
            Made with ❤️ for campus communities
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
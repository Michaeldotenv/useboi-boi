"use client";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
  VStack,
  HStack,
  Divider,
  Icon,
  useColorModeValue,
  Container,
  Card,
  CardBody,
  Heading,
  Link as ChakraLink,
  useBreakpointValue
} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiUser, FiStar, FiShield } from "react-icons/fi";
import { BASE_URL } from "../lib/endpoints";

function Login() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", md: "container.sm" });
  const cardMaxW = useBreakpointValue({ base: "100%", md: "md" });
  const cardPadding = useBreakpointValue({ base: 6, md: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const logoSize = useBreakpointValue({ base: { w: "160px", h: "50px" }, md: { w: "220px", h: "70px" } });

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("text.primary", "white");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await res.json();

      const token = data.token;
      const user = data.user;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("boiboi_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });

      // Redirect to unified mobile dashboard
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  const handleHomePage = () => {
    router.push("/");
  };

  return (
    <Box
      minH="100vh"
      bg="white"
      position="relative"
      overflow="hidden"
    >
      {/* Purple Theme Patches */}
      <Box
        position="absolute"
        top="-30%"
        right="-20%"
        w={isMobile ? "300px" : "400px"}
        h={isMobile ? "300px" : "400px"}
        bg="brand.primary"
        borderRadius="full"
        opacity={0.1}
        filter="blur(60px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-25%"
        left="-15%"
        w={isMobile ? "250px" : "350px"}
        h={isMobile ? "250px" : "350px"}
        bg="brand.primaryLight"
        borderRadius="full"
        opacity={0.08}
        filter="blur(50px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="20%"
        left="-10%"
        w={isMobile ? "200px" : "300px"}
        h={isMobile ? "200px" : "300px"}
        bg="purple.400"
        borderRadius="full"
        opacity={0.06}
        filter="blur(40px)"
        zIndex={0}
      />
      
      <Container maxW={containerMaxW} py={containerPadding} px={isMobile ? 4 : 8} position="relative" zIndex={1}>
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Flex justifyContent="center" mb={isMobile ? 6 : 8}>
            <Image
              src={"/Boiboi (Palatinate blue).png"}
              alt={"BoiBoi Logo"}
              objectFit="cover"
              width={logoSize?.w ?? "220px"}
              height={logoSize?.h ?? "70px"}
              cursor="pointer"
              onClick={handleHomePage}
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.05)" }}
              filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))"
            />
          </Flex>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: cardMaxW }}
        >
          <Card 
            maxW={cardMaxW} 
            w="100%"
            mx="auto"
            boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.15)" 
            borderRadius={isMobile ? "24px" : "32px"}
            bg={cardBg}
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(82, 52, 229, 0.02), rgba(107, 78, 255, 0.01))",
              borderRadius: "inherit",
              zIndex: 0
            }}
          >
          <CardBody p={cardPadding} position="relative" zIndex={1}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <VStack spacing={2} textAlign="center">
                <Heading 
                  size={isMobile ? "lg" : "xl"} 
                  fontWeight="700" 
                  color={textColor}
                  letterSpacing="-0.02em"
                >
                  Welcome Back
                </Heading>
                <Text 
                  color="text.secondary" 
                  fontSize={isMobile ? "md" : "lg"}
                  fontWeight="400"
                >
                  Sign in to your BoiBoi account
                </Text>
              </VStack>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                  {/* Email Field */}
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="600" 
                      fontSize="sm" 
                      color={textColor}
                      mb={2}
                    >
                      Email Address
                    </FormLabel>
                    <InputGroup>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        h={isMobile ? "48px" : "56px"}
                        borderRadius="12px"
                        px={4}
                        py={3}
                        fontSize={isMobile ? "16px" : "md"}
                        border="2px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                          bg: "white"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                      />
                      <InputRightElement h={isMobile ? "48px" : "56px"} pr={4}>
                        <Icon as={FiMail} color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Password Field */}
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="600" 
                      fontSize="sm" 
                      color={textColor}
                      mb={2}
                    >
                      Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        h={isMobile ? "48px" : "56px"}
                        borderRadius="12px"
                        px={4}
                        py={3}
                        fontSize={isMobile ? "16px" : "md"}
                        border="2px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                          bg: "white"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                      />
                      <InputRightElement h={isMobile ? "48px" : "56px"} pr={4}>
                        <Box 
                          onClick={toggleShowPassword}
                          cursor="pointer"
                          _hover={{ color: "brand.primary" }}
                          transition="color 0.2s"
                        >
                          <Icon 
                            as={showPassword ? FiEyeOff : FiEye} 
                            color="gray.400" 
                            fontSize="lg"
                          />
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Forgot Password Link */}
                  <Flex justify="flex-end">
                    <ChakraLink 
                      as={Link} 
                      href="/forgot-password"
                      color="brand.primary"
                      fontSize="sm"
                      fontWeight="500"
                      _hover={{ 
                        color: "brand.primaryDark",
                        textDecoration: "underline"
                      }}
                    >
                      Forgot Password?
                    </ChakraLink>
                  </Flex>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    bg="brand.primary"
                    color="white"
                    size="lg"
                    h={isMobile ? "48px" : "56px"}
                    fontSize={isMobile ? "md" : "md"}
                    fontWeight="600"
                    borderRadius="12px"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    isDisabled={!formData.email || !formData.password}
                    _hover={{
                      bg: "brand.primaryDark",
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 25px rgba(82, 52, 229, 0.3)"
                    }}
                    _active={{
                      transform: "translateY(0)"
                    }}
                    transition="all 0.2s ease"
                    rightIcon={<Icon as={FiArrowRight} />}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>

              {/* Divider */}
              <HStack>
                <Divider />
                <Text fontSize="sm" color="gray.500" px={2}>
                  OR
                </Text>
                <Divider />
              </HStack>

              {/* Sign Up Link */}
              <Button
                variant="outline"
                size="lg"
                h={isMobile ? "48px" : "56px"}
                fontSize={isMobile ? "md" : "md"}
                fontWeight="600"
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.200"
                color="text.secondary"
                _hover={{
                  borderColor: "brand.primary",
                  color: "brand.primary",
                  bg: "rgba(82, 52, 229, 0.05)"
                }}
                _active={{
                  bg: "rgba(82, 52, 229, 0.1)"
                }}
                onClick={handleSignUp}
                leftIcon={<Icon as={FiUser} />}
                transition="all 0.2s ease"
              >
                Create New Account
              </Button>
            </VStack>
          </CardBody>
          </Card>
        </motion.div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Text 
            textAlign="center" 
            mt={isMobile ? 6 : 8} 
            color="gray.600" 
            fontSize={isMobile ? "xs" : "sm"}
            maxW="400px"
            mx="auto"
            px={4}
            lineHeight={isMobile ? "1.4" : "1.5"}
          >
            By signing in, you agree to our{" "}
            <ChakraLink 
              as={Link} 
              href="/privacy-policy" 
              color="brand.primary"
              fontWeight="600"
              _hover={{ 
                textDecoration: "underline",
                color: "brand.primaryDark"
              }}
            >
              Privacy Policy
            </ChakraLink>{" "}
            and{" "}
            <ChakraLink 
              as={Link} 
              href="/terms" 
              color="brand.primary"
              fontWeight="600"
              _hover={{ 
                textDecoration: "underline",
                color: "brand.primaryDark"
              }}
            >
              Terms of Service
            </ChakraLink>
          </Text>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Login;

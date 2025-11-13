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
  Icon,
  Heading,
  Link as ChakraLink,
  Container,
  Checkbox,
  Divider,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BASE_URL } from "../lib/endpoints";
import GoogleSignInButton from "../components/GoogleSignInButton";
import GoogleSignInProvider from "../components/GoogleSignInProvider";

export default function Login() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

      // Store token
      localStorage.setItem("boiboi_token", token);
      localStorage.setItem("boiboi_user", JSON.stringify(user));

      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.firstName || "User"}!`,
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "merchant") {
        router.push("/merchant-dashboard");
      } else if (user.role === "rider") {
        router.push("/rider-dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Login failed",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleSignInProvider>
    <Flex minH="100vh" maxH="100vh" overflow="hidden" bg="white">
      {/* Left Side - Image (Hidden on mobile) */}
      <Box
        display={{ base: "none", lg: "block" }}
        w="50%"
        position="relative"
        overflow="hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
          alt="Food delivery"
          objectFit="cover"
          w="full"
          h="full"
          position="absolute"
        />
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%)"
        />
      </Box>

      {/* Right Side - Form */}
      <Flex
        w={{ base: "100%", lg: "50%" }}
        align="center"
        justify="center"
        p={{ base: 6, md: 8 }}
        position="relative"
        bg="white"
        overflow="hidden"
      >
        {/* Vibrant Decorative Elements - Mobile Only */}
        <Box display={{ base: "block", lg: "none" }} pointerEvents="none">
          <Box position="absolute" top="-30px" right="-30px" w="120px" h="120px" borderRadius="full" bg="purple.200" opacity={0.4} filter="blur(30px)" />
          <Box position="absolute" bottom="-40px" left="-40px" w="150px" h="150px" borderRadius="full" bg="pink.200" opacity={0.3} filter="blur(40px)" />
          <Box position="absolute" top="30%" right="10%" w="80px" h="80px" borderRadius="full" bg="blue.200" opacity={0.25} filter="blur(25px)" />
        </Box>
        <Container maxW="420px" maxH="100vh" overflow="hidden">
          <VStack spacing={5} align="stretch">
            {/* Logo */}
            <Box textAlign="center">
              <Image
                src="/boiboi (02).png"
                alt="Boiboi Logo"
                width="90px"
                height="auto"
                mx="auto"
                mb={1}
                cursor="pointer"
                onClick={() => router.push('/')}
              />
            </Box>

            {/* Header */}
            <VStack spacing={1.5} textAlign="center">
              <Heading fontSize="xl" fontWeight="700" color="gray.900">
                Sign in to your account
              </Heading>
              <Text color="gray.600" fontSize="xs">
                Welcome back! Please enter your details
              </Text>
            </VStack>

            {/* Form */}
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={3.5}>
                {/* Email */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <Input
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      h="42px"
                      bg="gray.50"
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="10px"
                      fontSize="14px"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                  </InputGroup>
                </FormControl>

                {/* Password */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      h="42px"
                      bg="gray.50"
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="10px"
                      fontSize="14px"
                      _hover={{ borderColor: "gray.300" }}
                      _focus={{ borderColor: "purple.500", bg: "white" }}
                    />
                    <InputRightElement h="42px">
                      <Icon
                        as={showPassword ? FiEyeOff : FiEye}
                        color="gray.400"
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {/* Remember Me & Forgot Password */}
                <Flex justify="space-between" w="full">
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="purple"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Remember me
                    </Text>
                  </Checkbox>
                  <ChakraLink
                    as={Link}
                    href="/forgot-password"
                    fontSize="sm"
                    color="purple.600"
                    fontWeight="600"
                    _hover={{ color: "purple.700" }}
                  >
                    Forgot password?
                  </ChakraLink>
                </Flex>

                {/* Submit Button */}
                <Button
                  type="submit"
                  w="full"
                  h="42px"
                  bg="purple.600"
                  color="white"
                  fontWeight="600"
                  fontSize="14px"
                  borderRadius="10px"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  _hover={{ bg: "purple.700" }}
                  _active={{ bg: "purple.800" }}
                  mt={0.5}
                >
                  Sign In
                </Button>

                {/* Divider */}
                <HStack w="full" my={1}>
                  <Divider />
                  <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" px={2}>
                    or
                  </Text>
                  <Divider />
                </HStack>

                {/* Google Sign In */}
                <GoogleSignInButton mode="signin" />

                {/* Sign Up Link */}
                <Text textAlign="center" color="gray.600" fontSize="xs">
                  Don't have an account?{" "}
                  <ChakraLink
                    as={Link}
                    href="/sign-up"
                    color="purple.600"
                    fontWeight="600"
                    _hover={{ color: "purple.700" }}
                  >
                    Sign up
                  </ChakraLink>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Flex>
    </Flex>
    </GoogleSignInProvider>
  );
}

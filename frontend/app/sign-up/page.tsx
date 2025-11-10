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
} from "@chakra-ui/react";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_URL } from "../lib/endpoints";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Please fill in all fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password must be at least 8 characters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('📤 Sending signup request:', { ...formData, password: '***', confirmPassword: '***' });
      
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', res.status);

      if (!res.ok) {
        let serverError = "Signup failed";
        try {
          const errorData = await res.json();
          console.error('❌ Error response:', errorData);
          serverError = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch {
          const text = await res.text();
          console.error('❌ Error text:', text);
          serverError = text || serverError;
        }
        throw new Error(serverError);
      }

      const responseData = await res.json();
      console.log('✅ Signup successful:', responseData);

      toast({
        title: "Account created successfully!",
        description: "OTP verification code sent to your email.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}&role=base`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Signup error:', message);
      
      // Check if it's an email timeout error
      const isEmailError = message.includes('timeout') || message.includes('dial tcp') || message.includes('465');
      
      toast({
        title: isEmailError ? "Email Service Unavailable" : "Signup failed",
        description: isEmailError 
          ? "The email verification service is temporarily unavailable. Please contact support or try again later."
          : message,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" maxH="100vh" overflow="hidden" bg="white">
      {/* Left Side - Image (Hidden on mobile) */}
      <Box
        display={{ base: "none", lg: "block" }}
        w="50%"
        position="relative"
        overflow="hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
          alt="Fresh groceries"
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
          bg="linear-gradient(135deg, rgba(240, 147, 251, 0.85) 0%, rgba(245, 87, 108, 0.85) 100%)"
        />
      </Box>

      {/* Right Side - Form */}
      <Flex
        w={{ base: "100%", lg: "50%" }}
        align="center"
        justify="center"
        p={{ base: 4, md: 6 }}
        position="relative"
        bg="white"
        overflow="hidden"
      >
        {/* Vibrant Decorative Elements - Mobile Only */}
        <Box display={{ base: "block", lg: "none" }} pointerEvents="none">
          <Box position="absolute" top="-30px" right="-30px" w="120px" h="120px" borderRadius="full" bg="orange.200" opacity={0.4} filter="blur(30px)" />
          <Box position="absolute" bottom="-40px" left="-40px" w="150px" h="150px" borderRadius="full" bg="pink.200" opacity={0.3} filter="blur(40px)" />
          <Box position="absolute" top="30%" right="10%" w="80px" h="80px" borderRadius="full" bg="yellow.200" opacity={0.25} filter="blur(25px)" />
        </Box>
        <Container maxW="420px" maxH="100vh" overflow="hidden">
          <VStack spacing={4} align="stretch">
            {/* Logo */}
            <Box textAlign="center">
              <Image
                src="/boiboi (02).png"
                alt="Boiboi Logo"
                width="90px"
                height="auto"
                mx="auto"
                mb={0.5}
                cursor="pointer"
                onClick={() => router.push('/')}
              />
            </Box>

            {/* Header */}
            <VStack spacing={1} textAlign="center">
              <Heading fontSize="xl" fontWeight="700" color="gray.900">
                Create your account
              </Heading>
              <Text color="gray.600" fontSize="xs">
                Start ordering from local stores today
              </Text>
            </VStack>

            {/* Form */}
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={2.5}>
                {/* Name Fields */}
                <HStack spacing={2} w="full">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                      First Name
                    </FormLabel>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
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
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                      Last Name
                    </FormLabel>
                    <Input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
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
                  </FormControl>
                </HStack>

                {/* Email */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                    Email Address
                  </FormLabel>
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
                </FormControl>

                {/* Phone */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                    Phone Number
                  </FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
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

                {/* Confirm Password */}
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="gray.700" mb={1}>
                    Confirm Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
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
                        as={showConfirmPassword ? FiEyeOff : FiEye}
                        color="gray.400"
                        cursor="pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

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
                  loadingText="Creating account..."
                  _hover={{ bg: "purple.700" }}
                  _active={{ bg: "purple.800" }}
                  mt={0.5}
                >
                  Create Account
                </Button>

                {/* Login Link */}
                <Text textAlign="center" color="gray.600" fontSize="xs" mt={-1}>
                  Already have an account?{" "}
                  <ChakraLink
                    as={Link}
                    href="/login"
                    color="purple.600"
                    fontWeight="600"
                    _hover={{ color: "purple.700" }}
                  >
                    Sign in
                  </ChakraLink>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
}

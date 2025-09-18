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
  Link as ChakraLink
} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiUser } from "react-icons/fi";
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

  const bgGradient = useColorModeValue(
    "linear(to-br, brand.primary, brand.primaryLight)",
    "linear(to-br, brand.primaryDark, brand.primary)"
  );

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
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });

      // Redirect based on user type
      if (user.type === "merchant") {
        router.push("/merchant-dashboard");
      } else if (user.type === "rider") {
        router.push("/rider-dashboard");
      } else {
        router.push("/user-dashboard");
      }
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
    <Wrapper>
      <Container maxW="container.sm" py={8}>
        {/* Logo Section */}
        <Flex justifyContent="center" mb={8}>
          <Image
            src={"/Boiboi (Palatinate blue).png"}
            alt={"BoiBoi Logo"}
            objectFit="cover"
            width="220px"
            height="70px"
            cursor="pointer"
            onClick={handleHomePage}
            transition="all 0.3s ease"
            _hover={{ transform: "scale(1.05)" }}
          />
        </Flex>

        {/* Main Login Card */}
        <Card 
          maxW="md" 
          mx="auto" 
          boxShadow="xl" 
          borderRadius="24px"
          bg={cardBg}
          border="1px solid"
          borderColor="gray.100"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <VStack spacing={2} textAlign="center">
                <Heading 
                  size="xl" 
                  fontWeight="700" 
                  color={textColor}
                  letterSpacing="-0.02em"
                >
                  Welcome Back
                </Heading>
                <Text 
                  color="text.secondary" 
                  fontSize="lg"
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
                        h="56px"
                        borderRadius="16px"
                        px={4}
                        py={3}
                        fontSize="md"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                      />
                      <InputRightElement h="56px" pr={4}>
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
                        h="56px"
                        borderRadius="16px"
                        px={4}
                        py={3}
                        fontSize="md"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)"
                        }}
                        _hover={{
                          borderColor: "gray.300"
                        }}
                      />
                      <InputRightElement h="56px" pr={4}>
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
                    h="56px"
                    fontSize="md"
                    fontWeight="600"
                    borderRadius="16px"
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
                h="56px"
                fontSize="md"
                fontWeight="600"
                borderRadius="16px"
                border="2px solid"
                borderColor="gray.200"
                color="text.secondary"
                _hover={{
                  borderColor: "brand.primary",
                  color: "brand.primary",
                  bg: "brand.primary"
                }}
                _active={{
                  bg: "brand.primary"
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

        {/* Footer Text */}
        <Text 
          textAlign="center" 
          mt={8} 
          color="text.tertiary" 
          fontSize="sm"
        >
          By signing in, you agree to our{" "}
          <ChakraLink 
            as={Link} 
            href="/privacy-policy" 
            color="brand.primary"
            _hover={{ textDecoration: "underline" }}
          >
            Privacy Policy
          </ChakraLink>{" "}
          and{" "}
          <ChakraLink 
            as={Link} 
            href="/terms" 
            color="brand.primary"
            _hover={{ textDecoration: "underline" }}
          >
            Terms of Service
          </ChakraLink>
        </Text>
      </Container>
    </Wrapper>
  );
}

export default Login;

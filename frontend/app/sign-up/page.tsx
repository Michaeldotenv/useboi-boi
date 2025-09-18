"use client";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
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
  SimpleGrid,
  Progress,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from "@chakra-ui/react";
import Link from "next/link";
import { 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiArrowRight,
  FiCheck,
  FiX
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Wrapper from "../components/Wrapper";
import { BASE_URL } from "../lib/endpoints";

function SignUp() {
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  // role selection: base | merchant | rider
  const [role, setRole] = useState<"base" | "merchant" | "rider">("base");
  // merchant specific
  const [nameOfStore, setNameOfStore] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  // rider specific
  const [deliveryServiceCode, setDeliveryServiceCode] = useState("");

  const toast = useToast();
  const router = useRouter();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("text.primary", "white");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    
    setPasswordChecks(checks);
    
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleLogin = () => router.push("/login");
  const handleHomePage = () => router.push("/");

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() ||
        !formData.phone.trim() || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return false;
    }

    if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return false;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Weak password",
        description: "Password must meet at least 3 strength requirements.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    // extra validations per role
    if (role === "merchant") {
      if (!nameOfStore.trim() || !storeDescription.trim()) {
        toast({
          title: "Missing merchant fields",
          description: "Please provide store name and description.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }
    if (role === "rider") {
      if (!deliveryServiceCode.trim()) {
        toast({
          title: "Missing delivery code",
          description: "Please provide the delivery service code.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // choose endpoint and payload based on role
      const endpoint =
        role === "merchant"
          ? `${BASE_URL}/api/auth/merchantSignup`
          : role === "rider"
          ? `${BASE_URL}/api/auth/riderSignup`
          : `${BASE_URL}/api/auth/signup`;

      const payload =
        role === "merchant"
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              nameOfStore,
              storeDescription,
            }
          : role === "rider"
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              deliveryServiceCode,
            }
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let serverError = "Signup failed";

        try {
          const errorData = await res.json();
          serverError = errorData.error || serverError;
        } catch {
          const text = await res.text();
          serverError = text || serverError;
        }
        throw new Error(serverError);
      }

      toast({
        title: "Account created successfully!",
        description: "OTP verification code sent to your email.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top"
      });

      router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}&role=${role}`);
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "gray.300";
    if (passwordStrength === 1) return "red.400";
    if (passwordStrength === 2) return "orange.400";
    if (passwordStrength === 3) return "yellow.400";
    return "green.400";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Enter a password";
    if (passwordStrength === 1) return "Very Weak";
    if (passwordStrength === 2) return "Weak";
    if (passwordStrength === 3) return "Good";
    return "Strong";
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

        {/* Main Sign Up Card */}
        <Card 
          maxW="lg" 
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
                  Create Account
                </Heading>
                <Text 
                  color="text.secondary" 
                  fontSize="lg"
                  fontWeight="400"
                >
                  Join BoiBoi and start your journey
                </Text>
              </VStack>

              {/* Role Selection */}
              <Tabs
                variant="soft-rounded"
                colorScheme="purple"
                onChange={(index) => setRole(index === 0 ? "base" : index === 1 ? "merchant" : "rider")}
              >
                <TabList justifyContent="center">
                  <Tab>Customer</Tab>
                  <Tab>Merchant</Tab>
                  <Tab>Rider</Tab>
                </TabList>
              </Tabs>

              {/* Sign Up Form */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={5} align="stretch">
                  {/* Name Fields */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="600" 
                        fontSize="sm" 
                        color={textColor}
                        mb={2}
                      >
                        First Name
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
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
                          <Icon as={FiUser} color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="600" 
                        fontSize="sm" 
                        color={textColor}
                        mb={2}
                      >
                        Last Name
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
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
                          <Icon as={FiUser} color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </SimpleGrid>

                  {/* Conditional Fields by Role */}
                  {role === "merchant" && (
                    <>
                      <FormControl isRequired>
                        <FormLabel fontWeight="600" fontSize="sm" color={textColor} mb={2}>
                          Store Name
                        </FormLabel>
                        <Input
                          type="text"
                          value={nameOfStore}
                          onChange={(e) => setNameOfStore(e.target.value)}
                          placeholder="My Awesome Store"
                          h="56px"
                          borderRadius="16px"
                          px={4}
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 3px rgba(82,52,229,0.1)" }}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="600" fontSize="sm" color={textColor} mb={2}>
                          Store Description
                        </FormLabel>
                        <Input
                          type="text"
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          placeholder="Briefly describe your store"
                          h="56px"
                          borderRadius="16px"
                          px={4}
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 3px rgba(82,52,229,0.1)" }}
                        />
                      </FormControl>
                    </>
                  )}

                  {role === "rider" && (
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" fontSize="sm" color={textColor} mb={2}>
                        Delivery Service Code
                      </FormLabel>
                      <Input
                        type="text"
                        value={deliveryServiceCode}
                        onChange={(e) => setDeliveryServiceCode(e.target.value)}
                        placeholder="Enter your signup code (e.g., BBP2P)"
                        h="56px"
                        borderRadius="16px"
                        px={4}
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: "brand.primary", boxShadow: "0 0 0 3px rgba(82,52,229,0.1)" }}
                      />
                    </FormControl>
                  )}

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
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
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

                  {/* Phone Field */}
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="600" 
                      fontSize="sm" 
                      color={textColor}
                      mb={2}
                    >
                      Phone Number
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 801 234 5678"
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
                        <Icon as={FiPhone} color="gray.400" />
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
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <VStack spacing={2} mt={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="text.secondary">
                            Password Strength
                          </Text>
                          <Badge 
                            colorScheme={passwordStrength >= 3 ? "green" : passwordStrength >= 2 ? "yellow" : "red"}
                            fontSize="xs"
                          >
                            {getPasswordStrengthText()}
                          </Badge>
                        </HStack>
                        <Progress 
                          value={(passwordStrength / 4) * 100} 
                          colorScheme={passwordStrength >= 3 ? "green" : passwordStrength >= 2 ? "yellow" : "red"}
                          size="sm" 
                          borderRadius="full"
                        />
                        <VStack spacing={1} align="stretch" fontSize="xs">
                          <HStack>
                            <Icon 
                              as={passwordChecks.length ? FiCheck : FiX} 
                              color={passwordChecks.length ? "green.400" : "red.400"}
                            />
                            <Text color={passwordChecks.length ? "green.600" : "red.600"}>
                              At least 8 characters
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon 
                              as={passwordChecks.uppercase ? FiCheck : FiX} 
                              color={passwordChecks.uppercase ? "green.400" : "red.400"}
                            />
                            <Text color={passwordChecks.uppercase ? "green.600" : "red.600"}>
                              One uppercase letter
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon 
                              as={passwordChecks.lowercase ? FiCheck : FiX} 
                              color={passwordChecks.lowercase ? "green.400" : "red.400"}
                            />
                            <Text color={passwordChecks.lowercase ? "green.600" : "red.600"}>
                              One lowercase letter
                            </Text>
                          </HStack>
                          <HStack>
                            <Icon 
                              as={passwordChecks.number ? FiCheck : FiX} 
                              color={passwordChecks.number ? "green.400" : "red.400"}
                            />
                            <Text color={passwordChecks.number ? "green.600" : "red.600"}>
                              One number
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    )}
                  </FormControl>

                  {/* Confirm Password Field */}
                  <FormControl isRequired>
                    <FormLabel 
                      fontWeight="600" 
                      fontSize="sm" 
                      color={textColor}
                      mb={2}
                    >
                      Confirm Password
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        h="56px"
                        borderRadius="16px"
                        px={4}
                        py={3}
                        fontSize="md"
                        border="2px solid"
                        borderColor={
                          formData.confirmPassword && formData.password !== formData.confirmPassword 
                            ? "red.300" 
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "green.300"
                            : "gray.200"
                        }
                        _focus={{
                          borderColor: formData.password !== formData.confirmPassword ? "red.400" : "brand.primary",
                          boxShadow: formData.password !== formData.confirmPassword 
                            ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                            : "0 0 0 3px rgba(82, 52, 229, 0.1)"
                        }}
                        _hover={{
                          borderColor: formData.password !== formData.confirmPassword ? "red.400" : "gray.300"
                        }}
                      />
                      <InputRightElement h="56px" pr={4}>
                        <Box 
                          onClick={toggleShowConfirmPassword}
                          cursor="pointer"
                          _hover={{ color: "brand.primary" }}
                          transition="color 0.2s"
                        >
                          <Icon 
                            as={showConfirmPassword ? FiEyeOff : FiEye} 
                            color="gray.400" 
                            fontSize="lg"
                          />
                        </Box>
                      </InputRightElement>
                    </InputGroup>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        Passwords do not match
                      </Text>
                    )}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <Text fontSize="xs" color="green.500" mt={1}>
                        Passwords match
                      </Text>
                    )}
                  </FormControl>

                  {/* Sign Up Button */}
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
                    loadingText="Creating account..."
                    isDisabled={
                      !formData.firstName ||
                      !formData.lastName ||
                      !formData.email ||
                      !formData.phone ||
                      !formData.password ||
                      !formData.confirmPassword ||
                      passwordStrength < 3 ||
                      formData.password !== formData.confirmPassword
                    }
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
                    Create Account
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

              {/* Login Link */}
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
                onClick={handleLogin}
                leftIcon={<Icon as={FiUser} />}
                transition="all 0.2s ease"
              >
                Already have an account? Sign In
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
          By creating an account, you agree to our{" "}
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

export default SignUp;

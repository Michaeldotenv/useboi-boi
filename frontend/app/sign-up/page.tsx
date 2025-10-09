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
  SimpleGrid,
  Progress,
  Badge,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
  useSteps,
  useBreakpointValue,
  Stack,
  AspectRatio
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
  FiArrowLeft,
  FiCheck,
  FiX,
  FiShoppingBag,
  FiTruck,
  FiStar,
  FiShield,
  FiHeart
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Role selection and additional fields
  const [role, setRole] = useState("base");
  const [nameOfStore, setNameOfStore] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [deliveryServiceCode, setDeliveryServiceCode] = useState("");

  const toast = useToast();
  const router = useRouter();

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", md: "container.md" });
  const cardMaxW = useBreakpointValue({ base: "100%", md: "500px" });
  const cardPadding = useBreakpointValue({ base: 4, md: 10 });
  const containerPadding = useBreakpointValue({ base: 4, md: 12 });
  const logoSize = useBreakpointValue({ base: { w: "140px", h: "42px" }, md: { w: "180px", h: "55px" } });
  const stepperSize = useBreakpointValue({ base: "sm", md: "md" });
  const stepperOrientation = useBreakpointValue<"horizontal" | "vertical">({ base: "horizontal", md: "horizontal" }) || "horizontal";

  // Multi-step functionality
  const steps = [
    { title: isMobile ? 'Type' : 'Account Type', description: 'Choose your role' },
    { title: isMobile ? 'Info' : 'Personal Info', description: 'Basic details' },
    { title: isMobile ? 'Extra' : 'Additional Info', description: 'Role-specific details' },
    { title: 'Security', description: 'Password setup' }
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  // Remove gradient background - will use white with purple patches

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

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

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Account Type
        return true; // Always valid
      case 1: // Personal Info
        return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.phone.trim();
      case 2: // Additional Info
        if (role === "merchant") {
          return nameOfStore.trim() && storeDescription.trim();
        }
        if (role === "rider") {
          return deliveryServiceCode.trim();
        }
        return true; // Base role doesn't need additional info
      case 3: // Security
        return formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword && 
               passwordStrength >= 3;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    } else {
      toast({
        title: "Please complete all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  const handlePrevious = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const endpoint =
        role === "merchant"
          ? `${BASE_URL}/api/auth/merchantSignup`
          : role === "rider"
          ? `${BASE_URL}/api/auth/riderSignup`
          : `${BASE_URL}/api/auth/signup`;

      const payload =
        role === "merchant"
          ? { ...formData, nameOfStore, storeDescription }
          : role === "rider"
          ? { ...formData, deliveryServiceCode }
          : formData;

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Signup failed",
        description: message,
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
    if (passwordStrength === 0) return "gray";
    if (passwordStrength === 1) return "red";
    if (passwordStrength === 2) return "orange";
    if (passwordStrength === 3) return "yellow";
    return "green";
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Account Type Selection
        return (
          <VStack spacing={6} align="stretch">
            <VStack spacing={3} textAlign="center">
              <Heading 
                size={isMobile ? "sm" : "md"} 
                color={textColor}
                px={2}
              >
                Choose Your Account Type
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={isMobile ? "xs" : "sm"}
                px={2}
              >
                Select the option that best describes your role
              </Text>
            </VStack>

            <VStack spacing={4}>
              <motion.div
                style={{ width: "100%" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  w="100%"
                  h={isMobile ? "80px" : "90px"}
                  variant={role === "base" ? "solid" : "outline"}
                  bg={role === "base" ? "brand.primary" : "white"}
                  color={role === "base" ? "white" : "gray.700"}
                  borderColor={role === "base" ? "brand.primary" : "gray.300"}
                  borderWidth="2px"
                  onClick={() => setRole("base")}
                  leftIcon={<Icon as={FiUser} boxSize={isMobile ? 5 : 6} />}
                  borderRadius="16px"
                  fontSize={isMobile ? "sm" : "md"}
                  fontWeight="600"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: role === "base" ? "0 12px 30px rgba(82, 52, 229, 0.4)" : "0 8px 25px rgba(0, 0, 0, 0.15)",
                    bg: role === "base" ? "brand.primaryDark" : "gray.50",
                    borderColor: role === "base" ? "brand.primaryDark" : "brand.primary"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  boxShadow={role === "base" ? "0 4px 15px rgba(82, 52, 229, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"}
                >
                  <VStack spacing={1} align="start" w="100%">
                    <Text fontSize={isMobile ? "md" : "lg"} fontWeight="700" color="inherit">
                      Customer
                    </Text>
                    <Text fontSize={isMobile ? "xs" : "sm"} opacity={0.8} color="inherit">
                      Order food and services
                    </Text>
                  </VStack>
                </Button>
              </motion.div>

              <motion.div
                style={{ width: "100%" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  w="100%"
                  h={isMobile ? "80px" : "90px"}
                  variant={role === "merchant" ? "solid" : "outline"}
                  bg={role === "merchant" ? "brand.primary" : "white"}
                  color={role === "merchant" ? "white" : "gray.700"}
                  borderColor={role === "merchant" ? "brand.primary" : "gray.300"}
                  borderWidth="2px"
                  onClick={() => setRole("merchant")}
                  leftIcon={<Icon as={FiShoppingBag} boxSize={isMobile ? 5 : 6} />}
                  borderRadius="16px"
                  fontSize={isMobile ? "sm" : "md"}
                  fontWeight="600"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: role === "merchant" ? "0 12px 30px rgba(82, 52, 229, 0.4)" : "0 8px 25px rgba(0, 0, 0, 0.15)",
                    bg: role === "merchant" ? "brand.primaryDark" : "gray.50",
                    borderColor: role === "merchant" ? "brand.primaryDark" : "brand.primary"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  boxShadow={role === "merchant" ? "0 4px 15px rgba(82, 52, 229, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"}
                >
                  <VStack spacing={1} align="start" w="100%">
                    <Text fontSize={isMobile ? "md" : "lg"} fontWeight="700" color="inherit">
                      Merchant
                    </Text>
                    <Text fontSize={isMobile ? "xs" : "sm"} opacity={0.8} color="inherit">
                      Sell your products
                    </Text>
                  </VStack>
                </Button>
              </motion.div>

              <motion.div
                style={{ width: "100%" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  w="100%"
                  h={isMobile ? "80px" : "90px"}
                  variant={role === "rider" ? "solid" : "outline"}
                  bg={role === "rider" ? "brand.primary" : "white"}
                  color={role === "rider" ? "white" : "gray.700"}
                  borderColor={role === "rider" ? "brand.primary" : "gray.300"}
                  borderWidth="2px"
                  onClick={() => setRole("rider")}
                  leftIcon={<Icon as={FiTruck} boxSize={isMobile ? 5 : 6} />}
                  borderRadius="16px"
                  fontSize={isMobile ? "sm" : "md"}
                  fontWeight="600"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: role === "rider" ? "0 12px 30px rgba(82, 52, 229, 0.4)" : "0 8px 25px rgba(0, 0, 0, 0.15)",
                    bg: role === "rider" ? "brand.primaryDark" : "gray.50",
                    borderColor: role === "rider" ? "brand.primaryDark" : "brand.primary"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  boxShadow={role === "rider" ? "0 4px 15px rgba(82, 52, 229, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.1)"}
                >
                  <VStack spacing={1} align="start" w="100%">
                    <Text fontSize={isMobile ? "md" : "lg"} fontWeight="700" color="inherit">
                      Delivery Rider
                    </Text>
                    <Text fontSize={isMobile ? "xs" : "sm"} opacity={0.8} color="inherit">
                      Deliver orders
                    </Text>
                  </VStack>
                </Button>
              </motion.div>
            </VStack>
          </VStack>
        );

      case 1: // Personal Information
        return (
          <VStack spacing={4} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Heading 
                size={isMobile ? "sm" : "md"} 
                color={textColor}
                px={2}
              >
                Personal Information
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={isMobile ? "xs" : "sm"}
                px={2}
              >
                Tell us a bit about yourself
              </Text>
            </VStack>

            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={4}
            >
              <FormControl isRequired>
                <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                  First Name
                </FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"} // Prevents zoom on iOS
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                  Last Name
                </FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
              </FormControl>
            </Stack>

            <FormControl isRequired>
              <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                Email Address
              </FormLabel>
              <InputGroup>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement h="44px">
                  <Icon as={FiMail} color="gray.400" />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                Phone Number
              </FormLabel>
              <InputGroup>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 801 234 5678"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement h="44px">
                  <Icon as={FiPhone} color="gray.400" />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </VStack>
        );

      case 2: // Additional Information
        if (role === "base") {
          return (
            <VStack spacing={6} align="stretch" textAlign="center" py={8}>
              <Heading 
                size={isMobile ? "sm" : "md"} 
                color={textColor}
                px={2}
              >
                Almost Done!
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={isMobile ? "xs" : "sm"}
                px={2}
              >
                As a customer, you're ready to set up your password
              </Text>
              <Icon as={FiCheck} color="green.500" boxSize={isMobile ? 8 : 12} />
            </VStack>
          );
        }

        return (
          <VStack spacing={4} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Heading 
                size={isMobile ? "sm" : "md"} 
                color={textColor}
                px={2}
              >
                {role === "merchant" ? "Store Information" : "Delivery Information"}
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={isMobile ? "xs" : "sm"}
                px={2}
              >
                {role === "merchant" 
                  ? "Tell us about your store" 
                  : "Enter your delivery service details"
                }
              </Text>
            </VStack>

            {role === "merchant" ? (
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                    Store Name
                  </FormLabel>
                  <Input
                    value={nameOfStore}
                    onChange={(e) => setNameOfStore(e.target.value)}
                    placeholder="My Awesome Store"
                    h="44px"
                    borderRadius="10px"
                    bg={inputBg}
                    border="1px solid"
                    borderColor="gray.200"
                    fontSize={isMobile ? "16px" : "14px"}
                    _focus={{
                      borderColor: "brand.primary",
                      boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                      bg: "white"
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                    Store Description
                  </FormLabel>
                  <Input
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Briefly describe your store"
                    h="44px"
                    borderRadius="10px"
                    bg={inputBg}
                    border="1px solid"
                    borderColor="gray.200"
                    fontSize={isMobile ? "16px" : "14px"}
                    _focus={{
                      borderColor: "brand.primary",
                      boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                      bg: "white"
                    }}
                  />
                </FormControl>
              </VStack>
            ) : (
              <FormControl isRequired>
                <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                  Delivery Service Code
                </FormLabel>
                <Input
                  value={deliveryServiceCode}
                  onChange={(e) => setDeliveryServiceCode(e.target.value)}
                  placeholder="Enter your signup code (e.g., BBP2P)"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
              </FormControl>
            )}
          </VStack>
        );

      case 3: // Security
        return (
          <VStack spacing={4} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Heading 
                size={isMobile ? "sm" : "md"} 
                color={textColor}
                px={2}
              >
                Secure Your Account
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={isMobile ? "xs" : "sm"}
                px={2}
              >
                Create a strong password to protect your account
              </Text>
            </VStack>

            <FormControl isRequired>
              <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor="gray.200"
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement h="44px">
                  <Box 
                    onClick={toggleShowPassword}
                    cursor="pointer"
                    _hover={{ color: "brand.primary" }}
                    p={2}
                  >
                    <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" />
                  </Box>
                </InputRightElement>
              </InputGroup>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <VStack spacing={2} mt={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600">
                      Password Strength
                    </Text>
                    <Badge 
                      colorScheme={getPasswordStrengthColor()}
                      fontSize={isMobile ? "2xs" : "xs"}
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {passwordStrength === 0 ? "Weak" : 
                       passwordStrength === 1 ? "Very Weak" :
                       passwordStrength === 2 ? "Weak" :
                       passwordStrength === 3 ? "Good" : "Strong"}
                    </Badge>
                  </HStack>
                  <Progress 
                    value={(passwordStrength / 4) * 100} 
                    colorScheme={getPasswordStrengthColor()}
                    size="sm" 
                    borderRadius="full"
                  />
                  <SimpleGrid 
                    columns={isMobile ? 1 : 2} 
                    spacing={1} 
                    fontSize={isMobile ? "2xs" : "xs"}
                  >
                    <HStack spacing={1}>
                      <Icon 
                        as={passwordChecks.length ? FiCheck : FiX} 
                        color={passwordChecks.length ? "green.400" : "red.400"}
                        boxSize={3}
                      />
                      <Text color={passwordChecks.length ? "green.600" : "red.600"}>
                        8+ characters
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon 
                        as={passwordChecks.uppercase ? FiCheck : FiX} 
                        color={passwordChecks.uppercase ? "green.400" : "red.400"}
                        boxSize={3}
                      />
                      <Text color={passwordChecks.uppercase ? "green.600" : "red.600"}>
                        Uppercase letter
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon 
                        as={passwordChecks.lowercase ? FiCheck : FiX} 
                        color={passwordChecks.lowercase ? "green.400" : "red.400"}
                        boxSize={3}
                      />
                      <Text color={passwordChecks.lowercase ? "green.600" : "red.600"}>
                        Lowercase letter
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon 
                        as={passwordChecks.number ? FiCheck : FiX} 
                        color={passwordChecks.number ? "green.400" : "red.400"}
                        boxSize={3}
                      />
                      <Text color={passwordChecks.number ? "green.600" : "red.600"}>
                        Number
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </VStack>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="500" fontSize="sm" color={textColor} mb={2}>
                Confirm Password
              </FormLabel>
              <InputGroup>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  h="44px"
                  borderRadius="10px"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? "red.300" 
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "green.300"
                      : "gray.200"
                  }
                  fontSize={isMobile ? "16px" : "14px"}
                  _focus={{
                    borderColor: formData.password !== formData.confirmPassword ? "red.400" : "brand.primary",
                    boxShadow: formData.password !== formData.confirmPassword 
                      ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                      : "0 0 0 3px rgba(82, 52, 229, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement h="44px">
                  <Box 
                    onClick={toggleShowConfirmPassword}
                    cursor="pointer"
                    _hover={{ color: "brand.primary" }}
                    p={2}
                  >
                    <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.400" />
                  </Box>
                </InputRightElement>
              </InputGroup>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <Text fontSize="xs" color="red.500" mt={2}>
                  Passwords do not match
                </Text>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Text fontSize="xs" color="green.500" mt={2}>
                  Passwords match
                </Text>
              )}
            </FormControl>
          </VStack>
        );

      default:
        return null;
    }
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
        top="-40%"
        right="-20%"
        w={isMobile ? "400px" : "500px"}
        h={isMobile ? "400px" : "500px"}
        bg="brand.primary"
        borderRadius="full"
        opacity={0.1}
        filter="blur(60px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-15%"
        w={isMobile ? "300px" : "400px"}
        h={isMobile ? "300px" : "400px"}
        bg="brand.primaryLight"
        borderRadius="full"
        opacity={0.08}
        filter="blur(50px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="15%"
        left="-10%"
        w={isMobile ? "250px" : "350px"}
        h={isMobile ? "250px" : "350px"}
        bg="brand.primaryLight"
        borderRadius="full"
        opacity={0.06}
        filter="blur(40px)"
        zIndex={0}
      />
      
      <Container maxW={containerMaxW} py={containerPadding} px={isMobile ? 4 : 8} position="relative" zIndex={1}>
        <Flex direction="column" align="center" minH="100vh" justify="center">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={"/Boiboi (Palatinate blue).png"}
              alt={"BoiBoi Logo"}
              objectFit="cover"
              width={logoSize?.w ?? "180px"}
              height={logoSize?.h ?? "55px"}
              cursor="pointer"
              onClick={handleHomePage}
              transition="all 0.3s ease"
              _hover={{ transform: "scale(1.05)" }}
              mb={isMobile ? 6 : 8}
              filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))"
            />
          </motion.div>

          {/* Main Signup Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            style={{ width: "100%", maxWidth: cardMaxW }}
          >
            <Card 
              maxW={cardMaxW} 
              w="100%"
              boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.15)" 
              borderRadius={isMobile ? "24px" : "32px"}
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
              mx={isMobile ? 0 : "auto"}
              position="relative"
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
              <VStack spacing={isMobile ? 6 : 8} align="stretch">
                {/* Header with Progress */}
                <VStack spacing={3} textAlign="center">
                  <Heading 
                    size={isMobile ? "md" : "lg"} 
                    fontWeight="700" 
                    color={textColor}
                    letterSpacing="-0.02em"
                  >
                    Create Account
                  </Heading>
                  
                  {/* Custom Progress Stepper */}
                  <Box w="100%" px={isMobile ? 2 : 4}>
                    <HStack spacing={0} justify="space-between" align="center">
                      {steps.map((step, index) => (
                        <Box key={index} flex="1" position="relative">
                          <VStack spacing={2} align="center">
                            {/* Step Circle */}
                            <Box
                              w={isMobile ? "32px" : "40px"}
                              h={isMobile ? "32px" : "40px"}
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              bg={
                                index < activeStep 
                                  ? "brand.primary" 
                                  : index === activeStep 
                                    ? "brand.primary" 
                                    : "gray.200"
                              }
                              color={
                                index < activeStep || index === activeStep
                                  ? "white"
                                  : "gray.500"
                              }
                              fontWeight="600"
                              fontSize={isMobile ? "xs" : "sm"}
                              border="2px solid"
                              borderColor={
                                index < activeStep 
                                  ? "brand.primary" 
                                  : index === activeStep 
                                    ? "brand.primary" 
                                    : "gray.200"
                              }
                              transition="all 0.3s ease"
                              _before={
                                index < activeStep ? {
                                  content: '"✓"',
                                  fontSize: isMobile ? "12px" : "14px",
                                  fontWeight: "bold"
                                } : {}
                              }
                            >
                              {index < activeStep ? (
                                <Icon as={FiCheck} boxSize={isMobile ? 3 : 4} />
                              ) : (
                                <Text fontSize={isMobile ? "xs" : "sm"} fontWeight="600">
                                  {index + 1}
                                </Text>
                              )}
                            </Box>
                            
                            {/* Step Title */}
                            <Text
                              fontSize={isMobile ? "2xs" : "xs"}
                              fontWeight={index === activeStep ? "600" : "500"}
                              color={
                                index <= activeStep ? "brand.primary" : "gray.500"
                              }
                              textAlign="center"
                              maxW="60px"
                              lineHeight="tight"
                              transition="all 0.3s ease"
                            >
                              {step.title}
                            </Text>
                          </VStack>
                          
                          {/* Connecting Line */}
                          {index < steps.length - 1 && (
                            <Box
                              position="absolute"
                              top={isMobile ? "16px" : "20px"}
                              left="50%"
                              right="-50%"
                              h="2px"
                              bg={
                                index < activeStep 
                                  ? "brand.primary" 
                                  : "gray.200"
                              }
                              transform="translateY(-50%)"
                              transition="all 0.3s ease"
                            />
                          )}
                        </Box>
                      ))}
                    </HStack>
                  </Box>

                  <Text 
                    color="gray.600" 
                    fontSize={isMobile ? "xs" : "sm"}
                    textAlign="center"
                    px={2}
                  >
                    Step {activeStep + 1} of {steps.length}: {steps[activeStep].description}
                  </Text>
                </VStack>

                {/* Step Content */}
                <Box minH={isMobile ? "300px" : "400px"}>
                  {renderStepContent()}
                </Box>

                {/* Navigation Buttons */}
                <Stack 
                  direction={isMobile ? "column" : "row"}
                  spacing={3} 
                  justify="space-between"
                  w="100%"
                >
                  {activeStep > 0 ? (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      leftIcon={<Icon as={FiArrowLeft} />}
                      borderRadius="12px"
                      h={isMobile ? "48px" : "52px"}
                      px={6}
                      fontSize={isMobile ? "sm" : "md"}
                      fontWeight="600"
                      order={isMobile ? 2 : 1}
                      w={isMobile ? "100%" : "auto"}
                      border="2px solid"
                      borderColor="gray.300"
                      color="gray.700"
                      bg="white"
                      _hover={{
                        borderColor: "brand.primary",
                        color: "brand.primary",
                        bg: "rgba(82, 52, 229, 0.05)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 15px rgba(82, 52, 229, 0.2)"
                      }}
                      _active={{
                        transform: "translateY(0)"
                      }}
                      transition="all 0.2s ease"
                    >
                      Previous
                    </Button>
                  ) : (
                    <Box order={isMobile ? 2 : 1} />
                  )}

                  {activeStep < steps.length - 1 ? (
                    <Button
                      bg="brand.primary"
                      color="white"
                      onClick={handleNext}
                      rightIcon={<Icon as={FiArrowRight} />}
                      isDisabled={!validateStep(activeStep)}
                      borderRadius="12px"
                      h={isMobile ? "48px" : "52px"}
                      px={6}
                      fontSize={isMobile ? "sm" : "md"}
                      fontWeight="600"
                      order={isMobile ? 1 : 2}
                      w={isMobile ? "100%" : "auto"}
                      _hover={{
                        bg: "brand.primaryDark",
                        transform: "translateY(-1px)",
                        boxShadow: "0 8px 25px rgba(82, 52, 229, 0.4)"
                      }}
                      _active={{
                        transform: "translateY(0)"
                      }}
                      _disabled={{
                        bg: "gray.300",
                        color: "gray.500",
                        cursor: "not-allowed",
                        transform: "none",
                        boxShadow: "none"
                      }}
                      transition="all 0.2s ease"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      bg="brand.primary"
                      color="white"
                      onClick={handleSubmit}
                      rightIcon={<Icon as={FiCheck} />}
                      isLoading={isLoading}
                      loadingText="Creating Account..."
                      isDisabled={!validateStep(activeStep)}
                      borderRadius="12px"
                      h={isMobile ? "48px" : "52px"}
                      px={6}
                      fontSize={isMobile ? "sm" : "md"}
                      fontWeight="600"
                      order={isMobile ? 1 : 2}
                      w={isMobile ? "100%" : "auto"}
                      _hover={{
                        bg: "brand.primaryDark",
                        transform: "translateY(-1px)",
                        boxShadow: "0 8px 25px rgba(82, 52, 229, 0.4)"
                      }}
                      _active={{
                        transform: "translateY(0)"
                      }}
                      _disabled={{
                        bg: "gray.300",
                        color: "gray.500",
                        cursor: "not-allowed",
                        transform: "none",
                        boxShadow: "none"
                      }}
                      transition="all 0.2s ease"
                    >
                      Create Account
                    </Button>
                  )}
                </Stack>

                {/* Divider */}
                <HStack>
                  <Divider />
                  <Text 
                    fontSize={isMobile ? "xs" : "sm"} 
                    color="gray.500" 
                    px={2} 
                    whiteSpace="nowrap"
                  >
                    OR
                  </Text>
                  <Divider />
                </HStack>

                {/* Login Link */}
                <Button
                  variant="outline"
                  size="lg"
                  h={isMobile ? "48px" : "52px"}
                  fontSize={isMobile ? "sm" : "md"}
                  fontWeight="600"
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="gray.300"
                  color="gray.700"
                  bg="white"
                  _hover={{
                    borderColor: "brand.primary",
                    color: "brand.primary",
                    bg: "rgba(82, 52, 229, 0.05)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 15px rgba(82, 52, 229, 0.2)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  onClick={handleLogin}
                  leftIcon={<Icon as={FiUser} />}
                  transition="all 0.2s ease"
                >
                  {isMobile ? "Sign In" : "Already have an account? Sign In"}
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
              By creating an account, you agree to our{" "}
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
        </Flex>
      </Container>
    </Box>
  );
}

export default SignUp;
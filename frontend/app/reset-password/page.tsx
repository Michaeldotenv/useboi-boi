"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Text,
  useToast,
  VStack,
  Box,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Wrapper from "../components/Wrapper";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    // Get email and token from URL parameters
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    if (!emailParam || !tokenParam) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or expired",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !token) {
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword(email, token, password);

      setPasswordReset(true);
      toast({
        title: "Password reset successful!",
        description: "You can now login with your new password",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description: error.message || "Please try again or request a new reset link",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomePage = () => {
    router.push("/");
  };

  return (
    <Wrapper>
      <Flex justifyContent={"center"}>
        <Image
          src={"/Boiboi (Palatinate blue).png"}
          alt={"BoiBoi Logo"}
          objectFit={"cover"}
          width={"200px"}
          height={"60px"}
          cursor={"pointer"}
          onClick={handleHomePage}
          aspectRatio={"4/3"}
          marginTop={"1.5em"}
        />
      </Flex>

      <Flex justifyContent={"center"} mt={"3em"}>
        <Box w={{ md: "461px", base: "300px" }}>
          {passwordReset ? (
            <VStack spacing={4} align="stretch">
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="16px"
                p={6}
              >
                <AlertIcon boxSize="40px" mr={0} mb={4} />
                <Text fontSize="xl" fontWeight="700" mb={2}>
                  Password Reset Successful!
                </Text>
                <AlertDescription maxWidth="sm">
                  Your password has been successfully reset. You can now login with your new password.
                </AlertDescription>
              </Alert>

              <Button
                bgColor={"#5438DC"}
                color={"#fff"}
                width={"100%"}
                fontSize={"17px"}
                fontWeight={"700"}
                borderRadius={"16px"}
                h={"74px"}
                onClick={() => router.push("/login")}
                _hover={{ bgColor: "#4329c7" }}
              >
                Go to Login
              </Button>
            </VStack>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mt={"3em"} w={"100%"}>
                <Text
                  fontWeight={"700"}
                  fontSize={"24px"}
                  letterSpacing={"0.75px"}
                  mb={"0.5em"}
                >
                  Reset Your Password
                </Text>
                <Text fontSize={"16px"} color={"gray.600"} mb={"1.5em"}>
                  Enter your new password below
                </Text>

                {/* New Password */}
                <FormLabel fontWeight={"400"} fontSize={"18px"} mt={4}>
                  New Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    color={"#000"}
                    fontSize={"17px"}
                    fontWeight={"400"}
                    h={"74px"}
                    w={"100%"}
                    borderRadius={"16px"}
                    px={"24px"}
                    py={"16px"}
                    placeholder="Enter new password"
                    letterSpacing={"-0.41px"}
                    mb={"1em"}
                    isDisabled={isLoading}
                  />
                  <InputRightElement h={"74px"} pr={4}>
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>

                {/* Confirm Password */}
                <FormLabel fontWeight={"400"} fontSize={"18px"}>
                  Confirm Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    color={"#000"}
                    fontSize={"17px"}
                    fontWeight={"400"}
                    h={"74px"}
                    w={"100%"}
                    borderRadius={"16px"}
                    px={"24px"}
                    py={"16px"}
                    placeholder="Confirm new password"
                    letterSpacing={"-0.41px"}
                    mb={"1em"}
                    isDisabled={isLoading}
                  />
                  <InputRightElement h={"74px"} pr={4}>
                    <IconButton
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Flex justifyContent={"center"} display={"block"} mt={"1em"}>
                <Button
                  mt={"1em"}
                  bgColor={"#5438DC"}
                  color={"#fff"}
                  width={"100%"}
                  fontSize={"17px"}
                  fontWeight={"700"}
                  borderRadius={"16px"}
                  type="submit"
                  h={"74px"}
                  isLoading={isLoading}
                  loadingText="Resetting..."
                  _hover={{ bgColor: "#4329c7" }}
                >
                  Reset Password
                </Button>

                <Text textAlign="center" mt={4} fontSize="sm" color="gray.600">
                  Remember your password?{" "}
                  <ChakraLink
                    as={Link}
                    href="/login"
                    color="purple.600"
                    fontWeight="600"
                  >
                    Back to Login
                  </ChakraLink>
                </Text>
              </Flex>
            </form>
          )}
        </Box>
      </Flex>
    </Wrapper>
  );
}

export default ResetPassword;

"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      
      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your email for password reset instructions",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later",
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
          {emailSent ? (
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
                  Email Sent!
                </Text>
                <AlertDescription maxWidth="sm">
                  We've sent password reset instructions to <strong>{email}</strong>.
                  Please check your email and follow the link to reset your password.
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
                Back to Login
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.600">
                Didn't receive the email?{" "}
                <ChakraLink
                  color="purple.600"
                  fontWeight="600"
                  onClick={() => setEmailSent(false)}
                  cursor="pointer"
                >
                  Try again
                </ChakraLink>
              </Text>
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
                  Forgot Password?
                </Text>
                <Text fontSize={"16px"} color={"gray.600"} mb={"1.5em"}>
                  Enter your email address and we'll send you instructions to reset your password.
                </Text>
                <FormLabel fontWeight={"400"} fontSize={"18px"}>
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  color={"#000"}
                  fontSize={"17px"}
                  fontWeight={"400"}
                  h={"74px"}
                  w={"100%"}
                  borderRadius={"16px"}
                  px={"24px"}
                  py={"16px"}
                  placeholder="johndoe123@gmail.com"
                  letterSpacing={"-0.41px"}
                  mb={"1em"}
                  isDisabled={isLoading}
                />
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
                  loadingText="Sending..."
                  _hover={{ bgColor: "#4329c7" }}
                >
                  Send Reset Link
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

export default ForgotPassword;
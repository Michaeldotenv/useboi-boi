"use client";
import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  PinInput,
  PinInputField,
  Text,
  useToast
} from "@chakra-ui/react";
import { useState, Suspense } from "react";
import Wrapper from "../components/Wrapper";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_URL } from "../lib/endpoints";

function OtpVerificationContent() {
  const [shortCode, setShortCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const role = searchParams.get("role") || "base";

  const handleHomePage = () => {
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Missing email.",
        description: "We couldn't find your email. Please start signup again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    try {
      setIsLoading(true);

      const endpoint =
        role === "merchant"
          ? `${BASE_URL}/api/auth/verifyMerchantSignup`
          : role === "rider"
          ? `${BASE_URL}/api/auth/verifyRiderSignup`
          : `${BASE_URL}/api/auth/verifySignup`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: shortCode
        })
      });

      if (!res.ok) {
      const errorData = await res.json();
      console.log("Verification API response error:", errorData);
      throw new Error(errorData.message || errorData.error || "Verification failed");
    }

      toast({
        title: "Verified!",
        description: "Your account has been successfully verified. Please log in.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });

      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Verification failed.",
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
        <form onSubmit={handleSubmit}>
          <Text
            fontSize={"20px"}
            fontWeight={"700"}
            color={"#000000"}
            letterSpacing={"0.75px"}
            lineHeight={"24px"}
          >
            Confirm the code we sent you.
          </Text>
          <HStack spacing={"3"} my={"1em"}>
            <PinInput
              onChange={(value) => setShortCode(value)}
              type="number"
              size={"lg"}
              placeholder="*"
            >
              <PinInputField
                required
                border={"1px solid"}
                borderColor={"#F2F2F7"}
                borderRadius={"16px"}
                w={"74px"}
                h={"74px"}
              />
              <PinInputField
                required
                border={"1px solid"}
                borderColor={"#F2F2F7"}
                borderRadius={"16px"}
                w={"74px"}
                h={"74px"}
              />
              <PinInputField
                required
                border={"1px solid"}
                borderColor={"#F2F2F7"}
                borderRadius={"16px"}
                w={"74px"}
                h={"74px"}
              />
              <PinInputField
                required
                border={"1px solid"}
                borderColor={"#F2F2F7"}
                borderRadius={"16px"}
                w={"74px"}
                h={"74px"}
              />
            </PinInput>
          </HStack>

          <Box>
            <Text
              color={"#8E8E93"}
              fontSize={"15px"}
              cursor={"pointer"}
              fontWeight={"400"}
              letterSpacing={"-0.08px"}
            >
              Resend
            </Text>
          </Box>

          <Flex justifyContent={"center"}>
            <Button
              isDisabled={shortCode.length !== 4}
              width={"100%"}
              mt={"2em"}
              color={"#fff"}
              borderRadius={"16px"}
              bgColor={"brand.primary"}
              isLoading={isLoading}
              type="submit"
              h={"74px"}
              variant={"primary"}
            >
              Confirm
            </Button>
          </Flex>
        </form>
      </Flex>
    </Wrapper>
  );
}

export default function OtpVerification() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtpVerificationContent />
    </Suspense>
  );
}

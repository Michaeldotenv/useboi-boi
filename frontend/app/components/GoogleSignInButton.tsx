"use client";
import { Button, Icon, useToast } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../lib/endpoints";

interface GoogleSignInButtonProps {
  mode: "signin" | "signup";
  userType?: "base" | "merchant" | "rider";
}

export default function GoogleSignInButton({ mode, userType = "base" }: GoogleSignInButtonProps) {
  const toast = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      // Load Google Sign-In library
      const google = (window as any).google;
      
      if (!google) {
        toast({
          title: "Google Sign-In not available",
          description: "Please try again or use email/password",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            // Send the token to our backend
            const res = await fetch(`${BASE_URL}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: response.credential,
                type: userType,
              }),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.error || "Google authentication failed");
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
              title: mode === "signin" ? "Login successful!" : "Account created!",
              description: `Welcome${user.firstName ? ", " + user.firstName : ""}!`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            // Redirect based on user role
            if (user.role === "admin") {
              router.push("/admin");
            } else if (user.role === "merchant" || user.type === "merchant") {
              router.push("/merchant-dashboard");
            } else if (user.role === "rider" || user.type === "rider") {
              router.push("/rider-dashboard");
            } else {
              router.push("/user-dashboard");
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            toast({
              title: mode === "signin" ? "Login failed" : "Signup failed",
              description: message,
              status: "error",
              duration: 4000,
              isClosable: true,
            });
          }
        },
      });

      // Trigger the One Tap UI or button
      google.accounts.id.prompt();
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize Google Sign-In",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      w="full"
      h="42px"
      bg="white"
      border="1px"
      borderColor="gray.300"
      color="gray.700"
      fontWeight="600"
      fontSize="14px"
      borderRadius="10px"
      leftIcon={<Icon as={FcGoogle} boxSize={5} />}
      onClick={handleGoogleSignIn}
      _hover={{ bg: "gray.50", borderColor: "gray.400" }}
      _active={{ bg: "gray.100" }}
    >
      {mode === "signin" ? "Sign in" : "Sign up"} with Google
    </Button>
  );
}

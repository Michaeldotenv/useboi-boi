"use client";
import { Button, Icon, useToast } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../lib/endpoints";

interface GoogleSignInButtonProps {
  mode: "signin" | "signup";
  userType?: "base" | "merchant" | "rider";
}

declare global {
  interface Window {
    google?: any;
    googleSignInInitialized?: boolean;
  }
}

export default function GoogleSignInButton({
  mode,
  userType = "base",
}: GoogleSignInButtonProps) {
  const toast = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Sign-In script if not already loaded
    if (!document.getElementById("google-signin-script")) {
      const script = document.createElement("script");
      script.id = "google-signin-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeGoogleButton();
      };
    } else {
      initializeGoogleButton();
    }

    return () => {
      // Cleanup: cancel any pending Google Sign-In requests
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const initializeGoogleButton = () => {
    if (!window.google || !buttonRef.current) {
      setTimeout(initializeGoogleButton, 100);
      return;
    }

    try {
      // Cancel any existing requests before initializing
      if (window.google.accounts?.id) {
        window.google.accounts.id.cancel();
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth,
        text: mode === "signin" ? "signin_with" : "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    } catch (error) {
      console.error("Failed to initialize Google Sign-In:", error);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
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

      localStorage.setItem("boiboi_token", token);
      localStorage.setItem("boiboi_user", JSON.stringify(user));

      toast({
        title: mode === "signin" ? "Login successful!" : "Account created!",
        description: `Welcome${user.firstName ? ", " + user.firstName : ""}!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

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
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={buttonRef}
      style={{
        width: "100%",
        minHeight: "42px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
}

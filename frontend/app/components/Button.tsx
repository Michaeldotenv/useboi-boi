"use client";

import { Button as ChakraButton, ButtonProps, useColorModeValue } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "gradient" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
  interactive?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  interactive = true,
  ...props
}: CustomButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "brand.primary",
          color: "white",
          border: "none",
          _hover: {
            bg: "brand.primaryDark",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(82, 52, 229, 0.3)",
          },
        };
      case "secondary":
        return {
          bg: "brand.secondary",
          color: "white",
          border: "none",
          _hover: {
            bg: "brand.secondaryDark",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(255, 107, 53, 0.3)",
          },
        };
      case "outline":
        return {
          bg: "transparent",
          color: "brand.primary",
          border: "2px solid",
          borderColor: "brand.primary",
          _hover: {
            bg: "brand.primary",
            color: "white",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(82, 52, 229, 0.2)",
          },
        };
      case "ghost":
        return {
          bg: "transparent",
          color: "gray.600",
          border: "none",
          _hover: {
            bg: "gray.100",
            color: "brand.primary",
            transform: "translateY(-1px)",
          },
        };
      case "gradient":
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
          },
        };
      case "glass":
        return {
          bg: "rgba(255, 255, 255, 0.1)",
          color: "white",
          border: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
          _hover: {
            bg: "rgba(255, 255, 255, 0.2)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
          },
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          px: 4,
          py: 2,
          fontSize: "sm",
          h: "32px",
          borderRadius: "8px",
        };
      case "md":
        return {
          px: 6,
          py: 3,
          fontSize: "md",
          h: "40px",
          borderRadius: "10px",
        };
      case "lg":
        return {
          px: 8,
          py: 4,
          fontSize: "lg",
          h: "48px",
          borderRadius: "12px",
        };
      case "xl":
        return {
          px: 10,
          py: 5,
          fontSize: "xl",
          h: "56px",
          borderRadius: "16px",
        };
      default:
        return {};
    }
  };

  return (
    <ChakraButton
      isLoading={loading}
      width={fullWidth ? "full" : "auto"}
      fontWeight="600"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _active={interactive ? {
        transform: "translateY(0)",
        transition: "all 0.1s ease"
      } : {}}
      _disabled={{
        opacity: 0.6,
        cursor: "not-allowed",
        transform: "none",
        boxShadow: "none",
      }}
      {...getSizeStyles()}
      {...getVariantStyles()}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

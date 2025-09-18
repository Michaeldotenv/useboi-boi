"use client";

import { Box, BoxProps } from "@chakra-ui/react";

interface CardProps extends BoxProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline" | "filled";
  hover?: boolean;
}

export default function Card({ 
  children, 
  variant = "default", 
  hover = true,
  ...props 
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          boxShadow: "xl",
          border: "none",
        };
      case "outline":
        return {
          border: "2px solid",
          borderColor: "gray.200",
          boxShadow: "none",
        };
      case "filled":
        return {
          bg: "gray.50",
          border: "none",
          boxShadow: "none",
        };
      default:
        return {
          border: "1px solid",
          borderColor: "gray.200",
          boxShadow: "sm",
        };
    }
  };

  return (
    <Box
      borderRadius="16px"
      bg="white"
      p={6}
      transition="all 0.2s ease-in-out"
      _hover={hover ? {
        boxShadow: "lg",
        transform: "translateY(-2px)",
      } : {}}
      {...getVariantStyles()}
      {...props}
    >
      {children}
    </Box>
  );
}

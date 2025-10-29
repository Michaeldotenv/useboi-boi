"use client";

import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";

interface CardProps extends BoxProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline" | "filled" | "glass" | "gradient";
  hover?: boolean;
  interactive?: boolean;
}

export default function Card({ 
  children, 
  variant = "default", 
  hover = true,
  interactive = false,
  ...props 
}: CardProps) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverShadow = useColorModeValue(
    "",
    ""
  );
  const filledBg = useColorModeValue("gray.50", "gray.700");
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(45, 55, 72, 0.8)");
  const glassBorder = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)");

  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          border: "none",
          bg: cardBg,
        };
      case "outline":
        return {
          border: "2px solid",
          borderColor: borderColor,
          boxShadow: "none",
          bg: cardBg,
        };
      case "filled":
        return {
          bg: filledBg,
          border: "none",
          boxShadow: "none",
        };
      case "glass":
        return {
          bg: glassBg,
          border: "1px solid",
          borderColor: glassBorder,
          backdropFilter: "blur(20px)",
        };
      case "gradient":
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
        };
      default:
        return {
          border: "1px solid",
          borderColor: borderColor,
          bg: cardBg,
        };
    }
  };

  const getHoverStyles = () => {
    if (!hover) return {};
    
    if (interactive) {
      return {
        transform: "translateY(-4px)",
        cursor: "pointer",
      };
    }
    
    return {
      transform: "translateY(-2px)",
    };
  };

  return (
    <Box
      borderRadius="20px"
      p={6}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={getHoverStyles()}
      _active={interactive ? {
        transform: "translateY(-1px)",
        transition: "all 0.1s ease"
      } : {}}
      position="relative"
      overflow="hidden"
      _before={variant === "glass" ? {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        borderRadius: "inherit",
        zIndex: 0
      } : {}}
      {...getVariantStyles()}
      {...props}
    >
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
}

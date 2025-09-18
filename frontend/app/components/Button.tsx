"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  ...props
}: CustomButtonProps) {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      isLoading={loading}
      width={fullWidth ? "full" : "auto"}
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "md",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}

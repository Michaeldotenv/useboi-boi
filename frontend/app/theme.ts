/* theme.ts */
import { extendTheme } from "@chakra-ui/react";
import './globals.css';

export const theme = extendTheme({
  fonts: {
    heading: `var(--font-jakarta), 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`,
    body: `var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
    mono: `var(--font-mono), 'JetBrains Mono', 'Courier New', monospace`,
  },

  breakpoints: {
    xs: "480px",
    sm: "600px",
    md: "770px",
    smd: "930px",
    lg: "1000px",
    xl: "1200px",
    "2xl": "1536px"
  },

  colors: {
    brand: {
      primary: "#3B174F",
      primaryLight: "#6B2A8F",
      primaryDark: "#2A0F3B",
      secondary: "#6B2A8F",
      secondaryLight: "#8B3FB8",
      secondaryDark: "#3B174F",
      accent: "#10B981",
      accentLight: "#34D399",
      accentDark: "#059669",
      gradient: "#3B174F",
      gradientLight: "#6B2A8F",
      gradientDark: "#2A0F3B",
    },
    gray: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#6B7280",
      tertiary: "#9CA3AF",
      inverse: "#FFFFFF",
    }
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        _hover: {
          transform: "translateY(-2px)",
          _before: {
            left: "100%",
          },
        },
        _active: {
          transform: "translateY(0)",
        },
        _before: {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          transition: "left 0.5s",
        },
      },
      variants: {
        primary: {
          bg: "brand.primary",
          color: "white",
          boxShadow: "0 4px 15px rgba(59, 23, 79, 0.3)",
          _hover: {
            bg: "brand.primaryDark",
            boxShadow: "0 8px 25px rgba(59, 23, 79, 0.4)",
          },
        },
        secondary: {
          bg: "brand.secondary",
          color: "white",
          boxShadow: "0 4px 15px rgba(107, 42, 143, 0.3)",
          _hover: {
            bg: "brand.secondaryDark",
            boxShadow: "0 8px 25px rgba(107, 42, 143, 0.4)",
          },
        },
        outline: {
          border: "2px solid",
          borderColor: "brand.primary",
          color: "brand.primary",
          bg: "transparent",
          _hover: {
            bg: "brand.primary",
            color: "white",
            borderColor: "transparent",
          },
        },
        ghost: {
          color: "brand.primary",
          bg: "transparent",
          _hover: {
            bg: "rgba(59, 23, 79, 0.1)",
          },
        },
        gradient: {
          bg: "brand.primary",
          color: "white",
          _hover: {
            bg: "brand.primaryDark",
          },
        },
      },
      sizes: {
        sm: {
          px: 4,
          py: 2,
          fontSize: "sm",
        },
        md: {
          px: 6,
          py: 3,
          fontSize: "md",
        },
        lg: {
          px: 8,
          py: 4,
          fontSize: "lg",
        },
        xl: {
          px: 10,
          py: 5,
          fontSize: "xl",
        },
      },
    },

    Input: {
      baseStyle: {
        field: {
          borderRadius: "12px",
          border: "2px solid",
          borderColor: "gray.200",
          transition: "all 0.2s ease-in-out",
          _focus: {
            borderColor: "brand.primary",
          },
          _hover: {
            borderColor: "gray.300",
          },
        },
      },
      variants: {
        filled: {
          field: {
            bg: "gray.50",
            border: "none",
            _hover: {
              bg: "gray.100",
            },
            _focus: {
              bg: "white",
              border: "2px solid",
              borderColor: "brand.primary",
            },
          },
        },
      },
    },

    Card: {
      baseStyle: {
        container: {
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.2)",
          bg: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          _hover: {
            transform: "translateY(-4px) scale(1.02)",
            borderColor: "rgba(59, 23, 79, 0.2)",
          },
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(59, 23, 79, 0.02)",
            pointerEvents: "none",
            zIndex: 0,
          },
        },
      },
      variants: {
        elevated: {
          container: {
            bg: "rgba(255, 255, 255, 0.98)",
          },
        },
        glass: {
          container: {
            bg: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          },
        },
        gradient: {
          container: {
            bg: "#ffffff",
            border: "1px solid rgba(59, 23, 79, 0.1)",
          },
        },
      },
    },

    Text: {
      baseStyle: {
        color: "text.primary",
      },
      variants: {
        heading: {
          fontWeight: "700",
          color: "text.primary",
        },
        subheading: {
          fontWeight: "600",
          color: "text.secondary",
        },
        body: {
          fontWeight: "400",
          color: "text.primary",
          lineHeight: "1.6",
        },
        caption: {
          fontWeight: "400",
          color: "text.tertiary",
          fontSize: "sm",
        },
      },
    },
  },

  styles: {
    global: {
      body: {
        bg: "linear-gradient(135deg, #F2F2F7 0%, #E5E7EB 50%, #F9FAFB 100%)",
        backgroundAttachment: "fixed",
        color: "text.primary",
        fontFamily: "body",
        minHeight: "100vh",
      },
      "*": {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      "::-webkit-scrollbar": {
        width: "8px",
      },
      "::-webkit-scrollbar-track": {
        background: "rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
      },
      "::-webkit-scrollbar-thumb": {
        background: "#3B174F",
        borderRadius: "10px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#6B2A8F",
      },
    },
  },

  space: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },

  shadows: {
    sm: "none",
    md: "none", 
    lg: "none",
    xl: "none",
    "2xl": "none",
  },
});
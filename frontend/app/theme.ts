/* theme.ts */
import { extendTheme } from "@chakra-ui/react";
import './globals.css';

export const theme = extendTheme({
  fonts: {
    heading: `'Inter', 'Roboto', sans-serif`,
    body: `'Inter', 'Roboto', sans-serif`,
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
      primary: "#5234E5",
      primaryLight: "#6B4EFF",
      primaryDark: "#3B1FB8",
      secondary: "#FF6B35",
      secondaryLight: "#FF8A65",
      secondaryDark: "#E64A19",
      accent: "#00D4AA",
      accentLight: "#26E6C4",
      accentDark: "#00A085",
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
        borderRadius: "12px",
        transition: "all 0.2s ease-in-out",
        _hover: {
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      variants: {
        primary: {
          bg: "brand.primary",
          color: "white",
          _hover: {
            bg: "brand.primaryDark",
          },
        },
        secondary: {
          bg: "brand.secondary",
          color: "white",
          _hover: {
            bg: "brand.secondaryDark",
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
          },
        },
        ghost: {
          color: "brand.primary",
          bg: "transparent",
          _hover: {
            bg: "gray.50",
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
            boxShadow: "0 0 0 3px rgba(82, 52, 229, 0.1)",
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
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "gray.200",
          bg: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          _hover: {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
      variants: {
        elevated: {
          container: {
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
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
        bg: "gray.50",
        color: "text.primary",
        fontFamily: "body",
      },
      "*": {
        borderColor: "gray.200",
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
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
});
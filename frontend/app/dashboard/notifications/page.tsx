"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Box, Heading, HStack, Input, Text, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";

export default function NotificationsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const [deviceToken, setDeviceToken] = useState("");

  // Trigger load animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Professional loading state (not needed for this page as it doesn't fetch data)
  // But we can add a brief loading state for consistency
  if (!isLoaded) {
    return (
      <Box p={4}>
        <Skeleton height="30px" width="150px" mb={3} />
        <Card p={5} mt={3}>
          <Skeleton height="16px" width="300px" mb={3} />
          <HStack mt={3}>
            <Skeleton height="40px" width="300px" />
            <Skeleton height="40px" width="100px" />
          </HStack>
        </Card>
      </Box>
    );
  }

  async function registerDevice() {
    try {
      if (!deviceToken) return;
      await api.registerDevice(deviceToken);
      alert("Device registered");
    } catch {
      alert("Failed to register device");
    }
  }

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">Notifications</Heading>
        </SlideFade>
      </Fade>
      
      <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
        <Card 
          p={5} 
          mt={3}
          transition="all 0.3s ease"
          _hover={{
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)"
          }}
        >
          <Text color="text.secondary">Register your device token for push notifications.</Text>
          <HStack mt={3}>
            <Input 
              value={deviceToken} 
              onChange={(e) => setDeviceToken(e.target.value)} 
              placeholder="Device token" 
              maxW="400px"
              transition="all 0.2s ease"
              _focus={{
                borderColor: "brand.primary",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
              }}
            />
            <Button 
              variant="primary" 
              onClick={registerDevice}
              transition="all 0.2s ease"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
              }}
            >
              Register
            </Button>
          </HStack>
        </Card>
      </ScaleFade>
    </Box>
  );
}



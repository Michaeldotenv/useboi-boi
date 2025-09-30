"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Button as CButton, Heading, HStack, Input, Text, VStack, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: { firstName: string; lastName: string }) => api.updateUser(me.id || me._id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  // Trigger load animation when data is ready
  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  // Professional loading state
  if (isLoading) {
    return (
      <Box p={4}>
        <Skeleton height="30px" width="100px" mb={3} />
        <VStack align="stretch" spacing={4} mt={3}>
          <Card p={5}>
            <VStack align="stretch" spacing={2}>
              <Skeleton height="20px" width="200px" />
              <Skeleton height="16px" width="250px" />
              <Skeleton height="16px" width="150px" />
            </VStack>
          </Card>
          <Card p={5}>
            <Skeleton height="24px" width="60px" mb={3} />
            <HStack spacing={3} wrap="wrap">
              <Skeleton height="40px" width="200px" />
              <Skeleton height="40px" width="200px" />
              <Skeleton height="40px" width="80px" />
            </HStack>
          </Card>
          <Skeleton height="40px" width="100px" />
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load profile</Box>;
  const me = (data as any)?.data || data || {};

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">Profile</Heading>
        </SlideFade>
      </Fade>
      
      <VStack align="stretch" spacing={4} mt={3}>
        <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
          <Card 
            p={5}
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)"
            }}
          >
            <VStack align="stretch" spacing={2}>
              <Text color="text.primary" fontWeight={600}>{me.firstName} {me.lastName}</Text>
              <Text color="text.secondary">{me.email}</Text>
              <Text color="text.secondary">{me.phoneNumber}</Text>
            </VStack>
          </Card>
        </ScaleFade>
        
        <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.3 } }}>
          <Card 
            p={5}
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)"
            }}
          >
            <Heading size="sm" mb={3} color="text.primary">Edit</Heading>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value;
                const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value;
                mutation.mutate({ firstName, lastName });
              }}
            >
              <HStack spacing={3} wrap="wrap">
                <Input 
                  name="firstName" 
                  defaultValue={me.firstName} 
                  placeholder="First name" 
                  maxW="280px"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                  }}
                />
                <Input 
                  name="lastName" 
                  defaultValue={me.lastName} 
                  placeholder="Last name" 
                  maxW="280px"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                  }}
                />
                <Button 
                  type="submit" 
                  loading={mutation.isPending}
                  transition="all 0.2s ease"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
                  }}
                >
                  Save
                </Button>
              </HStack>
            </form>
          </Card>
        </ScaleFade>
        
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.4 } }}>
          <CButton 
            colorScheme="red" 
            onClick={() => { clearAuthToken(); router.replace("/login"); }} 
            w="fit-content"
            transition="all 0.2s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
            }}
          >
            Logout
          </CButton>
        </SlideFade>
      </VStack>
    </Box>
  );
}



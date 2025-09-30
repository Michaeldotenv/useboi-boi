"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Heading, HStack, Input, Link, Text, VStack, NumberInput, NumberInputField, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";

export default function WalletPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const me = (data as any)?.data || data || {};
  const balance = me?.virtualBankAccount?.balance ?? me?.wallet?.balance ?? 0;

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
            <Skeleton height="16px" width="80px" mb={2} />
            <Skeleton height="32px" width="150px" mb={2} />
            <Skeleton height="16px" width="120px" />
          </Card>
          <Card p={5}>
            <Skeleton height="20px" width="60px" mb={2} />
            <HStack>
              <Skeleton height="40px" width="200px" />
              <Skeleton height="40px" width="100px" />
            </HStack>
          </Card>
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load wallet</Box>;

  async function handleTopup() {
    try {
      const init = await api.initTopup({ amount: String(amount), email: me?.email || me?.data?.email, callback_url: `${window.location.origin}/dashboard/wallet/transactions` });
      const url = (init as any)?.data?.authorization_url || (init as any)?.authorization_url;
      if (url) window.location.href = url;
    } catch (e) {
      // no-op basic error display
      alert("Failed to initialize top-up");
    }
  }

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">Wallet</Heading>
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
            <Text color="text.secondary">Balance</Text>
            <Heading size="lg" color="text.primary">₦{balance}</Heading>
            <HStack mt={2}>
              <Link 
                as={NextLink} 
                href="/dashboard/wallet/transactions" 
                color="brand.primary"
                transition="color 0.2s ease"
                _hover={{
                  color: "brand.secondary"
                }}
              >
                View transactions
              </Link>
            </HStack>
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
            <Text fontWeight="semibold" mb={2} color="text.primary">Top up</Text>
            <HStack>
              <NumberInput value={amount} onChange={(_, v) => setAmount(Number.isFinite(v) ? v : 0)} min={0} maxW="240px">
                <NumberInputField 
                  placeholder="Amount"
                  transition="all 0.2s ease"
                  _focus={{
                    borderColor: "brand.primary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)"
                  }}
                />
              </NumberInput>
              <Button 
                variant="primary" 
                onClick={handleTopup}
                transition="all 0.2s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
                }}
              >
                Continue
              </Button>
            </HStack>
          </Card>
        </ScaleFade>
      </VStack>
    </Box>
  );
}



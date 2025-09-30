"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack, HStack, Badge, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";

export default function WalletTransactionsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({ queryKey: ["wallet-transactions"], queryFn: api.walletTransactions });

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
        <Skeleton height="30px" width="150px" mb={3} />
        <VStack align="stretch" spacing={3} mt={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} p={4}>
              <HStack justify="space-between" mb={1}>
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="80px" />
              </HStack>
              <Skeleton height="16px" width="120px" />
            </Card>
          ))}
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load transactions</Box>;

  const txs = (data as any)?.data || data || [];
  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">Transactions</Heading>
        </SlideFade>
      </Fade>
      
      {txs.length === 0 ? (
        <ScaleFade in={isLoaded} initialScale={0.9} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
          <Card p={5} mt={3} textAlign="center" hover={false}>
            <Text color="text.secondary">No transactions yet.</Text>
          </Card>
        </ScaleFade>
      ) : (
        <VStack align="stretch" spacing={3} mt={3}>
          {txs.map((t: any, index: number) => {
            const isCredit = (t.type || "").toString().toLowerCase().includes("credit");
            return (
              <ScaleFade 
                key={t.id || t._id} 
                in={isLoaded} 
                initialScale={0.9}
                transition={{ 
                  enter: { 
                    duration: 0.4, 
                    delay: 0.2 + (index * 0.1) 
                  } 
                }}
              >
                <Card 
                  p={4}
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight={700} color="text.primary">{t.type}</Text>
                    <Text 
                      color={isCredit ? "green.600" : "red.600"}
                      transition="all 0.2s ease"
                      _groupHover={{
                        transform: "scale(1.05)"
                      }}
                    >
                      {isCredit ? "+" : "-"}₦{t.amount}
                    </Text>
                  </HStack>
                  <Text color="text.tertiary">{t.createdAt}</Text>
                </Card>
              </ScaleFade>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}



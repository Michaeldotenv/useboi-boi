"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Badge, Box, Heading, Link, VStack, HStack, Text, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";

export default function OrdersPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data: meData } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
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
        <Skeleton height="30px" width="150px" mb={3} />
        <VStack align="stretch" spacing={3} mt={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} p={4}>
              <HStack justify="space-between" mb={2}>
                <Skeleton height="20px" width="120px" />
                <Skeleton height="24px" width="80px" />
              </HStack>
              <Skeleton height="16px" width="60px" />
            </Card>
          ))}
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load orders</Box>;

  const orders = (data as any)?.data || data || [];

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">My Orders</Heading>
        </SlideFade>
      </Fade>
      
      {orders.length === 0 ? (
        <ScaleFade in={isLoaded} initialScale={0.9} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
          <Card p={5} mt={3} textAlign="center" hover={false}>
            <Text color="text.secondary">You have no orders yet.</Text>
          </Card>
        </ScaleFade>
      ) : (
        <VStack align="stretch" spacing={3} mt={3}>
          {[...orders]
            .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .map((o: any, index: number) => {
            const status = (o.status || o.orderState || "").toString().toLowerCase();
            const scheme = status.includes("complete")
              ? "green"
              : status.includes("progress") || status.includes("rider")
              ? "purple"
              : status.includes("pend")
              ? "orange"
              : "gray";
            return (
              <ScaleFade 
                key={o._id} 
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
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="700" color="text.primary">#{o.orderId || o._id}</Text>
                    <Badge 
                      colorScheme={scheme}
                      transition="all 0.2s ease"
                      _hover={{
                        transform: "scale(1.05)"
                      }}
                    >
                      {o.status || o.orderState}
                    </Badge>
                  </HStack>
                  <Link 
                    as={NextLink} 
                    href={`/user-dashboard/orders/${o._id}`} 
                    color="brand.primary"
                    transition="color 0.2s ease"
                    _hover={{
                      color: "brand.secondary"
                    }}
                  >
                    View
                  </Link>
                </Card>
              </ScaleFade>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}



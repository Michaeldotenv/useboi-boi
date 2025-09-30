"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { Box, Heading, Text, Badge, HStack, VStack, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText } from "@chakra-ui/react";
import Card from "@/app/components/Card";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => api.order(params.id),
    enabled: Boolean(params.id),
    refetchInterval: 5000,
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
        <Skeleton height="30px" width="200px" mb={3} />
        <VStack align="stretch" spacing={4} mt={3}>
          <Card p={5}>
            <HStack justify="space-between" mb={2}>
              <Skeleton height="16px" width="60px" />
              <Skeleton height="24px" width="80px" />
            </HStack>
            <HStack justify="space-between">
              <Skeleton height="16px" width="50px" />
              <Skeleton height="20px" width="100px" />
            </HStack>
          </Card>
          <Card p={5}>
            <Skeleton height="24px" width="80px" mb={2} />
            <Skeleton height="200px" width="100%" />
          </Card>
        </VStack>
      </Box>
    );
  }
  
  if (error) return <Box p={4}>Failed to load order</Box>;

  const o = (data as any)?.data || data;
  if (!o) return <Box p={4}>Not found</Box>;

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);
    } catch {
      return `₦${Number(value || 0).toLocaleString()}`;
    }
  };

  const titleCase = (text: string) => {
    const t = (text || "").toString();
    return t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase();
  };

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">Order #{o.orderId || o._id}</Heading>
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
            <HStack justify="space-between" mb={2}>
              <Text color="text.secondary">Status</Text>
              <Badge 
                colorScheme={o.status?.toLowerCase().includes("complete") ? "green" : o.status?.toLowerCase().includes("progress") ? "purple" : "orange"}
                transition="all 0.2s ease"
                _hover={{
                  transform: "scale(1.05)"
                }}
              >
                {titleCase(o.status || o.orderState)}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text color="text.secondary">Total</Text>
              <Text 
                fontWeight={700} 
                color="text.primary"
                transition="all 0.2s ease"
                _groupHover={{
                  transform: "scale(1.05)"
                }}
              >
                {formatCurrency(o.price || o.totalPrice)}
              </Text>
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
            <Heading size="sm" mb={2} color="text.primary">Details</Heading>
            <Box 
              as="pre" 
              whiteSpace="pre-wrap"
              fontSize="sm"
              color="text.secondary"
              bg="gray.50"
              p={3}
              borderRadius="md"
              overflow="auto"
              maxH="400px"
            >
              {JSON.stringify(o, null, 2)}
            </Box>
          </Card>
        </ScaleFade>
      </VStack>
    </Box>
  );
}



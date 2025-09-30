"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import NextLink from "next/link";
import { Box, Heading, Link, Text, Fade, SlideFade, ScaleFade, Skeleton, SkeletonText, Card as CCard } from "@chakra-ui/react";

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor", params.id],
    queryFn: () => api.vendor(params.id),
    enabled: Boolean(params.id),
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
        <Skeleton height="30px" width="180px" mb={3} />
        <SkeletonText noOfLines={3} spacing="3" skeletonHeight="3" />
        <Skeleton height="18px" width="120px" mt={3} />
      </Box>
    );
  }
  if (error) return <Box p={4}>Failed to load store</Box>;

  const v = (data as any)?.data || data;
  if (!v) return <Box p={4}>Not found</Box>;

  return (
    <Box p={4}>
      <Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
        <SlideFade in={isLoaded} offsetY="20px" transition={{ enter: { duration: 0.5, delay: 0.1 } }}>
          <Heading size="md" color="text.primary">{v.name}</Heading>
        </SlideFade>
      </Fade>
      <ScaleFade in={isLoaded} initialScale={0.95} transition={{ enter: { duration: 0.5, delay: 0.2 } }}>
        <Text mt={1} color="text.secondary">{v.description}</Text>
        <Box mt={3}>
          <Link 
            as={NextLink} 
            href={`/dashboard/stores/${params.id}/items`} 
            color="brand.primary"
            transition="color 0.2s ease"
            _hover={{ color: "brand.secondary" }}
          >
            View items
          </Link>
        </Box>
      </ScaleFade>
    </Box>
  );
}



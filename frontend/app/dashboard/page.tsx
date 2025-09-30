"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Box, Grid, GridItem, Heading, HStack, Link, Stat, StatHelpText, StatLabel, StatNumber, Text, VStack, Badge, Fade, ScaleFade, SlideFade, Skeleton, SkeletonText, Spinner, Center, Icon } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import Card from "@/app/components/Card";
import Button from "@/app/components/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    // Always land on the new Overview (mobile-style) homepage
    router.replace("/user-dashboard");
  }, [router]);
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
  });

  const meObj = ((me as any)?.data || me || {}) as any;
  const customerId = meObj?._id || meObj?.id || "";
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => api.ordersByCustomer(customerId),
    enabled: Boolean(customerId),
  });

  // Trigger load animation when data is ready
  useEffect(() => {
    if (!meLoading && !ordersLoading && me && orders) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [meLoading, ordersLoading, me, orders]);

  // While redirecting, show a lightweight loading state
  if (true) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }
  // Unreachable; we immediately redirect to /user-dashboard
}



"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { GoHeartFill } from "react-icons/go";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import EmptyState from "../EmptyState";

const SavedTab: React.FC = () => {
  const router = useRouter();
  const [savedVendors, setSavedVendors] = useState<any[]>([]);

  // Fetch saved vendors from backend
  const { data: savedData, isLoading: savedLoading, refetch } = useQuery({
    queryKey: ["saved-vendors"],
    queryFn: api.savedVendors,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  // Extract saved vendors from API response
  useEffect(() => {
    if (savedData) {
      const vendors: any[] = Array.isArray((savedData as any)?.data)
        ? (savedData as any).data
        : (Array.isArray(savedData) ? (savedData as any) : []);
      setSavedVendors(vendors);
    }
  }, [savedData]);

  const vendorsLoading = savedLoading;

  // Get store image
  const getStoreImage = (v: any): string => {
    return (
      v?.image ||
      v?.Image ||
      v?.coverImage ||
      v?.logoUrl ||
      "Food-item-1.jpeg"
    );
  };

  // Map category IDs to readable names
  const getCategoryName = (vendor: any): string => {
    if (typeof vendor.category === 'string' && !vendor.category.match(/^[0-9a-f]{24}$/i)) {
      return vendor.category;
    }
    if (vendor.categoryName) return vendor.categoryName;
    if (vendor.category && typeof vendor.category === 'object' && vendor.category.name) {
      return vendor.category.name;
    }
    if (vendor.businessType) return vendor.businessType;
    
    const categoryMap: { [key: string]: string } = {
      '67d582619dfc3452b04e4c77': 'Restaurant',
      '68035daf79fd624e59299358': 'Grocery',
      '68035dd9f2c01460883c9e14': 'Supermarket',
    };
    
    if (vendor.category && categoryMap[vendor.category]) {
      return categoryMap[vendor.category];
    }
    return 'Store';
  };

  const handleRemoveSaved = async (vendorId: string) => {
    try {
      await api.unlikeVendor(vendorId);
      // Optimistically update UI
      setSavedVendors(prev => prev.filter(v => (v._id || v.id) !== vendorId));
      // Refetch to ensure sync with backend
      refetch();
    } catch (error) {
      console.error("Failed to remove saved vendor:", error);
    }
  };

  if (vendorsLoading) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <VStack spacing={4} align="stretch">
              <Spinner size="lg" mx="auto" mt={8} />
              <Text textAlign="center" color="gray.500">Loading saved stores...</Text>
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#F2F2F7" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
      <Wrapper>
        <Box py={4}>
          <Flex justifyContent="space-between" alignItems="center" mt={4} mb={6}>
            <Text fontSize="24px" fontWeight="700" color="#000">
              Saved
            </Text>
            {savedVendors.length > 0 && (
              <Text fontSize="14px" color="#8E8E93">
                {savedVendors.length} {savedVendors.length === 1 ? 'store' : 'stores'}
              </Text>
            )}
          </Flex>

          {savedVendors.length === 0 ? (
            <EmptyState
              iconType="saved"
              title="No saved stores yet"
              description="Start exploring and save your favorite stores to see them here. Tap the heart icon on any store to save it."
              actionText="Explore stores"
              onAction={() => {
                // This would be handled by the navigation context
                window.location.reload();
              }}
              variant="illustrated"
            />
          ) : (
            <VStack spacing={4} align="stretch">
              {savedVendors.map((vendor: any) => (
                <Box
                  key={vendor._id || vendor.id}
                  bg="white"
                  borderRadius="16px"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.3s ease"
                  onClick={() => {
                    const storeId = vendor._id || vendor.id;
                    if (storeId) {
                      router.push(`/user-dashboard/stores/${storeId}`);
                    }
                  }}
                >
                  <Box position="relative">
                    <Box
                      w="100%"
                      h="200px"
                      bgImage={getStoreImage(vendor)}
                      bgSize="cover"
                      bgPosition="center"
                    >
                      <Text
                        fontSize="17px"
                        fontWeight="700"
                        position="absolute"
                        left="5"
                        bottom="5"
                        borderRadius="16px"
                        color="#000"
                        bg="#fff"
                        px="12px"
                        py="4px"
                      >
                        {vendor.deliveryTime || "40"} min
                      </Text>
                      <Icon
                        as={GoHeartFill}
                        color="rgba(240, 81, 147, 1)"
                        borderRadius="50%"
                        position="absolute"
                        top={5}
                        right={5}
                        fontSize="24px"
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSaved(vendor._id || vendor.id);
                        }}
                        _hover={{ transform: "scale(1.1)" }}
                        transition="transform 0.2s ease"
                      />
                    </Box>
                  </Box>
                  
                  <Box p={4}>
                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                      <Text fontSize="18px" fontWeight="700" color="#000">
                        {vendor.businessName || vendor.name || vendor.Name}
                      </Text>
                      <HStack spacing={1}>
                        <Image src="/Star.png" alt="Rating" width="20px" height="20px" />
                        <Text fontSize="16px" fontWeight="700" color="#000">
                          {vendor.rating ?? vendor.Ratings ?? "4.8"}
                        </Text>
                      </HStack>
                    </Flex>
                    
                    <Text fontSize="15px" fontWeight="400" color="gray.600" mb={2}>
                      {vendor.location || vendor.address || "University of Ibadan"}
                    </Text>
                    
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontSize="12px" color="#8E8E93">
                        {getCategoryName(vendor)}
                      </Text>
                      <Text fontSize="12px" color="#8E8E93">•</Text>
                      <Text fontSize="12px" color="#8E8E93">
                        {(vendor.distance || "0.6") + "km"}
                      </Text>
                      {vendor.isOpen !== undefined && (
                        <>
                          <Text fontSize="12px" color="#8E8E93">•</Text>
                          <Text fontSize="12px" color={vendor.isOpen ? "green.500" : "red.500"}>
                            {vendor.isOpen ? "Open" : "Closed"}
                          </Text>
                        </>
                      )}
                    </HStack>
                  </Box>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default SavedTab;

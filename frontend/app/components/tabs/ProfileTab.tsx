"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button as CButton,
  Input,
  Avatar,
  Divider,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FaUser, FaEdit, FaSignOutAlt, FaCog, FaHistory, FaHeart } from "react-icons/fa";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import EmptyState from "../EmptyState";
import WalletSection from "../WalletSection";

const ProfileTab: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({ 
    queryKey: ["me"], 
    queryFn: api.me 
  });

  const me = useMemo(() => (data as any)?.data || data || {}, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: { firstName: string; lastName: string }) => 
      api.updateUser(me.id || me._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: "Profile updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (me && Object.keys(me).length > 0) {
      setEditForm({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        email: me.email || "",
        phoneNumber: me.phoneNumber || "",
      });
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [me]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast({
        title: "Please fill required fields",
        description: "First name and last name are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    updateMutation.mutate({
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
    });
  };

  const handleCancel = () => {
    setEditForm({
      firstName: me.firstName || "",
      lastName: me.lastName || "",
      email: me.email || "",
      phoneNumber: me.phoneNumber || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    router.replace("/login");
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const menuItems = [
    {
      icon: FaHistory,
      title: "Order History",
      description: "View all your past orders",
      action: () => {
        toast({
          title: "Redirecting to orders...",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      },
    },
    {
      icon: FaHeart,
      title: "Saved Stores",
      description: "Your favorite stores",
      action: () => {
        toast({
          title: "Redirecting to saved stores...",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      },
    },
    {
      icon: FaCog,
      title: "Settings",
      description: "App preferences and settings",
      action: () => {
        toast({
          title: "Settings coming soon",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      },
    },
  ];

  if (isLoading) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <VStack spacing={4} align="stretch">
              <Spinner size="lg" mx="auto" mt={8} />
              <Text textAlign="center" color="gray.500">Loading profile...</Text>
            </VStack>
          </Box>
        </Wrapper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="#F2F2F7">
        <Wrapper>
          <Box py={8}>
            <EmptyState
              iconType="error"
              title="Failed to load profile"
              description="There was an error loading your profile. Please try again later."
              actionText="Retry"
              onAction={() => window.location.reload()}
            />
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#F2F2F7" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
      <Wrapper>
        <Box py={4}>
          <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="700" color="#000" mb={6} mt={4}>
            Profile
          </Text>

          {/* Wallet Section */}
          <WalletSection user={me} />

          {/* Profile Header */}
          <Box bg="white" borderRadius="16px" p={{ base: 4, md: 6 }} border="1px solid" borderColor="gray.200" mb={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="center">
                <Avatar
                  size="xl"
                  name={`${me.firstName} ${me.lastName}`}
                  bg="brand.primary"
                  color="white"
                />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700" color="#000" noOfLines={1}>
                    {me.firstName} {me.lastName}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                    {me.email}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                    {me.phoneNumber}
                  </Text>
                </VStack>
                {!isEditing && (
                  <CButton
                    leftIcon={<FaEdit />}
                    size="sm"
                    variant="outline"
                    color="brand.primary"
                    borderColor="brand.primary"
                    _hover={{ bg: "brand.primary", color: "white" }}
                    onClick={handleEdit}
                  >
                    Edit
                  </CButton>
                )}
              </HStack>

              {isEditing && (
                <VStack spacing={4} align="stretch">
                  <Divider />
                  <Text fontSize="md" fontWeight="600" color="#000">
                    Edit Profile Information
                  </Text>
                  
                  <HStack spacing={4}>
                    <Input
                      placeholder="First Name"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "brand.primary",
                        boxShadow: "0 0 0 1px #3B174F",
                      }}
                    />
                    <Input
                      placeholder="Last Name"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _focus={{
                        borderColor: "brand.primary",
                        boxShadow: "0 0 0 1px #3B174F",
                      }}
                    />
                  </HStack>

                  <Input
                    placeholder="Email"
                    value={editForm.email}
                    isDisabled
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.300"
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed",
                    }}
                  />

                  <Input
                    placeholder="Phone Number"
                    value={editForm.phoneNumber}
                    isDisabled
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.300"
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed",
                    }}
                  />

                  <HStack spacing={3}>
                    <CButton
                      bg="brand.primary"
                      color="white"
                      _hover={{ bg: "brand.primaryDark" }}
                      onClick={handleSave}
                      isLoading={updateMutation.isPending}
                      loadingText="Saving..."
                      flex={1}
                    >
                      Save Changes
                    </CButton>
                    <CButton
                      variant="outline"
                      onClick={handleCancel}
                      flex={1}
                    >
                      Cancel
                    </CButton>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>

          {/* Menu Items */}
          <VStack spacing={{ base: 2, md: 3 }} align="stretch" mb={6}>
            {menuItems.map((item, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="16px"
                p={{ base: 3, md: 4 }}
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                }}
                transition="all 0.3s ease"
                onClick={item.action}
              >
                <HStack spacing={{ base: 3, md: 4 }}>
                  <Box
                    p={{ base: 2.5, md: 3 }}
                    borderRadius="full"
                    bg="rgba(107, 42, 143, 0.15)"
                    color="brand.primary"
                  >
                    <item.icon size={20} />
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="#000" noOfLines={1}>
                      {item.title}
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                      {item.description}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>

          {/* Logout Button */}
          <CButton
            leftIcon={<FaSignOutAlt />}
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
            w="full"
            size={{ base: 'md', md: 'lg' }}
            _hover={{
              bg: "red.50",
              transform: "translateY(-2px)",
            }}
            transition="all 0.3s ease"
          >
            Logout
          </CButton>
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default ProfileTab;

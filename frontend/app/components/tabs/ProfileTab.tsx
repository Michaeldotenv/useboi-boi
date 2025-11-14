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
  Grid,
  GridItem,
  Icon,
  SimpleGrid,
  Flex,
  Badge,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  FaUser, 
  FaEdit, 
  FaSignOutAlt, 
  FaCog, 
  FaHistory, 
  FaHeart, 
  FaWallet, 
  FaCreditCard, 
  FaBell, 
  FaShieldAlt, 
  FaChevronRight,
  FaUserCircle 
} from "react-icons/fa";
import Wrapper from "../Wrapper";
import { api } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import EmptyState from "../EmptyState";
import WalletSection from "../WalletSection";

const MotionBox = motion(Box);

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
      color: "blue.500",
      bgColor: "rgba(59, 130, 246, 0.1)",
      action: () => router.push("/user-dashboard/orders"),
    },
    {
      icon: FaHeart,
      title: "Saved Stores",
      description: "Your favorite stores",
      color: "pink.500",
      bgColor: "rgba(236, 72, 153, 0.1)",
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
      icon: FaCreditCard,
      title: "Payment Methods",
      description: "Manage your cards & payments",
      color: "green.500",
      bgColor: "rgba(34, 197, 94, 0.1)",
      action: () => router.push("/user-dashboard/profile/cards"),
    },
    {
      icon: FaBell,
      title: "Notifications",
      description: "Manage your notification preferences",
      color: "orange.500",
      bgColor: "rgba(249, 115, 22, 0.1)",
      action: () => {
        toast({
          title: "Notifications settings coming soon",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      },
    },
    {
      icon: FaShieldAlt,
      title: "Privacy & Security",
      description: "Manage your account security",
      color: "purple.500",
      bgColor: "rgba(168, 85, 247, 0.1)",
      action: () => {
        toast({
          title: "Security settings coming soon",
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
      color: "gray.600",
      bgColor: "rgba(107, 114, 128, 0.1)",
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
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
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
      <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
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
    <Box 
      minH="calc(100vh - 72px)" 
      pb="calc(env(safe-area-inset-bottom, 0px) + 72px)"
      bg="gray.50"
    >
      <Wrapper>
        <Box py={6}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={8} mt={2}>
            <HStack spacing={3}>
              <Box
                p={2.5}
                borderRadius="10px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
              >
                <FaUserCircle color="#111827" size="22px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize={{ base: "22px", md: "26px" }} fontWeight="600" color="gray.900" lineHeight="1.2">
                  Profile
                </Text>
                <Text fontSize={{ base: "13px", md: "14px" }} color="gray.500" fontWeight="400">
                  Manage your account
                </Text>
              </VStack>
            </HStack>
            {!isEditing && (
              <IconButton
                aria-label="Edit profile"
                icon={<FaEdit />}
                size={{ base: 'sm', md: 'md' }}
                bg="gray.900"
                color="white"
                _hover={{ bg: "gray.800" }}
                _active={{ bg: "gray.700" }}
                onClick={handleEdit}
                transition="all 0.2s ease"
                borderRadius="10px"
              />
            )}
          </Flex>

          {/* Wallet Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            mb={5}
          >
            <WalletSection user={me} />
          </MotionBox>

          {/* Profile Card */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            bg="white"
            borderRadius="16px"
            p={{ base: 6, md: 7 }}
            border="1px solid"
            borderColor="gray.200"
            mb={5}
          >
            <VStack spacing={5} align="stretch">
              <Flex align="center" gap={5}>
                <Box position="relative">
                  <Avatar
                    size={{ base: 'xl', md: '2xl' }}
                    name={`${me.firstName} ${me.lastName}`}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    fontWeight="600"
                  />
                  <Box
                    position="absolute"
                    bottom={1}
                    right={1}
                    bg="green.400"
                    borderRadius="full"
                    w={{ base: "14px", md: "16px" }}
                    h={{ base: "14px", md: "16px" }}
                    border="3px solid white"
                  />
                </Box>
                <VStack align="start" spacing={1.5} flex={1}>
                  <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600" color="gray.900" noOfLines={1}>
                    {me.firstName} {me.lastName}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500" noOfLines={1}>
                      {me.email}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500" noOfLines={1}>
                      {me.phoneNumber}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>

              {isEditing && (
                <MotionBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Divider my={5} borderColor="gray.200" />
                  <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="600" color="gray.900" mb={5}>
                    Edit Profile Information
                  </Text>
                  
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                      <Box>
                        <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>First Name</Text>
                        <Input
                          placeholder="Enter first name"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          bg="gray.50"
                          border="1.5px solid"
                          borderColor="gray.200"
                          borderRadius="10px"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "gray.900",
                            bg: "white",
                          }}
                          size={{ base: 'md', md: 'lg' }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>Last Name</Text>
                        <Input
                          placeholder="Enter last name"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          bg="gray.50"
                          border="1.5px solid"
                          borderColor="gray.200"
                          borderRadius="10px"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "gray.900",
                            bg: "white",
                          }}
                          size={{ base: 'md', md: 'lg' }}
                        />
                      </Box>
                    </Grid>

                    <Box>
                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>Email Address</Text>
                      <Input
                        placeholder="Email"
                        value={editForm.email}
                        isDisabled
                        bg="gray.100"
                        border="1.5px solid"
                        borderColor="gray.200"
                        borderRadius="10px"
                        size={{ base: 'md', md: 'lg' }}
                        _disabled={{
                          opacity: 0.7,
                          cursor: "not-allowed",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>Phone Number</Text>
                      <Input
                        placeholder="Phone Number"
                        value={editForm.phoneNumber}
                        isDisabled
                        bg="gray.100"
                        border="1.5px solid"
                        borderColor="gray.200"
                        borderRadius="10px"
                        size={{ base: 'md', md: 'lg' }}
                        _disabled={{
                          opacity: 0.7,
                          cursor: "not-allowed",
                        }}
                      />
                    </Box>

                    <Flex gap={3} mt={2}>
                      <CButton
                        bg="gray.900"
                        color="white"
                        _hover={{ bg: "gray.800" }}
                        _active={{ bg: "gray.700" }}
                        onClick={handleSave}
                        isLoading={updateMutation.isPending}
                        loadingText="Saving..."
                        flex={1}
                        borderRadius="10px"
                        size={{ base: 'md', md: 'lg' }}
                        transition="all 0.2s ease"
                        fontWeight="500"
                      >
                        Save Changes
                      </CButton>
                      <CButton
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.700"
                        _hover={{ bg: "gray.100", borderColor: "gray.400" }}
                        onClick={handleCancel}
                        flex={1}
                        borderRadius="10px"
                        size={{ base: 'md', md: 'lg' }}
                        fontWeight="500"
                      >
                        Cancel
                      </CButton>
                    </Flex>
                  </VStack>
                </MotionBox>
              )}
            </VStack>
          </MotionBox>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            {[
              { label: "Orders", value: "0", icon: FaHistory, color: "blue" },
              { label: "Saved", value: "0", icon: FaHeart, color: "red" },
              { label: "Balance", value: `₦${(me.virtualBankAccount?.balance || 0).toLocaleString()}`, icon: FaWallet, color: "green" },
              { label: "Cards", value: me.cards?.length || 0, icon: FaCreditCard, color: "purple" },
            ].map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                bg="white"
                borderRadius="14px"
                p={{ base: 5, md: 6 }}
                border="1px solid"
                borderColor="gray.200"
                textAlign="center"
                _hover={{ borderColor: "gray.300" }}
              >
                <VStack spacing={2.5}>
                  <Box
                    p={3}
                    borderRadius="10px"
                    bg={`${stat.color}.50`}
                  >
                    <Icon as={stat.icon} color={`${stat.color}.500`} fontSize={{ base: '20px', md: '22px' }} />
                  </Box>
                  <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600" color="gray.900">
                    {stat.value}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="500">
                    {stat.label}
                  </Text>
                </VStack>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* Menu Items */}
          <VStack spacing={3} align="stretch" mb={6}>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600" color="gray.900" mb={1}>
              Account Settings
            </Text>
            {menuItems.map((item, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                bg="white"
                borderRadius="14px"
                p={{ base: 4, md: 5 }}
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  borderColor: "gray.300",
                  bg: "gray.50",
                }}
                _active={{
                  bg: "gray.100",
                }}
                onClick={item.action}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={{ base: 3, md: 4 }}>
                    <Box
                      p={{ base: 2.5, md: 3 }}
                      borderRadius="12px"
                      bg={item.bgColor}
                      color={item.color}
                    >
                      <item.icon size={20} />
                    </Box>
                    <VStack align="start" spacing={0.5}>
                      <Text fontWeight="600" color="gray.900" fontSize={{ base: 'sm', md: 'md' }}>
                        {item.title}
                      </Text>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" display={{ base: 'none', md: 'block' }}>
                        {item.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Icon as={FaChevronRight} color="gray.300" fontSize={{ base: '14px', md: '16px' }} />
                </Flex>
              </MotionBox>
            ))}
          </VStack>

          {/* Logout Button */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <CButton
              leftIcon={<FaSignOutAlt />}
              bg="white"
              color="red.600"
              border="1.5px solid"
              borderColor="red.200"
              onClick={handleLogout}
              w="full"
              size={{ base: 'md', md: 'lg' }}
              borderRadius="14px"
              fontWeight="500"
              _hover={{
                bg: "red.50",
                borderColor: "red.300",
              }}
              _active={{
                bg: "red.100",
              }}
              transition="all 0.2s ease"
            >
              Logout
            </CButton>
          </MotionBox>
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default ProfileTab;

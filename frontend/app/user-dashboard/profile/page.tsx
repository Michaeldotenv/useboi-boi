"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Avatar,
  Divider,
  useToast,
  Spinner,
  Grid,
  Icon,
  Flex,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
  FiEdit2, 
  FiLogOut, 
  FiSettings, 
  FiClock, 
  FiHeart, 
  FiDollarSign, 
  FiCreditCard, 
  FiBell, 
  FiShield, 
  FiChevronRight,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import Wrapper from "../../components/Wrapper";
import { api } from "@/lib/api";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import EmptyState from "../../components/EmptyState";
import WalletSection from "../../components/WalletSection";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  
  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) router.replace("/login");
  }, [router]);

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
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  useEffect(() => {
    if (me && Object.keys(me).length > 0) {
      setEditForm({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        email: me.email || "",
        phoneNumber: me.phoneNumber || "",
      });
    }
  }, [me]);

  const handleSave = () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast({
        title: "Required fields",
        description: "First name and last name are required",
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
      title: "Logged out",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const quickActions = [
    {
      icon: FiClock,
      label: "Orders",
      value: "0",
      color: "blue.500",
      bg: "blue.50",
      action: () => router.push("/user-dashboard/orders"),
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: "0",
      color: "pink.500",
      bg: "pink.50",
      action: () => router.push("/saved"),
    },
    {
      icon: FiDollarSign,
      label: "Wallet",
      value: `₦${(me.virtualBankAccount?.balance || 0).toLocaleString()}`,
      color: "green.500",
      bg: "green.50",
      action: () => {},
    },
    {
      icon: FiCreditCard,
      label: "Cards",
      value: String(me.cards?.length || 0),
      color: "purple.500",
      bg: "purple.50",
      action: () => router.push("/user-dashboard/profile/cards"),
    },
  ];

  const settingsMenu = [
    {
      icon: FiCreditCard,
      title: "Payment Methods",
      description: "Manage cards and payment options",
      action: () => router.push("/user-dashboard/profile/cards"),
    },
    {
      icon: FiBell,
      title: "Notifications",
      description: "Configure notification preferences",
      action: () => {
        toast({
          title: "Coming soon",
          description: "Notification settings will be available soon",
          status: "info",
          duration: 2000,
        });
      },
    },
    {
      icon: FiShield,
      title: "Privacy & Security",
      description: "Manage account security settings",
      action: () => {
        toast({
          title: "Coming soon",
          description: "Security settings will be available soon",
          status: "info",
          duration: 2000,
        });
      },
    },
    {
      icon: FiSettings,
      title: "Preferences",
      description: "App settings and preferences",
      action: () => {
        toast({
          title: "Coming soon",
          description: "Preferences will be available soon",
          status: "info",
          duration: 2000,
        });
      },
    },
  ];

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Flex h="60vh" align="center" justify="center">
            <VStack spacing={3}>
              <Spinner size="lg" color="purple.600" thickness="3px" />
              <Text color="gray.600" fontSize="sm">Loading profile...</Text>
            </VStack>
          </Flex>
        </Wrapper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
        <Wrapper>
          <Box py={8}>
            <EmptyState
              iconType="error"
              title="Failed to load profile"
              description="There was an error loading your profile"
              actionText="Retry"
              onAction={() => window.location.reload()}
            />
          </Box>
        </Wrapper>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white" pb="calc(env(safe-area-inset-bottom, 0px) + 80px)">
      <Wrapper>
        <Box py={4}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="800" color="gray.900">
                Profile
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="500">
                Manage your account information
              </Text>
            </VStack>
            {!isEditing && (
              <IconButton
                aria-label="Edit profile"
                icon={<FiEdit2 />}
                size="md"
                bg="purple.500"
                color="white"
                borderRadius="12px"
                _hover={{ bg: "purple.600" }}
                onClick={() => setIsEditing(true)}
              />
            )}
          </Flex>

          {/* Wallet Section */}
          <Box mb={4}>
            <WalletSection user={me} />
          </Box>

          {/* Profile Card */}
          <Box 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            borderRadius="20px" 
            p={6} 
            mb={4} 
            boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative circles */}
            <Box
              position="absolute"
              top="-20px"
              right="-20px"
              w="100px"
              h="100px"
              bg="whiteAlpha.200"
              borderRadius="full"
            />
            <Box
              position="absolute"
              bottom="-30px"
              left="-30px"
              w="120px"
              h="120px"
              bg="whiteAlpha.100"
              borderRadius="full"
            />
            
            <Flex gap={4} align="start" position="relative" zIndex={1}>
              <Avatar
                size="xl"
                name={`${me.firstName} ${me.lastName}`}
                bg="white"
                color="purple.600"
                fontWeight="700"
                border="4px solid"
                borderColor="whiteAlpha.300"
              />
              
              <Box flex={1}>
                {!isEditing ? (
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontSize="2xl" fontWeight="800" color="white">
                        {me.firstName} {me.lastName}
                      </Text>
                      <Badge colorScheme="green" mt={2} px={3} py={1} borderRadius="full" fontSize="11px" fontWeight="600">
                        ✓ Active Account
                      </Badge>
                    </Box>
                    
                    <VStack align="start" spacing={2} w="full" mt={2}>
                      <HStack spacing={2} color="whiteAlpha.900">
                        <Icon as={FiMail} boxSize={4} />
                        <Text fontSize="sm" fontWeight="500">{me.email}</Text>
                      </HStack>
                      {me.phoneNumber && (
                        <HStack spacing={2} color="whiteAlpha.900">
                          <Icon as={FiPhone} boxSize={4} />
                          <Text fontSize="sm" fontWeight="500">{me.phoneNumber}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
                      <Box>
                        <Text fontSize="xs" fontWeight="600" color="whiteAlpha.900" mb={1.5}>
                          FIRST NAME
                        </Text>
                        <Input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First name"
                          size="md"
                          bg="whiteAlpha.200"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: "whiteAlpha.600" }}
                          _focus={{ bg: "whiteAlpha.300", borderColor: "whiteAlpha.500" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="600" color="whiteAlpha.900" mb={1.5}>
                          LAST NAME
                        </Text>
                        <Input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last name"
                          size="md"
                          bg="whiteAlpha.200"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: "whiteAlpha.600" }}
                          _focus={{ bg: "whiteAlpha.300", borderColor: "whiteAlpha.500" }}
                        />
                      </Box>
                    </Grid>

                    <Box>
                      <Text fontSize="xs" fontWeight="600" color="whiteAlpha.900" mb={1.5}>
                        EMAIL ADDRESS
                      </Text>
                      <Input
                        value={editForm.email}
                        isDisabled
                        size="md"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="whiteAlpha.700"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="xs" fontWeight="600" color="whiteAlpha.900" mb={1.5}>
                        PHONE NUMBER
                      </Text>
                      <Input
                        value={editForm.phoneNumber}
                        isDisabled
                        size="md"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="whiteAlpha.700"
                      />
                    </Box>

                    <HStack spacing={2}>
                      <Button
                        leftIcon={<FiCheck />}
                        bg="white"
                        color="purple.600"
                        onClick={handleSave}
                        isLoading={updateMutation.isPending}
                        size="sm"
                        fontWeight="600"
                        _hover={{ bg: "whiteAlpha.900" }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        leftIcon={<FiX />}
                        bg="whiteAlpha.200"
                        color="white"
                        onClick={handleCancel}
                        size="sm"
                        fontWeight="600"
                        _hover={{ bg: "whiteAlpha.300" }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </Box>
            </Flex>
          </Box>

          {/* Quick Actions */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3} mb={4}>
            {quickActions.map((action, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="16px"
                p={4}
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
                cursor="pointer"
                onClick={action.action}
                transition="all 0.3s"
                border="1px solid"
                borderColor="gray.100"
                _hover={{ 
                  transform: "translateY(-4px)", 
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                  borderColor: action.color
                }}
              >
                <VStack spacing={3} align="start">
                  <Flex
                    w={12}
                    h={12}
                    bg={action.bg}
                    borderRadius="14px"
                    align="center"
                    justify="center"
                  >
                    <Icon as={action.icon} color={action.color} boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="xl" fontWeight="800" color="gray.900">
                      {action.value}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="600" mt={0.5}>
                      {action.label}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </Grid>

          {/* Settings Menu */}
          <Box bg="white" borderRadius="20px" p={5} mb={4} boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)" border="1px solid" borderColor="gray.100">
            <HStack spacing={2} mb={4}>
              <Box
                w={10}
                h={10}
                bg="gray.100"
                borderRadius="12px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiSettings} color="gray.700" boxSize={5} />
              </Box>
              <Text fontSize="lg" fontWeight="800" color="gray.900">
                Settings
              </Text>
            </HStack>
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {settingsMenu.map((item, index) => (
                <Flex
                  key={index}
                  py={4}
                  px={3}
                  align="center"
                  cursor="pointer"
                  borderRadius="12px"
                  transition="all 0.2s"
                  _hover={{ bg: "gray.50", transform: "translateX(4px)" }}
                  onClick={item.action}
                >
                  <Flex
                    w={12}
                    h={12}
                    bg="gray.50"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                    mr={3}
                  >
                    <Icon as={item.icon} color="gray.700" boxSize={5} />
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="700" color="gray.900">
                      {item.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {item.description}
                    </Text>
                  </Box>
                  <Icon as={FiChevronRight} color="gray.400" boxSize={5} />
                </Flex>
              ))}
            </VStack>
          </Box>

          {/* Logout Button */}
          <Button
            leftIcon={<FiLogOut />}
            bg="red.500"
            color="white"
            w="full"
            onClick={handleLogout}
            size="lg"
            borderRadius="14px"
            fontWeight="700"
            py={7}
            _hover={{ bg: "red.600", transform: "translateY(-2px)" }}
            _active={{ bg: "red.700" }}
            boxShadow="0 4px 12px rgba(239, 68, 68, 0.3)"
            transition="all 0.2s"
          >
            Logout
          </Button>
        </Box>
      </Wrapper>
    </Box>
  );
}

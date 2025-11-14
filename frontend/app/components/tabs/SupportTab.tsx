"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Flex,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";
import { FaHeadset, FaPhone, FaEnvelope, FaQuestionCircle } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import Wrapper from "../Wrapper";
import EmptyState from "../EmptyState";
import { api } from "@/lib/api";

const SupportTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const supportCategories = [
    { value: "order", label: "Order Issues" },
    { value: "payment", label: "Payment Problems" },
    { value: "delivery", label: "Delivery Issues" },
    { value: "account", label: "Account Support" },
    { value: "technical", label: "Technical Support" },
    { value: "other", label: "Other" },
  ];

  // Mutation for submitting support ticket
  const submitTicketMutation = useMutation({
    mutationFn: (data: { subject: string; message: string }) => api.createSupportTicket(data),
    onSuccess: () => {
      toast({
        title: "Ticket submitted successfully!",
        description: "We'll get back to you within 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setSelectedCategory("");
      setSubject("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit ticket",
        description: error.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmitTicket = async () => {
    if (!selectedCategory || !subject || !message) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to submit a support ticket.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTicketMutation.mutateAsync({
        subject: `[${selectedCategory}] ${subject}`,
        message: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActions = [
    {
      icon: FaPhone,
      title: "Call Support",
      description: "Speak with our support team",
      action: () => {
        toast({
          title: "Calling support...",
          description: "Please dial +234-XXX-XXXX-XXXX",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      },
      color: "green",
    },
    {
      icon: FaEnvelope,
      title: "Email Support",
      description: "Send us an email",
      action: () => {
        window.location.href = "mailto:support@boiboi.com";
      },
      color: "blue",
    },
    {
      icon: FaQuestionCircle,
      title: "FAQ",
      description: "Find quick answers",
      action: () => {
        toast({
          title: "FAQ Coming Soon",
          description: "We're working on a comprehensive FAQ section.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      },
      color: "brand.primary",
    },
  ];

  return (
    <Box minH="calc(100vh - 72px)" pb="calc(env(safe-area-inset-bottom, 0px) + 72px)">
      <Wrapper>
        <Box py={4}>
          <Flex justify="space-between" align="center" mb={6} mt={4}>
            <HStack spacing={4}>
              <Box
                p={3}
                borderRadius="12px"
                bg="gray.50"
              >
                <FaHeadset color="#374151" size="20px" />
              </Box>
              <Text fontSize={{ base: "20px", md: "24px" }} fontWeight="700" color="gray.900">
                Support
              </Text>
            </HStack>
          </Flex>

          {/* Quick Actions */}
          <VStack spacing={4} align="stretch" mb={8}>
            <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" color="gray.900" mb={2}>
              Quick Help
            </Text>
            {quickActions.map((action, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="12px"
                p={{ base: 4, md: 5 }}
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{
                  borderColor: "gray.300",
                }}
                transition="all 0.2s ease"
                onClick={action.action}
              >
                <HStack spacing={4}>
                  <Box
                    p={3}
                    borderRadius="8px"
                    bg={`${action.color}.50`}
                    color={`${action.color}.600`}
                  >
                    <action.icon size={20} />
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="600" color="gray.900" noOfLines={1}>
                      {action.title}
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                      {action.description}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>

          {/* Contact Form */}
          <Box bg="white" borderRadius="12px" p={{ base: 5, md: 6 }} border="1px solid" borderColor="gray.200">
            <VStack spacing={5} align="stretch">
              <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" color="gray.900" mb={2}>
                Submit a Support Ticket
              </Text>
              
              <VStack spacing={5} align="stretch">
                <Box>
                  <Text fontSize="14px" fontWeight="600" color="gray.700" mb={3}>
                    Category
                  </Text>
                  <Select
                    placeholder="Select a category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    _focus={{
                      borderColor: "gray.300",
                      bg: "white"
                    }}
                  >
                    {supportCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="14px" fontWeight="600" color="gray.700" mb={3}>
                    Subject
                  </Text>
                  <Input
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    _focus={{
                      borderColor: "gray.300",
                      bg: "white"
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="14px" fontWeight="600" color="gray.700" mb={3}>
                    Message
                  </Text>
                  <Textarea
                    placeholder="Please provide detailed information about your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    resize="vertical"
                    _focus={{
                      borderColor: "gray.300",
                      bg: "white"
                    }}
                  />
                </Box>

                <Button
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: "gray.800" }}
                  onClick={handleSubmitTicket}
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  size={{ base: 'md', md: 'lg' }}
                  borderRadius="8px"
                  transition="all 0.2s ease"
                >
                  Submit Ticket
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Support Information */}
          <Box bg="white" borderRadius="12px" p={{ base: 5, md: 6 }} border="1px solid" borderColor="gray.200" mt={8}>
            <VStack spacing={5} align="stretch">
              <Text fontSize={{ base: "18px", md: "20px" }} fontWeight="600" color="gray.900" mb={2}>
                Contact Information
              </Text>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={{ base: 3, md: 4 }}>
                  <Box
                    p={{ base: 2, md: 2 }}
                    borderRadius="full"
                    bg="rgba(107, 42, 143, 0.15)"
                    color="brand.primary"
                  >
                    <FaPhone size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500" color="#000" noOfLines={1}>
                      Phone Support
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                      +234-XXX-XXXX-XXXX (9 AM - 6 PM)
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={{ base: 3, md: 4 }}>
                  <Box
                    p={{ base: 2, md: 2 }}
                    borderRadius="full"
                    bg="blue.100"
                    color="blue.600"
                  >
                    <FaEnvelope size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500" color="#000" noOfLines={1}>
                      Email Support
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                      support@boiboi.com
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={{ base: 3, md: 4 }}>
                  <Box
                    p={{ base: 2, md: 2 }}
                    borderRadius="full"
                    bg="green.100"
                    color="green.600"
                  >
                    <FaHeadset size={16} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="500" color="#000" noOfLines={1}>
                      Live Chat
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                      Available 24/7 in the app
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Box>
        <Box mb="5em" />
      </Wrapper>
    </Box>
  );
};

export default SupportTab;

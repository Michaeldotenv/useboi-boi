"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useToast,
  VStack,
  Badge,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { ArrowBackIcon, AddIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FaCreditCard } from "react-icons/fa";

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch user data to get cards
  const { data: meData, isLoading } = useQuery({ 
    queryKey: ["me"], 
    queryFn: api.me 
  });
  
  const meObj = ((meData as any)?.data || meData || {}) as any;
  const userCards = (meObj?.cards || []) as Array<{
    id: number;
    bank: string;
    cardType: string;
    authorizationCode: string;
    isSelected: boolean;
  }>;

  // Add card mutation
  const addCardMutation = useMutation({
    mutationFn: () => {
      const email = meObj?.email || "";
      const callbackUrl = `${window.location.origin}/user-dashboard/profile/cards`;
      return api.getCardAuthorizationUrl(email, callbackUrl);
    },
    onSuccess: (data: any) => {
      // Redirect to authorization URL
      const authUrl = data?.data?.authorization_url || data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to get authorization URL",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || "";
      
      // Handle specific Paystack errors
      let title = "Failed to add card";
      let description = "Please try again or contact support";
      
      if (errorMsg.includes("No active channel")) {
        title = "Card payment not configured";
        description = "Card payments need to be activated in your Paystack account. Please contact your administrator or use wallet payment for now.";
      } else if (errorMsg.includes("email")) {
        title = "Email required";
        description = "Please ensure your profile has a valid email address.";
      }
      
      toast({
        title,
        description,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    },
    onSettled: () => {
      setIsAddingCard(false);
    },
  });

  const handleAddCard = () => {
    setIsAddingCard(true);
    addCardMutation.mutate();
  };

  // Handle callback from Paystack
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference && !isVerifying) {
      setIsVerifying(true);
      
      // Verify and add the card
      api.verifyCardAndAdd(reference)
        .then(() => {
          toast({
            title: "Card added successfully!",
            description: "Your card has been saved and is ready to use.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          queryClient.invalidateQueries({ queryKey: ["me"] });
          
          // Clean up URL
          router.replace("/user-dashboard/profile/cards");
        })
        .catch((error: any) => {
          toast({
            title: "Failed to add card",
            description: error.message || "Please try again",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [searchParams, isVerifying, toast, queryClient, router]);

  if (isLoading || isVerifying) {
    return (
      <Box minH="100vh" bg="#F5F5F5" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.primary" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb={24}>
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" pt={6} pb={6} px={6}>
        <HStack spacing={4} mb={3}>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={() => router.back()}
            bg="gray.100"
            color="gray.700"
            _hover={{ bg: "gray.200" }}
            _active={{ bg: "gray.300" }}
            borderRadius="10px"
            size="md"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="gray.900" fontWeight="600">Payment Cards</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="400">
              Manage your saved payment methods
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Cards List */}
      <Box px={6} mt={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {userCards.length === 0 ? (
              <Card
                bg="white"
                borderRadius="16px"
                p={10}
                textAlign="center"
                border="1px solid"
                borderColor="gray.200"
              >
              <Box bg="gray.100" borderRadius="full" w="80px" h="80px" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={5}>
                <Icon as={FaCreditCard} boxSize={10} color="gray.400" />
              </Box>
              <Text fontSize="xl" fontWeight="600" mb={2} color="gray.900">
                No cards saved
              </Text>
              <Text color="gray.500" mb={8} fontSize="sm">
                Add a payment card to enable faster checkouts
              </Text>
              <Button
                leftIcon={<AddIcon />}
                bg="gray.900"
                color="white"
                _hover={{ bg: "gray.800" }}
                _active={{ bg: "gray.700" }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
                borderRadius="10px"
                fontWeight="500"
              >
                Add Card
              </Button>
            </Card>
          ) : (
            <>
              {userCards.map((card) => (
                <Card
                  key={card.id}
                  bg="white"
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="gray.200"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ borderColor: "gray.300", bg: "gray.50" }}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="start">
                      <HStack spacing={4} flex={1}>
                        <Box
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          color="white"
                          p={3.5}
                          borderRadius="12px"
                        >
                          <Icon as={FaCreditCard} boxSize={6} />
                        </Box>
                        <VStack align="start" spacing={1.5}>
                          <HStack>
                            <Text fontSize="lg" fontWeight="600" color="gray.900">
                              {card.bank}
                            </Text>
                            {card.isSelected && (
                              <Badge bg="green.100" color="green.700" display="flex" alignItems="center" gap={1} px={2} py={0.5} borderRadius="6px" fontWeight="500">
                                <CheckIcon boxSize={2.5} />
                                Default
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.500" fontWeight="500">
                            {card.cardType}
                          </Text>
                          <Text fontSize="xs" color="gray.400" letterSpacing="wider">
                            •••• •••• •••• ••••
                          </Text>
                        </VStack>
                      </HStack>
                      <IconButton
                        aria-label="Remove card"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        color="gray.400"
                        isDisabled
                        _hover={{ bg: "red.50", color: "red.500" }}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}

              {/* Add Card Button */}
              <Button
                leftIcon={<AddIcon />}
                bg="white"
                border="1.5px solid"
                borderColor="gray.300"
                color="gray.700"
                _hover={{ bg: "gray.900", color: "white", borderColor: "gray.900" }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
                borderRadius="14px"
                fontWeight="500"
                h="auto"
                py={6}
              >
                Add Another Card
              </Button>
            </>
          )}
        </SimpleGrid>
      </Box>

      {/* Info Boxes */}
      <Box px={6} mt={6}>
        <VStack spacing={3}>
          <Card bg="blue.50" borderRadius="14px" border="1px solid" borderColor="blue.200">
            <CardBody p={5}>
              <HStack align="start" spacing={3}>
                <Text fontSize="lg">💳</Text>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="blue.900" mb={1}>
                    Secure Payment
                  </Text>
                  <Text fontSize="sm" color="blue.800">
                    Your card details are encrypted and stored securely with Paystack. We never store your full card number.
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          
          <Card bg="purple.50" borderRadius="14px" border="1px solid" borderColor="purple.200">
            <CardBody p={5}>
              <HStack align="start" spacing={3}>
                <Text fontSize="lg">💡</Text>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="purple.900" mb={1}>
                    Card Verification Fee
                  </Text>
                  <Text fontSize="sm" color="purple.800">
                    A ₦100 verification charge is required to add your card. This amount will be refunded to your wallet immediately after verification.
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          
          <Card bg="orange.50" borderRadius="14px" border="1px solid" borderColor="orange.200">
            <CardBody p={5}>
              <HStack align="start" spacing={3}>
                <Text fontSize="lg">⚠️</Text>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="orange.900" mb={1}>
                    Card Payment Setup Required
                  </Text>
                  <Text fontSize="sm" color="orange.800">
                    If you see "No active channel" error, card payments need to be activated in your Paystack dashboard. Use wallet payment in the meantime.
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}


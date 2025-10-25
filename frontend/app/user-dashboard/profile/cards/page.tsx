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
    <Box minH="100vh" bg="#F5F5F5" pb={24}>
      {/* Header */}
      <Box bg="brand.primary" color="white" pt={6} pb={8} px={6}>
        <HStack spacing={4} mb={4}>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={() => router.back()}
            bg="whiteAlpha.200"
            color="white"
            _hover={{ bg: "whiteAlpha.300" }}
            borderRadius="12px"
          />
          <Heading size="lg">Payment Cards</Heading>
        </HStack>
        <Text fontSize="sm" opacity={0.9}>
          Manage your saved payment methods
        </Text>
      </Box>

      {/* Cards List */}
      <Box px={6} mt={-4}>
        <VStack spacing={4} align="stretch">
          {userCards.length === 0 ? (
            <Card
              bg="white"
              borderRadius="16px"
              boxShadow="sm"
              p={8}
              textAlign="center"
            >
              <Icon as={FaCreditCard} boxSize={16} color="gray.300" mb={4} mx="auto" />
              <Text fontSize="lg" fontWeight="600" mb={2}>
                No cards saved
              </Text>
              <Text color="gray.600" mb={6}>
                Add a payment card to enable faster checkouts
              </Text>
              <Button
                leftIcon={<AddIcon />}
                bg="brand.primary"
                color="white"
                _hover={{ bg: "brand.primaryDark" }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
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
                  boxShadow="sm"
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ boxShadow: "md" }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="start">
                      <HStack spacing={4} flex={1}>
                        <Box
                          bg="brand.primary"
                          color="white"
                          p={3}
                          borderRadius="12px"
                        >
                          <Icon as={FaCreditCard} boxSize={6} />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontSize="lg" fontWeight="700">
                              {card.bank}
                            </Text>
                            {card.isSelected && (
                              <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                                <CheckIcon boxSize={3} />
                                Default
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {card.cardType}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            •••• •••• •••• ••••
                          </Text>
                        </VStack>
                      </HStack>
                      <IconButton
                        aria-label="Remove card"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        isDisabled
                        _hover={{ bg: "red.50" }}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}

              {/* Add Card Button */}
              <Button
                leftIcon={<AddIcon />}
                variant="outline"
                borderColor="brand.primary"
                color="brand.primary"
                _hover={{ bg: "brand.primary", color: "white" }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
              >
                Add Another Card
              </Button>
            </>
          )}
        </VStack>
      </Box>

      {/* Info Boxes */}
      <Box px={6} mt={6}>
        <VStack spacing={4}>
          <Card bg="blue.50" borderRadius="16px" border="1px solid" borderColor="blue.200">
            <CardBody>
              <Text fontSize="sm" color="blue.900">
                💳 <strong>Secure Payment:</strong> Your card details are encrypted and stored
                securely with Paystack. We never store your full card number.
              </Text>
            </CardBody>
          </Card>
          
          <Card bg="rgba(107, 42, 143, 0.1)" borderRadius="16px" border="1px solid" borderColor="rgba(107, 42, 143, 0.3)">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="brand.primary">
                  💡 Card Verification Fee
                </Text>
                <Text fontSize="sm" color="brand.primaryLight">
                  A ₦100 verification charge is required to add your card. This amount will
                  be refunded to your wallet immediately after verification.
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg="orange.50" borderRadius="16px" border="1px solid" borderColor="orange.200">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="orange.900">
                  ⚠️ Card Payment Setup Required
                </Text>
                <Text fontSize="sm" color="orange.800">
                  If you see "No active channel" error, card payments need to be activated
                  in your Paystack dashboard. Use wallet payment in the meantime.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}


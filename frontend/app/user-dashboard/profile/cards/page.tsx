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

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: number) => api.deleteCard(cardId),
    onSuccess: () => {
      toast({
        title: "Card removed",
        description: "Your card has been removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove card",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    <Box minH="100vh" bg="white" pb={24}>
      {/* Header with Gradient */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        pt={6} 
        pb={8} 
        px={6}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="whiteAlpha.200" />
        <Box position="absolute" bottom="-30px" left="-30px" w="120px" h="120px" borderRadius="full" bg="whiteAlpha.100" />
        
        <HStack spacing={4} mb={3} position="relative" zIndex={1}>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={() => router.back()}
            bg="whiteAlpha.300"
            color="white"
            _hover={{ bg: "whiteAlpha.400" }}
            _active={{ bg: "whiteAlpha.500" }}
            borderRadius="12px"
            size="md"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg" color="white" fontWeight="800">Payment Cards</Heading>
            <Text fontSize="sm" color="whiteAlpha.900" fontWeight="500">
              Manage your saved payment methods
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Cards List */}
      <Box px={6} mt={-4}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {userCards.length === 0 ? (
              <Card
                bg="white"
                borderRadius="20px"
                p={10}
                textAlign="center"
                border="none"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              >
              <Box 
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                borderRadius="full" 
                w="100px" 
                h="100px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                mx="auto" 
                mb={6}
              >
                <Icon as={FaCreditCard} boxSize={12} color="white" />
              </Box>
              <Text fontSize="2xl" fontWeight="800" mb={3} color="gray.900">
                No cards saved
              </Text>
              <Text color="gray.500" mb={8} fontSize="md" lineHeight="1.6">
                Add a payment card to enable faster checkouts and seamless payments
              </Text>
              <Button
                leftIcon={<AddIcon />}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)" }}
                _active={{ transform: "translateY(0)" }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
                borderRadius="14px"
                fontWeight="700"
                py={7}
                transition="all 0.3s"
              >
                Add Your First Card
              </Button>
            </Card>
          ) : (
            <>
              {userCards.map((card) => (
                <Card
                  key={card.id}
                  bg="white"
                  borderRadius="20px"
                  border="none"
                  overflow="hidden"
                  transition="all 0.3s"
                  boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="start">
                      <HStack spacing={4} flex={1}>
                        <Box
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          color="white"
                          p={4}
                          borderRadius="16px"
                          boxShadow="0 4px 12px rgba(102, 126, 234, 0.3)"
                        >
                          <Icon as={FaCreditCard} boxSize={7} />
                        </Box>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Text fontSize="xl" fontWeight="800" color="gray.900">
                              {card.bank}
                            </Text>
                            {card.isSelected && (
                              <Badge 
                                bg="green.500" 
                                color="white" 
                                display="flex" 
                                alignItems="center" 
                                gap={1} 
                                px={3} 
                                py={1} 
                                borderRadius="full" 
                                fontWeight="700"
                                fontSize="xs"
                              >
                                <CheckIcon boxSize={2.5} />
                                Default
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600" fontWeight="600">
                            {card.cardType}
                          </Text>
                          <Text fontSize="sm" color="gray.400" letterSpacing="wider" fontFamily="mono">
                            •••• •••• •••• ••••
                          </Text>
                        </VStack>
                      </HStack>
                      <IconButton
                        aria-label="Remove card"
                        icon={<DeleteIcon />}
                        size="md"
                        variant="ghost"
                        color="gray.400"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to remove this card?")) {
                            deleteCardMutation.mutate(card.id);
                          }
                        }}
                        isLoading={deleteCardMutation.isPending}
                        borderRadius="12px"
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
                border="2px dashed"
                borderColor="purple.300"
                color="purple.600"
                _hover={{ 
                  bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                  color: "white", 
                  borderColor: "transparent",
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 30px rgba(102, 126, 234, 0.3)"
                }}
                onClick={handleAddCard}
                isLoading={isAddingCard}
                loadingText="Redirecting..."
                size="lg"
                borderRadius="20px"
                fontWeight="700"
                h="auto"
                py={8}
                transition="all 0.3s"
              >
                Add Another Card
              </Button>
            </>
          )}
        </SimpleGrid>
      </Box>

      {/* Info Boxes */}
      <Box px={6} mt={6}>
        <VStack spacing={4}>
          <Card 
            bg="linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%)" 
            borderRadius="20px" 
            border="none"
            boxShadow="0 2px 12px rgba(59, 130, 246, 0.15)"
          >
            <CardBody p={6}>
              <HStack align="start" spacing={4}>
                <Box
                  bg="blue.500"
                  borderRadius="12px"
                  p={3}
                  color="white"
                >
                  <Text fontSize="2xl">💳</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="md" fontWeight="800" color="blue.900" mb={2}>
                    Secure Payment
                  </Text>
                  <Text fontSize="sm" color="blue.800" lineHeight="1.6">
                    Your card details are encrypted and stored securely with Paystack. We never store your full card number.
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          
          <Card 
            bg="linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)" 
            borderRadius="20px" 
            border="none"
            boxShadow="0 2px 12px rgba(147, 51, 234, 0.15)"
          >
            <CardBody p={6}>
              <HStack align="start" spacing={4}>
                <Box
                  bg="purple.500"
                  borderRadius="12px"
                  p={3}
                  color="white"
                >
                  <Text fontSize="2xl">💡</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="md" fontWeight="800" color="purple.900" mb={2}>
                    Card Verification Fee
                  </Text>
                  <Text fontSize="sm" color="purple.800" lineHeight="1.6">
                    A ₦100 verification charge is required to add your card. This amount will be refunded to your wallet immediately after verification.
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
          
          <Card 
            bg="linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)" 
            borderRadius="20px" 
            border="none"
            boxShadow="0 2px 12px rgba(249, 115, 22, 0.15)"
          >
            <CardBody p={6}>
              <HStack align="start" spacing={4}>
                <Box
                  bg="orange.500"
                  borderRadius="12px"
                  p={3}
                  color="white"
                >
                  <Text fontSize="2xl">⚠️</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="md" fontWeight="800" color="orange.900" mb={2}>
                    Card Payment Setup Required
                  </Text>
                  <Text fontSize="sm" color="orange.800" lineHeight="1.6">
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


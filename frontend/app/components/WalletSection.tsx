"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
  useToast,
  Spinner,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiClock, FiCopy } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface WalletSectionProps {
  user: any;
  onBalanceUpdate?: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({ user, onBalanceUpdate }) => {
  const { isOpen: isTopupOpen, onOpen: onTopupOpen, onClose: onTopupClose } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const toast = useToast();

  const walletBalance = user?.virtualBankAccount?.balance || 0;
  const accountNumber = user?.virtualBankAccount?.account_number || 'Not available';

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: api.getWalletTransactions,
    refetchInterval: 30000,
  });

  // Trigger parent refetch when transactions update
  React.useEffect(() => {
    if (transactions && onBalanceUpdate) {
      onBalanceUpdate();
    }
  }, [transactions, onBalanceUpdate]);

  // Auto-refresh wallet if account number is missing
  React.useEffect(() => {
    const refreshWalletAccount = async () => {
      if (!accountNumber || accountNumber === 'Not available') {
        try {
          console.log('Attempting to refresh wallet account...');
          const result = await api.refreshWallet();
          console.log('Wallet refresh result:', result);
          
          // Wait a bit then trigger parent refetch
          setTimeout(() => {
            if (onBalanceUpdate) {
              onBalanceUpdate();
            }
          }, 1000);
        } catch (error: any) {
          console.error('Failed to refresh wallet:', error);
          
          // If it says account is being created, retry after delay
          if (error.message?.includes('not yet available')) {
            console.log('Account being created, will retry in 5 seconds...');
            setTimeout(() => {
              refreshWalletAccount();
            }, 5000);
          }
        }
      }
    };

    refreshWalletAccount();
  }, [accountNumber, onBalanceUpdate]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      await api.createBankAccount();
      toast({
        title: "Account created!",
        description: "Your virtual account is being set up. Please wait...",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Wait and refresh
      setTimeout(() => {
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
        setIsCreatingAccount(false);
      }, 5000);
    } catch (error: any) {
      console.error('Create account error:', error);
      toast({
        title: "Failed to create account",
        description: error.message || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsCreatingAccount(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) < 100) {
      toast({
        title: 'Invalid amount',
        description: 'Minimum top-up amount is ₦100',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.initTopup({
        amount: parseFloat(topupAmount),
        callback_url: `${window.location.origin}/user-dashboard/profile`,
        metadata: {
          type: 'wallet_topup',
        },
      });

      // Handle different response structures
      const authUrl = (response as any).data?.authorization_url || (response as any).authorization_url;
      
      if (authUrl) {
        // Close modal before redirect
        onTopupClose();
        window.location.href = authUrl;
      } else {
        console.error('Response structure:', response);
        throw new Error('No authorization URL received from payment provider');
      }
    } catch (error: any) {
      console.error('Top-up error:', error);
      toast({
        title: 'Top-up failed',
        description: error.message || 'Unable to initialize payment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      toast({
        title: 'Invalid amount',
        description: 'Minimum withdrawal amount is ₦100',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (parseFloat(withdrawAmount) > walletBalance) {
      toast({
        title: 'Insufficient balance',
        description: 'You do not have enough balance',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await api.walletWithdrawals({
        amount: parseFloat(withdrawAmount),
        type: 'customer',
      });

      toast({
        title: 'Withdrawal requested',
        description: 'Your request will be processed within 24 hours',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setWithdrawAmount('');
      onWithdrawClose();
    } catch (error: any) {
      toast({
        title: 'Withdrawal failed',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle both response formats: direct array or wrapped in data field
  const allTransactions = Array.isArray(transactions) 
    ? transactions 
    : (Array.isArray((transactions as any)?.data) ? (transactions as any).data : []);
  const recentTransactions = allTransactions.slice(0, 3);

  return (
    <>
      {/* 3D Wallet Card */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        borderRadius="20px"
        p={{ base: 4, md: 6 }}
        color="white"
        boxShadow="0 20px 60px rgba(102, 126, 234, 0.4), 0 8px 16px rgba(0, 0, 0, 0.1)"
        position="relative"
        overflow="hidden"
        transform="perspective(1000px) rotateX(2deg)"
        transition="all 0.3s ease"
        _hover={{
          transform: "perspective(1000px) rotateX(0deg) translateY(-4px)",
          boxShadow: "0 25px 70px rgba(102, 126, 234, 0.5), 0 10px 20px rgba(0, 0, 0, 0.15)"
        }}
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="whiteAlpha.200" display={{ base: "none", md: "block" }} />
        <Box position="absolute" bottom="-30px" left="-30px" w="120px" h="120px" borderRadius="full" bg="whiteAlpha.100" display={{ base: "none", md: "block" }} />
        
        {/* Shine effect */}
        <Box
          position="absolute"
          top="0"
          left="-100%"
          w="50%"
          h="100%"
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
          transform="skewX(-20deg)"
          animation="shine 3s infinite"
          sx={{
            '@keyframes shine': {
              '0%': { left: '-100%' },
              '100%': { left: '200%' }
            }
          }}
        />
        
        <VStack align="stretch" spacing={3} position="relative" zIndex={1}>
          {/* Header */}
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Flex
                w={{ base: 7, md: 8 }}
                h={{ base: 7, md: 8 }}
                bg="whiteAlpha.300"
                borderRadius="lg"
                align="center"
                justify="center"
              >
                <Icon as={FiDollarSign} boxSize={{ base: 4, md: 5 }} />
              </Flex>
              <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" opacity={0.9}>
                Wallet Balance
              </Text>
            </HStack>
            <Badge bg="whiteAlpha.300" color="white" px={2} py={0.5} borderRadius="md" fontSize="xs">
              Active
            </Badge>
          </Flex>

          {/* Balance */}
          <Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" letterSpacing="tight">
              ₦{walletBalance.toLocaleString()}
            </Text>
            <VStack align="start" spacing={0.5} mt={1.5} opacity={0.9}>
              <HStack spacing={1.5}>
                <Text fontSize="xs" fontWeight="600">Paystack Titan</Text>
              </HStack>
              {accountNumber && accountNumber !== 'Not available' ? (
                <HStack spacing={1.5}>
                  <Text fontSize="xs">Account: {accountNumber}</Text>
                  <Icon
                    as={FiCopy}
                    boxSize={3}
                    cursor="pointer"
                    onClick={handleCopyAccount}
                    _hover={{ opacity: 1 }}
                  />
                </HStack>
              ) : (
                <Button
                  size="xs"
                  bg="whiteAlpha.300"
                  color="white"
                  onClick={handleCreateAccount}
                  isLoading={isCreatingAccount}
                  loadingText="Creating..."
                  _hover={{ bg: "whiteAlpha.400" }}
                  mt={1}
                >
                  Create Virtual Account
                </Button>
              )}
            </VStack>
          </Box>

          {/* Action Buttons */}
          <HStack spacing={2}>
            <Button
              flex={1}
              leftIcon={<FiArrowUpRight />}
              bg="white"
              color="purple.600"
              size="sm"
              fontWeight="600"
              _hover={{ bg: "whiteAlpha.900" }}
              onClick={onTopupOpen}
              isDisabled={!accountNumber || accountNumber === 'Not available'}
            >
              Add Money
            </Button>
            <Button
              flex={1}
              leftIcon={<FiArrowDownLeft />}
              bg="whiteAlpha.300"
              color="white"
              size="sm"
              fontWeight="600"
              _hover={{ bg: "whiteAlpha.400" }}
              onClick={onWithdrawOpen}
              isDisabled={walletBalance < 100}
            >
              Withdraw
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <Box bg="white" borderRadius="xl" p={{ base: 3, md: 4 }} mt={3} boxShadow="sm">
          <HStack justify="space-between" mb={2}>
            <HStack spacing={1.5}>
              <Icon as={FiClock} boxSize={3.5} color="gray.600" />
              <Text fontSize="xs" fontWeight="600" color="gray.900">
                Recent Activity
              </Text>
            </HStack>
            <Button
              size="xs"
              variant="ghost"
              color="purple.600"
              fontWeight="600"
              fontSize="xs"
              onClick={() => window.location.href = '/user-dashboard/profile/transactions'}
              px={2}
            >
              View All
            </Button>
          </HStack>

          <VStack spacing={1.5} align="stretch">
            {transactionsLoading ? (
              <Flex justify="center" py={3}>
                <Spinner size="sm" color="purple.600" />
              </Flex>
            ) : (
              recentTransactions.map((transaction: any, index: number) => (
                <Flex key={index} justify="space-between" align="center" py={1.5}>
                  <HStack spacing={2}>
                    <Flex
                      w={7}
                      h={7}
                      bg={transaction.type === 'debit' ? 'red.50' : 'green.50'}
                      borderRadius="lg"
                      align="center"
                      justify="center"
                    >
                      <Icon
                        as={transaction.type === 'debit' ? FiArrowDownLeft : FiArrowUpRight}
                        boxSize={3.5}
                        color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                      />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="600" color="gray.900">
                        {transaction.type === 'debit' ? 'Payment' : 'Top-up'}
                      </Text>
                      <Text fontSize="10px" color="gray.500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                  >
                    {transaction.type === 'debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                  </Text>
                </Flex>
              ))
            )}
          </VStack>
        </Box>
      )}

      {/* Top-up Modal */}
      <Modal isOpen={isTopupOpen} onClose={onTopupClose} size="sm" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4}>
          <ModalHeader>Add Money</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
                  AMOUNT (₦)
                </Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="100"
                  step="100"
                  size="lg"
                  fontSize="md"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Minimum: ₦100
                </Text>
              </Box>

              <HStack spacing={2} width="100%">
                <Button flex={1} variant="ghost" onClick={onTopupClose} isDisabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  flex={1}
                  colorScheme="purple"
                  onClick={handleTopup}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                >
                  Continue
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} size="sm" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={4}>
          <ModalHeader>Withdraw Money</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
                  AMOUNT (₦)
                </Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="100"
                  step="100"
                  size="lg"
                  fontSize="md"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Available: ₦{walletBalance.toLocaleString()}
                </Text>
              </Box>

              <HStack spacing={2} width="100%">
                <Button flex={1} variant="ghost" onClick={onWithdrawClose} isDisabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  flex={1}
                  colorScheme="purple"
                  onClick={handleWithdraw}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                >
                  Withdraw
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WalletSection;

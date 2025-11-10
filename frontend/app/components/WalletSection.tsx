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
}

const WalletSection: React.FC<WalletSectionProps> = ({ user }) => {
  const { isOpen: isTopupOpen, onOpen: onTopupOpen, onClose: onTopupClose } = useDisclosure();
  const { isOpen: isWithdrawOpen, onOpen: onWithdrawOpen, onClose: onWithdrawClose } = useDisclosure();
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: api.getWalletTransactions,
    refetchInterval: 30000,
  });

  const walletBalance = user?.virtualBankAccount?.balance || 0;
  const accountNumber = user?.virtualBankAccount?.account_number || 'Not available';

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
        email: user.email,
        amount: parseFloat(topupAmount), // Send as number, not string in kobo
        callback_url: `${window.location.origin}/payment-callback`,
        metadata: {
          userId: user.id || user._id,
          type: 'wallet_topup',
        },
      });

      const authUrl = (response as any).data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      console.error('Top-up error:', error);
      toast({
        title: 'Top-up failed',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
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

  const recentTransactions = (transactions as any)?.data?.slice(0, 3) || [];

  return (
    <>
      {/* Modern Wallet Card */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        borderRadius="xl"
        p={6}
        color="white"
        boxShadow="0 10px 30px rgba(102, 126, 234, 0.3)"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" borderRadius="full" bg="whiteAlpha.200" />
        <Box position="absolute" bottom="-30px" left="-30px" w="120px" h="120px" borderRadius="full" bg="whiteAlpha.100" />
        
        <VStack align="stretch" spacing={4} position="relative" zIndex={1}>
          {/* Header */}
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Flex
                w={8}
                h={8}
                bg="whiteAlpha.300"
                borderRadius="lg"
                align="center"
                justify="center"
              >
                <Icon as={FiDollarSign} boxSize={5} />
              </Flex>
              <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                Wallet Balance
              </Text>
            </HStack>
            <Badge bg="whiteAlpha.300" color="white" px={2} py={1} borderRadius="md" fontSize="xs">
              Active
            </Badge>
          </Flex>

          {/* Balance */}
          <Box>
            <Text fontSize="3xl" fontWeight="800" letterSpacing="tight">
              ₦{walletBalance.toLocaleString()}
            </Text>
            <HStack spacing={2} mt={1} opacity={0.8}>
              <Text fontSize="xs">Account: {accountNumber}</Text>
              <Icon
                as={FiCopy}
                boxSize={3}
                cursor="pointer"
                onClick={handleCopyAccount}
                _hover={{ opacity: 1 }}
              />
            </HStack>
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
        <Box bg="white" borderRadius="xl" p={4} mt={3} boxShadow="sm">
          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <Icon as={FiClock} boxSize={4} color="gray.600" />
              <Text fontSize="sm" fontWeight="600" color="gray.900">
                Recent Activity
              </Text>
            </HStack>
          </HStack>

          <VStack spacing={2} align="stretch">
            {transactionsLoading ? (
              <Flex justify="center" py={4}>
                <Spinner size="sm" color="purple.600" />
              </Flex>
            ) : (
              recentTransactions.map((transaction: any, index: number) => (
                <Flex key={index} justify="space-between" align="center" py={2}>
                  <HStack spacing={3}>
                    <Flex
                      w={8}
                      h={8}
                      bg={transaction.type === 'debit' ? 'red.50' : 'green.50'}
                      borderRadius="lg"
                      align="center"
                      justify="center"
                    >
                      <Icon
                        as={transaction.type === 'debit' ? FiArrowDownLeft : FiArrowUpRight}
                        boxSize={4}
                        color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                      />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="600" color="gray.900">
                        {transaction.type === 'debit' ? 'Payment' : 'Top-up'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="sm"
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

"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  useDisclosure,
  useToast,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaWallet, FaPlus, FaMinus, FaHistory } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface WalletSectionProps {
  user: any;
  onBalanceUpdate?: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch wallet transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: api.getWalletTransactions,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const walletBalance = user?.virtualBankAccount?.balance || 0;
  const accountNumber = user?.virtualBankAccount?.account_number || 'Not available';

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
        amount: (parseFloat(topupAmount) * 100).toString(), // Convert to kobo
        callback_url: `${window.location.origin}/payment-callback`,
        metadata: {
          userId: user.id || user._id,
          type: 'wallet_topup',
        },
      });

      // Redirect to payment gateway
      const authUrl = (response as any).data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      console.error('Top-up failed:', error);
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
        description: 'You do not have enough balance for this withdrawal',
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
        title: 'Withdrawal request submitted',
        description: 'Your withdrawal request has been submitted and will be processed within 24 hours',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setWithdrawAmount('');
      onClose();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
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

  const recentTransactions = (transactions as any)?.data?.slice(0, 5) || [];

  return (
    <Box bg={bgColor} borderRadius="16px" p={6} border="1px solid" borderColor={borderColor}>
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Box p={3} bg="rgba(107, 42, 143, 0.1)" borderRadius="12px">
            <FaWallet color="#6B2A8F" size="20px" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="18px" fontWeight="700" color="#000">
              Wallet
            </Text>
            <Text fontSize="12px" color="gray.600">
              Account: {accountNumber}
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme="green" px={3} py={1} borderRadius="full">
          Active
        </Badge>
      </HStack>

      {/* Balance Display */}
      <Box textAlign="center" mb={6}>
        <Text fontSize="32px" fontWeight="700" color="#000">
          ₦{walletBalance.toLocaleString()}
        </Text>
        <Text fontSize="14px" color="gray.600">
          Available Balance
        </Text>
      </Box>

      {/* Action Buttons */}
      <HStack spacing={3} mb={6}>
        <Button
          flex={1}
          leftIcon={<FaPlus />}
          bg="brand.primary"
          color="white"
          _hover={{ bg: "brand.primaryDark" }}
          variant="solid"
          size="lg"
          onClick={() => {
            setTopupAmount('');
            onOpen();
          }}
        >
          Add Money
        </Button>
        <Button
          flex={1}
          leftIcon={<FaMinus />}
          colorScheme="gray"
          variant="outline"
          size="lg"
          onClick={() => {
            setWithdrawAmount('');
            onOpen();
          }}
          disabled={walletBalance < 100}
        >
          Withdraw
        </Button>
      </HStack>

      {/* Recent Transactions */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Text fontSize="16px" fontWeight="700" color="#000">
            Recent Transactions
          </Text>
          <Button
            leftIcon={<FaHistory />}
            size="sm"
            variant="ghost"
            color="brand.primary"
            _hover={{ bg: "rgba(59, 23, 79, 0.1)" }}
          >
            View All
          </Button>
        </HStack>

        {transactionsLoading ? (
          <Box textAlign="center" py={4}>
            <Spinner color="brand.primary" />
            <Text fontSize="14px" color="gray.600" mt={2}>
              Loading transactions...
            </Text>
          </Box>
        ) : recentTransactions.length > 0 ? (
          <VStack spacing={3} align="stretch">
            {recentTransactions.map((transaction: any, index: number) => (
              <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="8px">
                <VStack align="start" spacing={0}>
                  <Text fontSize="14px" fontWeight="600">
                    {transaction.type === 'debit' ? 'Payment' : 'Top-up'}
                  </Text>
                  <Text fontSize="12px" color="gray.600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Text>
                </VStack>
                <Text
                  fontSize="16px"
                  fontWeight="700"
                  color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                >
                  {transaction.type === 'debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                </Text>
              </HStack>
            ))}
          </VStack>
        ) : (
          <Alert status="info" borderRadius="8px">
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="14px">No transactions yet</AlertTitle>
              <AlertDescription fontSize="12px">
                Your transaction history will appear here once you make a payment or top up your wallet.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Top-up/Withdrawal Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {topupAmount !== undefined ? 'Add Money to Wallet' : 'Withdraw from Wallet'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box width="100%">
                <Text fontSize="14px" fontWeight="600" mb={2}>
                  Amount (₦)
                </Text>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topupAmount !== undefined ? topupAmount : withdrawAmount}
                  onChange={(e) => {
                    if (topupAmount !== undefined) {
                      setTopupAmount(e.target.value);
                    } else {
                      setWithdrawAmount(e.target.value);
                    }
                  }}
                  min="100"
                  step="100"
                />
                <Text fontSize="12px" color="gray.600" mt={1}>
                  Minimum amount: ₦100
                </Text>
              </Box>

              {topupAmount !== undefined && (
                <Alert status="info" borderRadius="8px">
                  <AlertIcon />
                  <AlertDescription fontSize="12px">
                    You will be redirected to a secure payment page to complete your top-up.
                  </AlertDescription>
                </Alert>
              )}

              <HStack spacing={3} width="100%">
                <Button
                  flex={1}
                  onClick={onClose}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  bg="brand.primary"
                  color="white"
                  _hover={{ bg: "brand.primaryDark" }}
                  onClick={topupAmount !== undefined ? handleTopup : handleWithdraw}
                  isLoading={isProcessing}
                  loadingText={topupAmount !== undefined ? 'Processing...' : 'Withdrawing...'}
                >
                  {topupAmount !== undefined ? 'Continue to Payment' : 'Request Withdrawal'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WalletSection;

"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  Spinner,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { ArrowBackIcon, SearchIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiArrowUpRight, FiArrowDownLeft, FiFilter } from "react-icons/fi";

export default function TransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: api.getWalletTransactions,
    refetchInterval: 30000,
  });

  const allTransactions = (transactions as any)?.data || [];

  // Filter transactions
  const filteredTransactions = allTransactions.filter((transaction: any) => {
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesSearch = searchQuery === "" || 
      transaction.amount.toString().includes(searchQuery) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate totals
  const totalCredit = allTransactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  
  const totalDebit = allTransactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.600" />
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
            <Text fontSize="xl" fontWeight="700" color="gray.900">
              Transaction History
            </Text>
            <Text fontSize="sm" color="gray.500" fontWeight="400">
              View all your wallet transactions
            </Text>
          </VStack>
        </HStack>

        {/* Summary Cards */}
        <HStack spacing={3} mt={4}>
          <Box
            flex={1}
            bg="green.50"
            borderRadius="12px"
            p={4}
            border="1px solid"
            borderColor="green.200"
          >
            <HStack spacing={2} mb={1}>
              <Icon as={FiArrowUpRight} color="green.600" boxSize={4} />
              <Text fontSize="xs" color="green.700" fontWeight="600">
                Total Credit
              </Text>
            </HStack>
            <Text fontSize="xl" fontWeight="800" color="green.700">
              ₦{totalCredit.toLocaleString()}
            </Text>
          </Box>

          <Box
            flex={1}
            bg="red.50"
            borderRadius="12px"
            p={4}
            border="1px solid"
            borderColor="red.200"
          >
            <HStack spacing={2} mb={1}>
              <Icon as={FiArrowDownLeft} color="red.600" boxSize={4} />
              <Text fontSize="xs" color="red.700" fontWeight="600">
                Total Debit
              </Text>
            </HStack>
            <Text fontSize="xl" fontWeight="800" color="red.700">
              ₦{totalDebit.toLocaleString()}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Filters */}
      <Box px={6} mt={4}>
        <VStack spacing={3} align="stretch">
          {/* Search */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              borderRadius="10px"
            />
          </InputGroup>

          {/* Filter Tabs */}
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={filterType === "all" ? "solid" : "outline"}
              colorScheme={filterType === "all" ? "purple" : "gray"}
              onClick={() => setFilterType("all")}
              borderRadius="8px"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === "credit" ? "solid" : "outline"}
              colorScheme={filterType === "credit" ? "green" : "gray"}
              onClick={() => setFilterType("credit")}
              borderRadius="8px"
            >
              Credits
            </Button>
            <Button
              size="sm"
              variant={filterType === "debit" ? "solid" : "outline"}
              colorScheme={filterType === "debit" ? "red" : "gray"}
              onClick={() => setFilterType("debit")}
              borderRadius="8px"
            >
              Debits
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Transactions List */}
      <Box px={6} mt={4}>
        {filteredTransactions.length === 0 ? (
          <Box
            bg="white"
            borderRadius="16px"
            p={10}
            textAlign="center"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="lg" fontWeight="600" color="gray.600" mb={2}>
              No transactions found
            </Text>
            <Text fontSize="sm" color="gray.500">
              {searchQuery ? "Try a different search term" : "Your transactions will appear here"}
            </Text>
          </Box>
        ) : (
          <VStack spacing={2} align="stretch">
            {filteredTransactions.map((transaction: any, index: number) => (
              <Box
                key={index}
                bg="white"
                borderRadius="12px"
                p={4}
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.300", bg: "gray.50" }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Flex
                      w={12}
                      h={12}
                      bg={transaction.type === 'debit' ? 'red.50' : 'green.50'}
                      borderRadius="12px"
                      align="center"
                      justify="center"
                    >
                      <Icon
                        as={transaction.type === 'debit' ? FiArrowDownLeft : FiArrowUpRight}
                        boxSize={6}
                        color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                      />
                    </Flex>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="700" color="gray.900">
                          {transaction.type === 'debit' ? 'Payment' : 'Wallet Top-up'}
                        </Text>
                        <Badge
                          colorScheme={transaction.type === 'debit' ? 'red' : 'green'}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          {transaction.type}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Text>
                      {transaction.paymentTransactionId && (
                        <Text fontSize="xs" color="gray.400" fontFamily="mono">
                          Ref: {transaction.paymentTransactionId.slice(-8)}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text
                      fontSize="lg"
                      fontWeight="800"
                      color={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                    >
                      {transaction.type === 'debit' ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

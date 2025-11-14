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

  // Handle both response formats: direct array or wrapped in data field
  const allTransactions = Array.isArray(transactions) 
    ? transactions 
    : (Array.isArray((transactions as any)?.data) ? (transactions as any).data : []);

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

  // Debug logging
  console.log('Transactions raw data:', transactions);
  console.log('All transactions processed:', allTransactions);
  console.log('Total transactions:', allTransactions.length);

  if (isLoading) {
    return (
      <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.600" thickness="4px" />
          <Text color="gray.600" fontWeight="600">Loading transactions...</Text>
        </VStack>
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
        
        <HStack spacing={4} mb={4} position="relative" zIndex={1}>
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
            <Text fontSize="xl" fontWeight="800" color="white">
              Transaction History
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900" fontWeight="500">
              View all your wallet transactions
            </Text>
          </VStack>
        </HStack>

        {/* Summary Cards */}
        <HStack spacing={3} mt={4} position="relative" zIndex={1}>
          <Box
            flex={1}
            bg="whiteAlpha.300"
            backdropFilter="blur(10px)"
            borderRadius="16px"
            p={4}
            border="1px solid"
            borderColor="whiteAlpha.400"
          >
            <HStack spacing={2} mb={2}>
              <Icon as={FiArrowUpRight} color="white" boxSize={5} />
              <Text fontSize="xs" color="whiteAlpha.900" fontWeight="700">
                TOTAL CREDIT
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color="white">
              ₦{totalCredit.toLocaleString()}
            </Text>
          </Box>

          <Box
            flex={1}
            bg="whiteAlpha.300"
            backdropFilter="blur(10px)"
            borderRadius="16px"
            p={4}
            border="1px solid"
            borderColor="whiteAlpha.400"
          >
            <HStack spacing={2} mb={2}>
              <Icon as={FiArrowDownLeft} color="white" boxSize={5} />
              <Text fontSize="xs" color="whiteAlpha.900" fontWeight="700">
                TOTAL DEBIT
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="900" color="white">
              ₦{totalDebit.toLocaleString()}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Filters */}
      <Box px={6} mt={-2}>
        <VStack spacing={3} align="stretch">
          {/* Search */}
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none" h="full">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="gray.50"
              border="none"
              borderRadius="16px"
              fontSize="md"
              _focus={{ bg: "white", boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }}
            />
          </InputGroup>

          {/* Filter Tabs */}
          <HStack spacing={2}>
            <Button
              size="md"
              bg={filterType === "all" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "white"}
              color={filterType === "all" ? "white" : "gray.700"}
              onClick={() => setFilterType("all")}
              borderRadius="12px"
              fontWeight="700"
              border={filterType === "all" ? "none" : "2px solid"}
              borderColor="gray.200"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              All
            </Button>
            <Button
              size="md"
              bg={filterType === "credit" ? "green.500" : "white"}
              color={filterType === "credit" ? "white" : "gray.700"}
              onClick={() => setFilterType("credit")}
              borderRadius="12px"
              fontWeight="700"
              border={filterType === "credit" ? "none" : "2px solid"}
              borderColor="gray.200"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              Credits
            </Button>
            <Button
              size="md"
              bg={filterType === "debit" ? "red.500" : "white"}
              color={filterType === "debit" ? "white" : "gray.700"}
              onClick={() => setFilterType("debit")}
              borderRadius="12px"
              fontWeight="700"
              border={filterType === "debit" ? "none" : "2px solid"}
              borderColor="gray.200"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
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
            borderRadius="20px"
            p={12}
            textAlign="center"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
          >
            <Box
              bg="gray.100"
              borderRadius="full"
              w="100px"
              h="100px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={4}
            >
              <Text fontSize="4xl">📊</Text>
            </Box>
            <Text fontSize="xl" fontWeight="800" color="gray.900" mb={2}>
              No transactions found
            </Text>
            <Text fontSize="md" color="gray.500">
              {searchQuery ? "Try a different search term" : "Your transactions will appear here"}
            </Text>
          </Box>
        ) : (
          <VStack spacing={2} align="stretch">
            {filteredTransactions.map((transaction: any, index: number) => (
              <Box
                key={index}
                bg="white"
                borderRadius="20px"
                p={5}
                boxShadow="0 2px 12px rgba(0, 0, 0, 0.06)"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
                transition="all 0.3s"
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Flex
                      w={14}
                      h={14}
                      bg={transaction.type === 'debit' ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'}
                      borderRadius="16px"
                      align="center"
                      justify="center"
                      boxShadow={transaction.type === 'debit' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.2)'}
                    >
                      <Icon
                        as={transaction.type === 'debit' ? FiArrowDownLeft : FiArrowUpRight}
                        boxSize={7}
                        color={transaction.type === 'debit' ? 'red.600' : 'green.600'}
                      />
                    </Flex>
                    <VStack align="start" spacing={1.5}>
                      <HStack spacing={2}>
                        <Text fontSize="md" fontWeight="800" color="gray.900">
                          {transaction.type === 'debit' ? 'Payment' : 'Wallet Top-up'}
                        </Text>
                        <Badge
                          bg={transaction.type === 'debit' ? 'red.500' : 'green.500'}
                          color="white"
                          fontSize="xs"
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          fontWeight="700"
                        >
                          {transaction.type}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Text>
                      {transaction.paymentTransactionId && (
                        <Text fontSize="xs" color="gray.400" fontFamily="mono" fontWeight="600">
                          Ref: {transaction.paymentTransactionId.slice(-8)}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text
                      fontSize="xl"
                      fontWeight="900"
                      color={transaction.type === 'debit' ? 'red.600' : 'green.600'}
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

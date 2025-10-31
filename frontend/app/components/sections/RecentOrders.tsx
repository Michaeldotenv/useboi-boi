"use client"
import { Container, HStack, Text, Button, SimpleGrid, Box, Badge, chakra } from "@chakra-ui/react";
import Card from "../Card";

type Order = { id: string; status: string; createdAt?: string; vendorName?: string };

type Props = {
  orders: Order[];
};

export default function RecentOrders({ orders }: Props) {
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 5, md: 10 }}>
      <HStack justify="space-between" mb={3}>
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800}>Your recent orders</Text>
        <Button as={chakra.a} href="/dashboard/orders" variant="link" colorScheme="purple">View all</Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {(orders.length ? orders : Array.from({ length: 3 })).map((o: any, idx: number) => (
          <Card key={idx} variant="elevated" p={4}>
            {o ? (
              <>
                <HStack justify="space-between">
                  <Text fontWeight={700}>
                    {o.vendorName || 'Order'} 
                    <chakra.span color="gray.500" fontSize="xs"> • {o.status}</chakra.span>
                  </Text>
                  <Badge>#{o.id?.slice?.(0,6) || '•••'}</Badge>
                </HStack>
                <Text mt={1} color="gray.600" fontSize="sm">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
                </Text>
              </>
            ) : (
              <Box h="64px" bg="gray.100" />
            )}
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
"use client"
import { Box, Container, HStack, VStack, Text, Button } from "@chakra-ui/react";

type Props = {
  coords: { lat: number; lng: number } | null;
  setCoords: (coords: { lat: number; lng: number }) => void;
};

export default function LocationSelector({ coords, setCoords }: Props) {
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <HStack justify="space-between">
        <HStack>
          <Box p={2} bg="purple.50" borderRadius="lg">📍</Box>
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color="gray.500">Delivering to</Text>
            <Text fontWeight={600}>{coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : 'Use current location'}</Text>
          </VStack>
        </HStack>
        <Button size="sm" onClick={() => navigator.geolocation?.getCurrentPosition((pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }))}>
          {coords ? 'Update location' : 'Use my location'}
        </Button>
      </HStack>
    </Container>
  );
}
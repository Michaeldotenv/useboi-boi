"use client"
import { Box, Container, HStack, VStack, Text, Button, Icon } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FiMapPin } from "react-icons/fi"

const MotionBox = motion(Box)
const MotionButton = motion(Button)

type Props = {
  coords: { lat: number; lng: number } | null
  setCoords: (coords: { lat: number; lng: number }) => void
}

export default function LocationSelector({ coords, setCoords }: Props) {
  return (
    <Container maxW="container.xl" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <HStack
          justify="space-between"
          bg="white"
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          boxShadow="0 4px 20px rgba(124, 58, 237, 0.08)"
          border="1px solid"
          borderColor="purple.100"
          transition="all 0.3s ease"
          _hover={{
            boxShadow: "0 8px 30px rgba(124, 58, 237, 0.12)",
            borderColor: "purple.200",
          }}
        >
          <HStack spacing={{ base: 3, md: 4 }}>
            <MotionBox
              p={3}
              bg="linear-gradient(135deg, purple.500, fuchsia.500)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={FiMapPin} color="white" w={5} h={5} />
            </MotionBox>
            <VStack spacing={0} align="start">
              <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
                Delivering to
              </Text>
              <Text fontWeight="700" fontSize={{ base: "md", md: "lg" }} color="gray.900">
                {coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : "Use current location"}
              </Text>
            </VStack>
          </HStack>

          <MotionButton
            size="md"
            bg="linear-gradient(135deg, purple.600, fuchsia.500)"
            color="white"
            fontWeight="600"
            borderRadius="xl"
            px={6}
            py={3}
            h="48px"
            boxShadow="0 4px 15px rgba(124, 58, 237, 0.3)"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px rgba(124, 58, 237, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            _hover={{
              bg: "linear-gradient(135deg, purple.700, fuchsia.600)",
            }}
            onClick={() =>
              navigator.geolocation?.getCurrentPosition((pos) =>
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              )
            }
          >
            {coords ? "Update location" : "Use my location"}
          </MotionButton>
        </HStack>
      </MotionBox>
    </Container>
  )
}

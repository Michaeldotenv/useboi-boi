"use client";

import { 
  AddIcon, 
  ArrowBackIcon, 
  MinusIcon,
  StarIcon 
} from "@chakra-ui/icons";
import { 
  Box, 
  Button, 
  Checkbox, 
  Flex, 
  HStack, 
  Input, 
  Radio, 
  RadioGroup, 
  Text,
  Image,
  Badge,
  Divider,
  IconButton,
  VStack
} from "@chakra-ui/react";
import { GoHeart, GoShareAndroid } from "react-icons/go";
import { PiDotsThreeVertical } from "react-icons/pi";
import Wrapper from "../components/Wrapper";
import Card from "../components/Card";
import Navigation from "../components/Navigation";
import { useState } from "react";

function AddToCart() {
  const [value, setValue] = useState(1);
  const [selectedSize, setSelectedSize] = useState("8");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const handleIncrement = () => setValue((prev) => prev + 1);
  const handleDecrement = () => setValue((prev) => (prev > 1 ? prev - 1 : 1));

  const handleExtraToggle = (extra: string) => {
    setSelectedExtras(prev => 
      prev.includes(extra) 
        ? prev.filter(item => item !== extra)
        : [...prev, extra]
    );
  };

  const getTotalPrice = () => {
    const basePrice = selectedSize === "8" ? 10 : selectedSize === "10" ? 12 : 16;
    const extrasPrice = selectedExtras.length * 10;
    return (basePrice + extrasPrice) * value;
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <Box position="relative" w="100%" h="300px">
        <Image
          src="/Food-item-6.jpg"
          alt="Chicken Fajita Pizza"
          w="100%"
          h="100%"
          objectFit="cover"
        />
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          w="100%" 
          h="100%" 
          bg="blackAlpha.600" 
          pointerEvents="none"
        />

        {/* Header Actions */}
        <Flex 
          justifyContent="space-between" 
          position="absolute" 
          top={4} 
          left={4} 
          right={4}
          zIndex={2}
        >
          <IconButton
            aria-label="Go back"
            icon={<ArrowBackIcon />}
            variant="ghost"
            color="white"
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
            onClick={() => window.history.back()}
            _hover={{ bg: "blackAlpha.400" }}
          />

          <HStack spacing={2}>
            <IconButton
              aria-label="Add to favorites"
              icon={<GoHeart />}
              variant="ghost"
              color="white"
              bg="blackAlpha.300"
              backdropFilter="blur(10px)"
              _hover={{ bg: "blackAlpha.400" }}
            />
            <IconButton
              aria-label="Share"
              icon={<GoShareAndroid />}
              variant="ghost"
              color="white"
              bg="blackAlpha.300"
              backdropFilter="blur(10px)"
              _hover={{ bg: "blackAlpha.400" }}
            />
            <IconButton
              aria-label="More options"
              icon={<PiDotsThreeVertical />}
              variant="ghost"
              color="white"
              bg="blackAlpha.300"
              backdropFilter="blur(10px)"
              _hover={{ bg: "blackAlpha.400" }}
            />
          </HStack>
        </Flex>

        {/* Product Info */}
        <VStack 
          position="absolute" 
          bottom={6} 
          left={6} 
          align="start"
          spacing={2}
        >
          <Text 
            color="white" 
            fontSize="2xl" 
            fontWeight="700"
            textShadow="0 2px 4px rgba(0,0,0,0.5)"
          >
            Chicken Fajita Pizza
          </Text>
          
          <HStack spacing={4}>
            <Text 
              color="whiteAlpha.900" 
              fontSize="md" 
              fontWeight="500"
              textShadow="0 1px 2px rgba(0,0,0,0.5)"
            >
              Daily Deli - Johar Town
            </Text>
            
            <HStack spacing={1}>
              <StarIcon color="yellow.400" boxSize={4} />
              <Text color="whiteAlpha.900" fontSize="sm" fontWeight="500">
                4.8 (124 reviews)
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <Wrapper variant="section">
        {/* Size Selection */}
        <Card mb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="700" variant="heading">
              Size
            </Text>
            <Badge colorScheme="blue" variant="subtle">
              Required
            </Badge>
          </Flex>

          <RadioGroup value={selectedSize} onChange={setSelectedSize}>
            <VStack spacing={3} align="stretch">
              {[
                { size: "8", price: 10, description: "Personal size" },
                { size: "10", price: 12, description: "Medium size" },
                { size: "12", price: 16, description: "Large size" }
              ].map((option) => (
                <Flex 
                  key={option.size}
                  justifyContent="space-between" 
                  alignItems="center"
                  p={4}
                  border="2px solid"
                  borderColor={selectedSize === option.size ? "brand.primary" : "gray.200"}
                  borderRadius="12px"
                  bg={selectedSize === option.size ? "brand.primary" : "white"}
                  color={selectedSize === option.size ? "white" : "text.primary"}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: "brand.primary",
                    transform: "translateY(-1px)",
                  }}
                  onClick={() => setSelectedSize(option.size)}
                >
                  <HStack spacing={3}>
                    <Radio 
                      value={option.size} 
                      colorScheme={selectedSize === option.size ? "white" : "brand"}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600">
                        {option.size}"
                      </Text>
                      <Text fontSize="sm" opacity={0.8}>
                        {option.description}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="700" fontSize="lg">
                    ${option.price}
                  </Text>
                </Flex>
              ))}
            </VStack>
          </RadioGroup>
        </Card>

        {/* Quantity Selection */}
        <Card mb={6}>
          <Text fontSize="xl" fontWeight="700" variant="heading" mb={4}>
            Quantity
          </Text>
          
          <Flex 
            align="center" 
            justify="space-between" 
            w="full" 
            h="60px" 
            border="2px solid" 
            borderColor="gray.200"
            borderRadius="16px" 
            p={4}
            bg="gray.50"
          >
            <IconButton
              aria-label="Decrease quantity"
              icon={<MinusIcon />}
              size="sm"
              variant="ghost"
              onClick={handleDecrement}
              isDisabled={value <= 1}
              color="gray.600"
            />
            <Text fontWeight="700" fontSize="lg" color="text.primary">
              {value}
            </Text>
            <IconButton
              aria-label="Increase quantity"
              icon={<AddIcon />}
              size="sm"
              variant="ghost"
              onClick={handleIncrement}
              color="gray.600"
            />
          </Flex>
        </Card>

        {/* Extra Options */}
        <Card mb={6}>
          <Text fontSize="xl" fontWeight="700" variant="heading" mb={4}>
            Extra Add-ons
          </Text>
          <Text fontSize="md" color="text.secondary" mb={4}>
            Customize your order with these delicious extras
          </Text>

          <VStack spacing={3} align="stretch">
            {[
              { name: "Texas Barbeque", price: 10 },
              { name: "Char Donay", price: 10 },
              { name: "Extra Cheese", price: 8 },
              { name: "Spicy Jalapeños", price: 6 }
            ].map((extra) => (
              <Flex 
                key={extra.name}
                justifyContent="space-between" 
                alignItems="center"
                p={4}
                border="2px solid"
                borderColor={selectedExtras.includes(extra.name) ? "brand.primary" : "gray.200"}
                borderRadius="12px"
                bg={selectedExtras.includes(extra.name) ? "brand.primary" : "white"}
                color={selectedExtras.includes(extra.name) ? "white" : "text.primary"}
                cursor="pointer"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: "brand.primary",
                  transform: "translateY(-1px)",
                }}
                onClick={() => handleExtraToggle(extra.name)}
              >
                <HStack spacing={3}>
                  <Checkbox 
                    isChecked={selectedExtras.includes(extra.name)}
                    colorScheme={selectedExtras.includes(extra.name) ? "white" : "brand"}
                  />
                  <Text fontWeight="600">
                    {extra.name}
                  </Text>
                </HStack>
                <Text fontWeight="700" fontSize="lg">
                  +${extra.price}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Card>

        {/* Special Instructions */}
        <Card mb={6}>
          <Text fontSize="xl" fontWeight="700" variant="heading" mb={2}>
            Special Instructions
          </Text>
          <Text fontSize="md" color="text.secondary" mb={4}>
            Let us know if you have specific preferences or dietary requirements
          </Text>
          <Input 
            placeholder="e.g. less spices, no mayo, extra crispy, etc." 
            variant="filled"
            size="lg"
            h="60px"
          />
        </Card>

        {/* Order Summary & CTA */}
        <Card variant="elevated">
          <Flex justifyContent="space-between" alignItems="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="700" color="text.primary">
                ${getTotalPrice()}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Total for {value} item{value > 1 ? 's' : ''}
              </Text>
            </VStack>
            
            <Button
              variant="primary"
              size="lg"
              px={12}
              py={6}
              fontSize="lg"
              fontWeight="700"
              onClick={() => window.location.href = "/cart"}
              rightIcon={<AddIcon />}
            >
              Add to Cart
            </Button>
          </Flex>
        </Card>
      </Wrapper>
      </>
   )
}

export default AddToCart;
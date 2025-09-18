"use client";
import { Box, Icon, Badge, Wrap, Image, Flex, Text, VStack, IconButton, HStack, Input, InputRightElement, InputGroup, Button } from "@chakra-ui/react";
import { FaShoppingCart } from "react-icons/fa";
import Wrapper from "../components/Wrapper";
import { AddIcon, ArrowBackIcon, ArrowForwardIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { GoHeart } from "react-icons/go";


const CartWithBadge = () => {
  const router =  useRouter();

   const cards = [
    { id: 1, title: "Pizza Party", content: "Enjoy pizza from Johnny and get upto 30% off.", image: "Food-item-1.jpeg", pricetag: "Starting from", price: "$10" },
    { id: 2, title: "Pizza Party", content: "Enjoy pizza from Johnny and get upto 30% off.", image: "Food-item-1.jpeg", pricetag: "Starting from", price: "$20" },
    { id: 3, title: "Pizza Party", content: "Enjoy pizza from Johnny and get upto 30% off.", image: "Food-item-1.jpeg", pricetag: "Starting from", price: "$30" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  
    const carouselRef = useRef<HTMLDivElement>(null);
    let touchStartX = 0;
  
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
  
    const handleTouchMove = (e: React.TouchEvent) => {
      const touchEndX = e.touches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (diff > 50) {
        setActiveIndex((prev) => (prev + 1) % cards.length);
      } else if (diff < -50) {
        setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
      }
    };

  return (
   <Wrapper>
      <Box my={"3em"}>
         <Flex gap={"5"}>
            <ArrowBackIcon mt={".2em"} width={"22px"} height={"22px"} color={"#000"} onClick={() => location.replace("/add-to-cart")} cursor={"pointer"}/>
            <Text fontSize={"20px"} fontWeight={"700"}>Cart</Text>
         </Flex>
      </Box>

      <Flex width={"100%"} mx={"auto"} mt={"2em"} gap={"4"}>
         <Box position="relative" display="inline-block">
            <Image src="/Food-item-6.jpg" alt="food image" width={"64px"} height={"64px"} borderRadius={"16px"}/>
            <Badge position="absolute" top="-2" right="-2" bg="#000" color="white" borderRadius="50%" fontSize="12px" px={"7px"}>1</Badge>
         </Box>

         <Box mt={"-4px"}>
            <Text fontSize="17px" fontWeight="400" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Chicken Fajita Pizza</Text>
            <Text fontSize="15px" fontWeight="400" mb={2} color={"rgba(142, 142, 147, 1)"} lineHeight={"20px"} letterSpacing={"-0.24px"}>10” • Char Donay</Text>
            <Text fontSize="15px" fontWeight="700" mb={2} color={"#000"} lineHeight={"20px"} letterSpacing={"-0.24px"}>$20</Text>
         </Box>

         <Box ml={"3em"} mt={"15"}>
            <Icon as={SmallCloseIcon} boxSize={5} color={"#fff"} bg={"rgba(142, 142, 147, 1)"} fontSize={"4px"} fontWeight={"400"} borderRadius={"50%"}/>
         </Box>
      </Flex>

      <Flex width={"100%"} mx={"auto"} mt={"2em"} gap={"4"}>
         <Box position="relative" display="inline-block">
            <Image src="/Food-item-6.jpg" alt="food image" width={"64px"} height={"64px"} borderRadius={"16px"}/>
            <Badge position="absolute" top="-2" right="-2" bg="#000" color="white" borderRadius="50%" fontSize="12px" px={"7px"}>3</Badge>
         </Box>

         <Box mt={"-4px"}>
            <Text fontSize="17px" fontWeight="400" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Chicken Fajita Pizza</Text>
            <Text fontSize="15px" fontWeight="400" mb={2} color={"rgba(142, 142, 147, 1)"} lineHeight={"20px"} letterSpacing={"-0.24px"}>10” • Char Donay</Text>
            <Text fontSize="15px" fontWeight="700" mb={2} color={"#000"} lineHeight={"20px"} letterSpacing={"-0.24px"}>$30</Text>
         </Box>

         <Box ml={"3em"} mt={"15"}>
            <Icon as={SmallCloseIcon} boxSize={5} color={"#fff"} bg={"rgba(142, 142, 147, 1)"} fontSize={"4px"} fontWeight={"400"} borderRadius={"50%"}/>
         </Box>
      </Flex>

      <Box my={'2em'}>
         <Flex justifyContent={"space-between"} mb={"1em"}>
            <Text fontSize="18px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Popular with these</Text>
         </Flex>
         <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
            <Flex ref={carouselRef} overflow="hidden" w="100%" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
               <motion.div style={{ display: "flex", width: "100%" }} animate={{ x: `-${activeIndex * 100}%` }} transition={{ type: "spring", stiffness: 100 }}>
               {cards.map((card) => (
               <Box key={card.id} flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-2.jpg"} bgSize="cover" bgPosition="center">
                  <Text fontSize="12px" fontWeight="700" position={"absolute"} left={"3"} bottom="3" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"8px"} py={"4px"}>$18</Text>
                  <Box borderRadius={"50%"} position="absolute" top={2} right={2} color={"rgba(255, 255, 255, 1)"} opacity={1} p={2}>
                     <Icon aria-label="Like" as={GoHeart} color={"white"}  opacity={1} size={"12px"}/>
                  </Box>
               </Box>
               ))}
               </motion.div>
            </Flex>
         </Box>
         <Flex justifyContent={"space-between"} mt={"1em"}>
            <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Popperoni Pizza</Text>
            <Icon as={AddIcon} width={"18px"} height={"18px"}/>
         </Flex>
         <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Daily Deli</Text>
      </Box>

      <Box mt={"3em"} mb={"1em"}>
         <Text fontSize="18px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>Coupon</Text>
         <InputGroup>
         <Input placeholder="GREELOGIX" borderRadius={"16px"} border={"2px solid rgba(242, 242, 247, 1)"} height={"54px"} mt={".5em"}/>
         <InputRightElement>{<ArrowForwardIcon width={"22px"} height={"22px"} mt={"1.5em"} mr={"2em"}/>}</InputRightElement>
         </InputGroup>
      </Box>

      <Flex justifyContent={"space-between"} width={"100%"} mx={"auto"} mt={"2em"}>
         <Text fontSize="20px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>Variation</Text>
         <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"} color={"brand.primary"}>$50</Text>
      </Flex>
      
      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>Delivery Fee</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(142, 142, 147, 1)"}>$10</Text>
         </Box>
      </Flex>

      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>VAT</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(142, 142, 147, 1)"}>$10</Text>
         </Box>
      </Flex>

      <Flex justifyContent={"space-between"} borderBottom={"2px solid rgba(242, 242, 247, 1)"} width={"100%"}>
         <Box my={"1em"}>
            <Text fontWeight={"400"} fontSize={"17px"}>Coupon</Text>
         </Box>
      
         <Box>
            <Text my={"1em"} color={"rgba(52, 199, 89, 1)"}>-$4</Text>
         </Box>
      </Flex>

      <Flex justifyContent={"space-between"} alignItems={"center"} mt={"4em"} mb={"1em"}>
         <Text fontSize="28px" fontWeight="700" mb={2} lineHeight={"24px"} letterSpacing={"0.75px"}>$20</Text>
         <Button fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"} color={"#fff"} variant={"primary"} bg={"brand.primary"} borderRadius={"16px"} py={"28px"} px={"24px"} onClick={() => location.replace("/check-out")}>Go to Checkout</Button>
      </Flex>  
    </Wrapper>
  );
};

export default CartWithBadge;

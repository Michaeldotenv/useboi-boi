"use client";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Grid, HStack, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react";
import { FaHome, FaBox, FaUser, FaCompass, FaBookmark, FaBell } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import Wrapper from "../components/Wrapper";
import { SlLocationPin } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
// import { FaChevronLeft, FaChevronRight, FaCheckCircle } from "react-icons/fa";
import { GoHeart, GoHeartFill, GoPerson } from "react-icons/go";
import { GrNotification } from "react-icons/gr";

function BoiboiWebApp() {
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

  const [activeTab, setActiveTab] = useState("explore");

  const renderContent = () => {
    switch (activeTab) {
      case "explore":
        
        return <><Box bgColor={"#5234E5"} bgImage={"/Pattern.png"} bgSize={"cover"} position={"relative"} bgPosition={"center"} bgRepeat={"no-repeat"} w={"100%"} h={"168px"}/>
        <Wrapper>
          <Flex justifyContent={'center'}>  
            <Box position={"absolute"} top={"50px"}>
              <HStack>
                <SlLocationPin color={"#fff"} fontSize={"20px"}/>
                <Text fontSize={"17px"} fontWeight={"400"} lineHeight={"22px"} letterSpacing={"-0.41px"} color={"#fff"}>Block B Phase 2 Johar Town, Lahore</Text>
              </HStack>

              <InputGroup>
                <InputLeftElement pointerEvents="none">{<SearchIcon mt={"3.1em"} ml={"24px"} width={"22px"} h={"22px"} fontWeight={"300"} color={"#AEAEB2"}/>}</InputLeftElement>
                <Input placeholder="Search..." my={"1em"} width={"100%"} fontSize={"17px"} bg={"#fff"} fontWeight={"400"} h={"54px"} borderRadius={"16px"} color={"#AEAEB2"}/>
              </InputGroup>
            </Box>

            <Box position={"relative"} w="100%" h="200px" mt={"2em"}>
              <Box as="img" src={"Food-item-1.jpeg"} alt={"Food Item"} objectFit={"cover"} borderRadius={"16px"} w="100%" h="100%"/>
              <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="black" borderRadius={"16px"} opacity={0.3} pointerEvents="none"/>
              <Text position="absolute" bottom="30" left="30" transform="translate(-50%, -50%)" color="white" fontSize={"18px"} fontWeight={"400"} lineHeight={"22px"} letterSpacing={"-0.41px"}>Food</Text>
              <Text position="absolute" bottom="15" left="30" transform="translate(-18%, -18%)" color="white" fontSize={"13px"} fontWeight={"400"} lineHeight={"16px"}>Order food you love</Text>
            </Box>          
          </Flex>

          <Flex justifyContent={"space-between"} w="100%" gap={4}>
            <Box position={"relative"} w="50%" h="180px" my={"2em"}>
              <Box as="img" src={"Food-item-1.jpeg"} alt={"Food Item"} objectFit={"cover"} borderRadius={"16px"} w="100%" h="100%"/>
              <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="black"  borderRadius={"16px"}opacity={0.3} pointerEvents="none"/>
              <Text position="absolute" bottom="30" left="30" transform="translate(-50%, -50%)" color="white" fontSize={"18px"} fontWeight={"400"} lineHeight={"22px"} letterSpacing={"-0.41px"}>Food</Text>
              <Text position="absolute" bottom="15" left="30" transform="translate(-18%, -18%)" color="white" fontSize={"13px"} fontWeight={"400"} lineHeight={"16px"}>Order food you love</Text>
            </Box>

            <Box position={"relative"} w="50%" h="180px" my={"2em"}>
              <Box as="img" src={"Food-item-1.jpeg"} alt={"Food Item"} objectFit={"cover"} borderRadius={"16px"} w="100%" h="100%"/>
              <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="black"  borderRadius={"16px"} opacity={0.3} pointerEvents="none"/>
              <Text position="absolute" bottom="30" left="30" transform="translate(-50%, -50%)" color="white" fontSize={"18px"} fontWeight={"400"} lineHeight={"22px"} letterSpacing={"-0.41px"}>Food</Text>
              <Text position="absolute" bottom="15" left="30" transform="translate(-18%, -18%)" color="white" fontSize={"13px"} fontWeight={"400"} lineHeight={"16px"}>Order food you love</Text>
            </Box>
          </Flex>

          <Flex justifyContent={"space-between"} w="100%" gap={4} mb={"4em"}>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Flex ref={carouselRef} overflow="hidden" w="100%" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
                <motion.div style={{ display: "flex", width: "100%" }} animate={{ x: `-${activeIndex * 100}%` }} transition={{ type: "spring", stiffness: 100 }}>
                {cards.map((card) => (
                <Box key={card.id} flex="0 0 100%" p={10} w="100%" h="100%" borderRadius="16px" bgImage={"Food-item-1.jpeg"} bgSize="cover" bgPosition="center">
                  <Flex justifyContent={"space-between"}>
                    <VStack align="start">
                      <Text fontSize="xl" fontWeight="bold" color={"#fff"}>{card.title}</Text>
                      <Text mt={1} maxW={"200px"} textAlign={"left"}>{card.content}</Text>
                      <Text mt={1}>{card.pricetag}</Text>
                      <Text mt={1}>{card.price}</Text>
                    </VStack>
                  </Flex>
                </Box>
                ))}
                </motion.div>
              </Flex>
            </Box>  
          </Flex>  

          <RadioGroup value={String(activeIndex)} onChange={(value) => setActiveIndex(Number(value))} mb={"2em"}>
            <Flex justify="center" gap={4}>
              {cards.map((_, index) => (
              <Radio key={index} value={String(index)} colorScheme="blue" />
              ))}
            </Flex>
          </RadioGroup>

          <Box mb={'2em'} cursor={"pointer"} onClick={() => router.push("/order-details")}>
            <Flex justifyContent={"space-between"} mb={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Deals</Text>
              <ArrowForwardIcon width={"22px"} h={"22px"}/>
            </Flex>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Flex ref={carouselRef} overflow="hidden" w="100%" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
                <motion.div style={{ display: "flex", width: "100%" }} animate={{ x: `-${activeIndex * 100}%` }} transition={{ type: "spring", stiffness: 100 }}>
                {cards.map((card) => (
                  <Box key={card.id} flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-2.jpg"} bgSize="cover" bgPosition="center">
                    <Text fontSize="17px" fontWeight="700" position={"absolute"} left={"5"} bottom="5" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"12px"} py={"4px"}>40 min</Text>
                    <IconButton aria-label="Like" icon={<GoHeart/>} color={"white"} borderRadius={"50%"} opacity={0.1} position="absolute" top={2} right={2}/>
                  </Box>
                ))}
                </motion.div>
              </Flex>
            </Box>
            <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Daily Deli</Text>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"}/>
                <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>4.8</Text>
              </HStack>
            </Flex>
            <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Johar Town</Text>
          </Box>
          

          <Box mb={'2em'}>
            <Flex justifyContent={"space-between"} mb={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Explore More</Text>
            </Flex>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Box flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-3.jpg"} bgSize="cover" bgPosition="center">
                <Text fontSize="17px" fontWeight="700" position={"absolute"} left={"5"} bottom="5" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"12px"} py={"4px"}>40 min</Text>
                <IconButton aria-label="Like" icon={<GoHeart/>} color={"white"} borderRadius={"50%"} opacity={0.1} position="absolute" top={2} right={2}/>
              </Box>
            </Box>
            <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Thicc Shakes</Text>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"}/>
                <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>4.8</Text>
              </HStack>
            </Flex>
            <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Wapda Town</Text>
          </Box>

          <Box mb={'2em'}>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Box flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-4.jpg"} bgSize="cover" bgPosition="center">
                <Text fontSize="17px" fontWeight="700" position={"absolute"} left={"5"} bottom="5" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"12px"} py={"4px"}>20 min</Text>
                <IconButton aria-label="Like" icon={<GoHeart/>} color={"white"} borderRadius={"50%"} opacity={0.1} position="absolute" top={2} right={2}/>
              </Box>
            </Box>
            <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Jean’s Cakes</Text>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"}/>
                <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>4.8</Text>
              </HStack>
            </Flex>
            <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Johar Town</Text>
          </Box>

          <Box mb={'10em'}>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Box flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-5.jpg"} bgSize="cover" bgPosition="center">   
                <Text fontSize="17px" fontWeight="700" position={"absolute"} left={"5"} bottom="5" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"12px"} py={"4px"}>30 min</Text>
                <IconButton aria-label="Like" icon={<GoHeart />} color={"white"} borderRadius={"50%"} opacity={0.1} position="absolute" top={2} right={2}/>
              </Box>
            </Box>
            <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Daily Deli</Text>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"}/>
                <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>4.8</Text>
              </HStack>
            </Flex>
            <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Garden Town</Text>
          </Box>

        </Wrapper>
        </>

      case "saved":
        return <>
        <Wrapper>
          <Box mb={'2em'}>
            <Flex justifyContent={"space-between"} mt={"3em"} mb={"1em"}>
              <Text fontSize="20px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Saved</Text>
            </Flex>
            <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
              <Box flex="0 0 100%" p={10} w="100%" h="200px" borderRadius="16px" bgImage={"Food-item-3.jpg"} bgSize="cover" bgPosition="center">
                <Text fontSize="17px" fontWeight="700" position={"absolute"} left={"5"} bottom="5" borderRadius={"16px"} color={"#000"} bg={"#fff"} px={"12px"} py={"4px"}>40 min</Text>
                <Icon aria-label="Like" as={GoHeartFill} color={"rgba(240, 81, 147, 1)"} borderRadius={"50%"} opacity={1} position="absolute" top={5} right={5}/>
              </Box>
            </Box>
            <Flex justifyContent={"space-between"} mt={"1em"}>
              <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Thicc Shakes</Text>
              <HStack spacing={1}>
                <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"}/>
                <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>4.8</Text>
              </HStack>
            </Flex>
            <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>Wapda Town</Text>
          </Box>
        </Wrapper>
        </>

      case "notifications":
        return <Text>Notifications</Text>;

      case "profile":
        return <Text>Profile Content</Text>;

      default:
        return null;
    }
  };
  
  return (
    
    <Box minH="100vh">
      <Box >
        {renderContent()}
      </Box>
      
      <Flex as="nav" position="fixed" bottom={0} w="100%" gap={14} justifyContent={"center"} alignContent={"center"} bg="white" justify="space-around" zIndex={100} pb={".5em"}>
        <VStack spacing={2} pt={"1em"}>
          <SearchIcon width={"24px"} height={"24px"} aria-label="Explore" color={activeTab === "explore" ? "brand.primary" : "gray.500"} onClick={() => setActiveTab("explore")} />
          <Text fontSize="11px" color={activeTab === "explore" ? "brand.primary" : "gray.500"} fontWeight={"400"} lineHeight={"13px"} letterSpacing={"0.07px"}>Explore</Text>
        </VStack>

        <VStack spacing={2} pt={"1em"}>
          <Icon as={GoHeart} fontSize={"24px"} aria-label="Saved" color={activeTab === "saved" ? "#5438DC" : "gray.500"} onClick={() => setActiveTab("saved")}/>
          <Text fontSize="11px" color={activeTab === "saved" ? "brand.primary" : "gray.500"} fontWeight={"400"} lineHeight={"13px"} letterSpacing={"0.07px"}>Saved</Text>
        </VStack>

        <VStack spacing={2} pt={"1em"} mr={"-1em"}>
          <Icon as={GrNotification} fontSize={"24px"} aria-label="Notifications" color={activeTab === "notifications" ? "#5438DC" : "gray.500"} onClick={() => setActiveTab("notifications")}/>
          <Text fontSize="11px" fontWeight={"400"} color={activeTab === "notifications" ? "brand.primary" : "gray.500"} lineHeight={"13px"} letterSpacing={"0.07px"}>Notifications</Text>
        </VStack>

        <VStack spacing={2} p={"1em"} mr={"-1em"}>
          <Icon as={GoPerson} fontSize={"24px"} aria-label="Profile" color={activeTab === "profile" ? "#5438DC" : "gray.500"} onClick={() => setActiveTab("profile")}/>
          <Text fontSize="11px" fontWeight={"400"} color={activeTab === "profile" ? "brand.primary" : "gray.500"} lineHeight={"13px"} letterSpacing={"0.07px"}>Profile</Text>
        </VStack>
      </Flex>
    </Box>
    );
  };
    
export default BoiboiWebApp;
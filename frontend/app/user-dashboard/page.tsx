"use client";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Grid, HStack, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Radio, RadioGroup, Text, VStack, Spinner } from "@chakra-ui/react";
import { FaHome, FaBox, FaUser, FaCompass, FaBookmark, FaBell } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import Wrapper from "../components/Wrapper";
import { SlLocationPin } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoHeart, GoHeartFill, GoPerson } from "react-icons/go";
import { GrNotification } from "react-icons/gr";
import { ImageResult } from "@/lib/imageService";

function BoiboiWebApp() {
  const router = useRouter();

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: api.vendors,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const carouselRef = useRef<HTMLDivElement>(null);
  let touchStartX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50 && activeIndex < vendorList.length - 1) {
      setActiveIndex((prev) => prev + 1);
      touchStartX = touchEndX;
    } else if (diff < -50 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      touchStartX = touchEndX;
    }
  };

  // Normalize vendors array from API
  const vendorList: any[] = Array.isArray((vendors as any)?.data)
    ? (vendors as any).data
    : (Array.isArray(vendors) ? (vendors as any) : []) as any[];

  // Get store image
  const getStoreImage = (v: any): string => {
    return (
      v?.image ||
      v?.Image ||
      v?.coverImage ||
      v?.logoUrl ||
      "Food-item-1.jpeg"
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {/* Header Section */}
            <Box bg="#6C3FE8" position={"relative"} w={"100%"} pt={4} pb={20}>
              <Wrapper>
                <Flex justifyContent={"space-between"} alignItems={"center"} mb={4}>
                  <HStack spacing={1}>
                    <Text fontSize={"15px"} fontWeight={"400"} color={"#fff"}>
                      Univeristy of Ibadan
                    </Text>
                    <Box as="span" color="#fff" fontSize="12px">
                      ▼
                    </Box>
                  </HStack>
                  <Icon as={FaBell} color="#fff" fontSize="20px" />
                </Flex>

                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none" h="44px">
                    {<SearchIcon ml={"10px"} width={"18px"} h={"18px"} color={"#8E8E93"} />}
                  </InputLeftElement>
                  <Input
                    placeholder="Search bar"
                    width={"100%"}
                    fontSize={"17px"}
                    bg={"#fff"}
                    fontWeight={"400"}
                    h={"44px"}
                    borderRadius={"10px"}
                    color={"#000"}
                    _placeholder={{ color: "#8E8E93" }}
                    border="none"
                  />
                </InputGroup>
              </Wrapper>
            </Box>

            <Wrapper>
              {/* Overlapping Section */}
              <Box mt={"-60px"} position="relative" zIndex={1}>
                <Box w="100%" h="135px" bg="purple.500" borderRadius={"12px"} mb={4} />

                {/* Category Grid */}
                <Grid templateColumns={{ base: "repeat(3, 1fr)" }} gap={3} mb={6}>
                  {["Grocery", "Supermarket", "Restaurant", "Send package", "Market runs", "More"].map(
                    (label, idx) => (
                      <VStack
                        key={idx}
                        bg={"#fff"}
                        borderRadius={"10px"}
                        py={3}
                        spacing={2}
                        boxShadow="0px 0px 1px rgba(0,0,0,0.1)"
                        cursor="pointer"
                      >
                        <Box w="32px" h="32px" bg="#1DA169" borderRadius="4px" />
                        <Text fontSize="11px" color="#000" fontWeight="400" textAlign="center">
                          {label}
                        </Text>
                      </VStack>
                    )
                  )}
                </Grid>
              </Box>

              {/* Buy Again Section - One card per view */}
              <Box w="100%" mb={6}>
                <Flex justifyContent={"space-between"} alignItems="center" mb={3}>
                  <Text fontSize="17px" fontWeight="600" color="#000">
                    Buy again
                  </Text>
                  <Text fontSize="13px" fontWeight="400" color="#8E8E93" cursor="pointer">
                    see all
                  </Text>
                </Flex>
                {vendorsLoading ? (
                  <HStack justifyContent="center" py={10}>
                    <Spinner />
                  </HStack>
                ) : (
                  <Box position="relative">
                    <Box
                      ref={carouselRef}
                      overflow="hidden"
                      w="100%"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                    >
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {vendorList.map((v: any, idx: number) => (
                          <Box
                            key={v._id}
                            flex="0 0 100%"
                            px={1}
                            onClick={() => router.push(`/dashboard/stores/${v._id}`)}
                            cursor="pointer"
                          >
                            <Box
                              w="100%"
                              h="140px"
                              borderRadius="12px"
                              bgImage={getStoreImage(v)}
                              bgSize="cover"
                              bgPosition="center"
                              position="relative"
                            >
                              <IconButton
                                aria-label="Like"
                                icon={<GoHeart />}
                                size="sm"
                                bg="rgba(255,255,255,0.9)"
                                color="#000"
                                borderRadius={"full"}
                                position="absolute"
                                top={2}
                                right={2}
                                _hover={{ bg: "white" }}
                              />
                            </Box>
                            <Flex justifyContent={"space-between"} alignItems="center" mt={2}>
                              <Box>
                                <Text fontSize="13px" fontWeight="600" color="#000">
                                  {v.businessName || v.name || v.Name}
                                </Text>
                                <Text fontSize="11px" fontWeight="400" color="#8E8E93">
                                  {(v.distance || "0.6") + "km"} • {v.category || "Spaghetti"}
                                </Text>
                              </Box>
                              <HStack spacing={0.5}>
                                <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                                <Text fontSize={"12px"} fontWeight={"600"} color="#000">
                                  {v.rating ?? v.Ratings ?? "4.5"}
                                </Text>
                              </HStack>
                            </Flex>
                          </Box>
                        ))}
                      </motion.div>
                    </Box>

                    {/* Pagination Dots */}
                    <Flex justify="center" gap={2} mt={4}>
                      {vendorList.map((_, index) => (
                        <Box
                          key={index}
                          w={activeIndex === index ? "20px" : "6px"}
                          h="6px"
                          bg={activeIndex === index ? "#000" : "#D1D1D6"}
                          borderRadius="full"
                          transition="all 0.3s"
                          cursor="pointer"
                          onClick={() => setActiveIndex(index)}
                        />
                      ))}
                    </Flex>
                  </Box>
                )}
              </Box>

              {/* Vendors Near You - One card per view */}
              <Box w="100%" mb={6}>
                <Flex justifyContent={"space-between"} alignItems="center" mb={3}>
                  <Text fontSize="17px" fontWeight="600" color="#000">
                    Vendors near you
                  </Text>
                  <Text fontSize="13px" fontWeight="400" color="#8E8E93" cursor="pointer">
                    see all
                  </Text>
                </Flex>
                {vendorsLoading ? (
                  <HStack justifyContent="center" py={10}>
                    <Spinner />
                  </HStack>
                ) : (
                  <Box position="relative">
                    <Box overflow="hidden" w="100%">
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {vendorList.map((v: any) => (
                          <Box
                            key={v._id}
                            flex="0 0 100%"
                            px={1}
                            onClick={() => router.push(`/dashboard/stores/${v._id}`)}
                            cursor="pointer"
                          >
                            <Box
                              bg="white"
                              borderRadius="12px"
                              overflow="hidden"
                              boxShadow="0px 0px 2px rgba(0,0,0,0.1)"
                            >
                              <Box
                                w="100%"
                                h="110px"
                                bgImage={getStoreImage(v)}
                                bgSize="cover"
                                bgPosition="center"
                              />
                              <Box p={3}>
                                <Flex justifyContent={"space-between"} alignItems="center">
                                  <Box>
                                    <Text fontSize="13px" fontWeight="600" color="#000">
                                      {v.businessName || v.name || v.Name}
                                    </Text>
                                    <Text fontSize="11px" fontWeight="400" color="#8E8E93">
                                      {(v.distance || "0.6") + "km"} • {v.category || "Groceries"}
                                    </Text>
                                  </Box>
                                  <HStack spacing={0.5}>
                                    <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                                    <Text fontSize={"12px"} fontWeight={"600"} color="#000">
                                      {v.rating ?? v.Ratings ?? "4.5"}
                                    </Text>
                                  </HStack>
                                </Flex>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </motion.div>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Best Deals - One card per view */}
              <Box w="100%" mb={6}>
                <Text fontSize="17px" fontWeight="600" mb={3} color="#000">
                  Best deals for you
                </Text>
                {vendorsLoading ? (
                  <HStack justifyContent="center" py={10}>
                    <Spinner />
                  </HStack>
                ) : (
                  <Box position="relative">
                    <Box overflow="hidden" w="100%">
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {vendorList.map((v: any) => (
                          <Box key={v._id} flex="0 0 100%" px={1}>
                            <Box
                              bg="white"
                              borderRadius="12px"
                              overflow="hidden"
                              boxShadow="0px 0px 2px rgba(0,0,0,0.1)"
                            >
                              <Box
                                w="100%"
                                h="120px"
                                borderRadius="12px"
                                bgImage={getStoreImage(v)}
                                bgSize="cover"
                                bgPosition="center"
                                position="relative"
                              >
                                <Text
                                  position="absolute"
                                  bottom="2"
                                  right="2"
                                  fontSize="10px"
                                  bg="#EDEDED"
                                  color="#000"
                                  px={2}
                                  py={1}
                                  borderRadius="8px"
                                  fontWeight="500"
                                >
                                  Up to 40% discount
                                </Text>
                              </Box>
                              <Box p={3}>
                                <Flex justifyContent={"space-between"} alignItems="center">
                                  <Box>
                                    <Text fontSize="13px" fontWeight="600" color="#000">
                                      {v.businessName || v.name || v.Name}
                                    </Text>
                                    <Text fontSize="11px" fontWeight="400" color="#8E8E93">
                                      {(v.distance || "0.6") + "km"} • {v.category || "Groceries"}
                                    </Text>
                                  </Box>
                                  <HStack spacing={0.5}>
                                    <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                                    <Text fontSize={"12px"} fontWeight={"600"} color="#000">
                                      {v.rating ?? v.Ratings ?? "4.5"}
                                    </Text>
                                  </HStack>
                                </Flex>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </motion.div>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* More Stores - One card per view */}
              <Box w="100%" mb={6}>
                <Text fontSize="17px" fontWeight="600" mb={3} color="#000">
                  More stores
                </Text>
                {vendorsLoading ? (
                  <HStack justifyContent="center" py={10}>
                    <Spinner />
                  </HStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {vendorList.slice(0, 3).map((v: any) => (
                      <Box
                        key={v._id}
                        bg="white"
                        borderRadius="12px"
                        p={3}
                        boxShadow="0px 0px 2px rgba(0,0,0,0.1)"
                        onClick={() => router.push(`/dashboard/stores/${v._id}`)}
                        cursor="pointer"
                      >
                        <Box
                          w="100%"
                          h="150px"
                          borderRadius="12px"
                          bgImage={getStoreImage(v)}
                          bgSize="cover"
                          bgPosition="center"
                          mb={2}
                        />
                        <Flex justifyContent={"space-between"} alignItems="center">
                          <Box>
                            <Text fontSize="13px" fontWeight="600" color="#000">
                              {v.businessName || v.name || v.Name}
                            </Text>
                            <Text fontSize="11px" fontWeight="400" color="#8E8E93">
                              {(v.distance || "0.6") + "km"} • {v.category || "Groceries"}
                            </Text>
                          </Box>
                          <HStack spacing={0.5}>
                            <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                            <Text fontSize={"12px"} fontWeight={"600"} color="#000">
                              {v.rating ?? v.Ratings ?? "4.5"}
                            </Text>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              <Box mb={"5em"} />
            </Wrapper>

            {/* Floating Cart Button */}
            <Box position="fixed" bottom="80px" right="4" zIndex={50}>
              <Box position="relative">
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  w="56px"
                  h="56px"
                  bg="#000"
                  borderRadius="full"
                  boxShadow="lg"
                  cursor="pointer"
                >
                  <Icon as={FaBox} color="white" fontSize="24px" />
                </Flex>
                <Flex
                  position="absolute"
                  top="-2"
                  right="-2"
                  alignItems="center"
                  justifyContent="center"
                  w="20px"
                  h="20px"
                  bg="white"
                  borderRadius="full"
                  border="2px solid #000"
                >
                  <Text fontSize="10px" fontWeight="700" color="#000">
                    3
                  </Text>
                </Flex>
              </Box>
            </Box>
          </>
        );

      case "saved":
        return (
          <Wrapper>
            <SavedVendors />
          </Wrapper>
        );

      case "notifications":
        return (
          <Wrapper>
            <Text fontSize="20px" fontWeight="700" mt={8}>
              Notifications
            </Text>
          </Wrapper>
        );

      case "support":
        return (
          <Wrapper>
            <SupportTickets />
          </Wrapper>
        );

      case "profile":
        return (
          <Wrapper>
            <Text fontSize="20px" fontWeight="700" mt={8}>
              Profile Content
            </Text>
          </Wrapper>
        );

      default:
        return null;
    }
  };

  function SavedVendors() {
    const { data: saved, isLoading } = useQuery({ queryKey: ["saved-vendors"], queryFn: api.savedVendors });
    const list: any[] = Array.isArray((saved as any)?.data) ? (saved as any).data : (Array.isArray(saved) ? (saved as any) : []) as any[];
    if (isLoading) return (<HStack justifyContent="center" py={10}><Spinner /></HStack>);
    if (list.length === 0) return (<Text fontSize="14px" color="#8E8E93" mt={6}>No saved stores yet.</Text>);
    return (
      <VStack spacing={3} align="stretch" mt={4}>
        {list.map((v: any) => (
          <Box key={v._id || v.id} bg="white" borderRadius="12px" p={3} boxShadow="0px 0px 2px rgba(0,0,0,0.1)" onClick={() => router.push(`/dashboard/stores/${v._id || v.id}`)} cursor="pointer">
            <Box w="100%" h="150px" borderRadius="12px" bgImage={getStoreImage(v)} bgSize="cover" bgPosition="center" mb={2} />
            <Flex justifyContent={"space-between"} alignItems="center">
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#000">{v.businessName || v.name || v.Name}</Text>
                <Text fontSize="11px" fontWeight="400" color="#8E8E93">{(v.distance || "0.6") + "km"} • {v.category || "Groceries"}</Text>
              </Box>
              <HStack spacing={0.5}>
                <Image src="/Star.png" alt="Rating" width={"14px"} height={"14px"} />
                <Text fontSize={"12px"} fontWeight={"600"} color="#000">{v.rating ?? v.Ratings ?? "4.5"}</Text>
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>
    );
  }

  function SupportTickets() {
    const { data: tickets, isLoading } = useQuery({ queryKey: ["support-tickets"], queryFn: api.mySupportTickets });
    const list: any[] = Array.isArray((tickets as any)?.data) ? (tickets as any).data : (Array.isArray(tickets) ? (tickets as any) : []) as any[];
    return (
      <Box>
        <Text fontSize="20px" fontWeight="700" mt={8}>Support</Text>
        {isLoading ? (
          <HStack justifyContent="center" py={10}><Spinner /></HStack>
        ) : (
          <VStack spacing={3} mt={4} align="stretch">
            {list.map((t: any) => (
              <Box key={t.id || t._id} bg="white" p={3} borderRadius="12px" boxShadow="0 0 2px rgba(0,0,0,0.1)">
                <Text fontSize="14px" fontWeight="600">{t.subject}</Text>
                <Text fontSize="12px" color="#8E8E93">{t.status}</Text>
                <Text fontSize="13px" mt={1}>{t.message}</Text>
              </Box>
            ))}
            {list.length === 0 && <Text fontSize="14px" color="#8E8E93">No tickets yet.</Text>}
          </VStack>
        )}
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#F2F2F7">
      <Box>{renderContent()}</Box>

      {/* Bottom Navigation */}
      <Flex
        as="nav"
        position="fixed"
        bottom={0}
        w="100%"
        bg="white"
        justify="space-around"
        alignItems="center"
        zIndex={100}
        py={2}
        borderTop="1px solid"
        borderColor="gray.200"
        maxW="100vw"
      >
        <VStack spacing={1} cursor="pointer" onClick={() => setActiveTab("overview")}>
          <Icon as={FaCompass} fontSize={"24px"} color={activeTab === "overview" ? "#000" : "gray.500"} />
          <Text fontSize="10px" color={activeTab === "overview" ? "#000" : "gray.500"} fontWeight={"500"}>
            Explore
          </Text>
        </VStack>

        <VStack spacing={1} cursor="pointer" onClick={() => setActiveTab("saved")}>
          <Icon as={FaBookmark} fontSize={"24px"} color={activeTab === "saved" ? "#000" : "gray.500"} />
          <Text fontSize="10px" color={activeTab === "saved" ? "#000" : "gray.500"} fontWeight={"500"}>
            Saved
          </Text>
        </VStack>

        <VStack spacing={1} cursor="pointer" onClick={() => setActiveTab("orders")}>
          <Icon as={FaBox} fontSize={"24px"} color={activeTab === "orders" ? "#000" : "gray.500"} />
          <Text fontSize="10px" fontWeight={"500"} color={activeTab === "orders" ? "#000" : "gray.500"}>
            Orders
          </Text>
        </VStack>

        <VStack spacing={1} cursor="pointer" onClick={() => setActiveTab("support")}>
          <Icon as={FaBell} fontSize={"24px"} color={activeTab === "support" ? "#000" : "gray.500"} />
          <Text fontSize="10px" fontWeight={"500"} color={activeTab === "support" ? "#000" : "gray.500"}>
            Support
          </Text>
        </VStack>

        <VStack spacing={1} cursor="pointer" onClick={() => setActiveTab("profile")}>
          <Icon as={FaUser} fontSize={"24px"} color={activeTab === "profile" ? "#000" : "gray.500"} />
          <Text fontSize="10px" fontWeight={"500"} color={activeTab === "profile" ? "#000" : "gray.500"}>
            Profile
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
}

export default BoiboiWebApp;
"use client";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Grid, HStack, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Radio, RadioGroup, Text, VStack, Spinner } from "@chakra-ui/react";
import { FaHome, FaBox, FaUser, FaCompass, FaBookmark, FaBell } from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import Wrapper from "../components/Wrapper";
import { SlLocationPin } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  let touchStartX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50 && activeIndex < filteredVendorList.length - 1) {
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

  // Map category IDs to readable names
  const getCategoryName = (vendor: any): string => {
    // Check if category is already a readable string
    if (typeof vendor.category === 'string' && !vendor.category.match(/^[0-9a-f]{24}$/i)) {
      return vendor.category;
    }

    // Check for category name field
    if (vendor.categoryName) {
      return vendor.categoryName;
    }

    // Check for category object with name
    if (vendor.category && typeof vendor.category === 'object' && vendor.category.name) {
      return vendor.category.name;
    }

    // Check for business type or other category fields
    if (vendor.businessType) {
      return vendor.businessType;
    }

    // Default fallback categories based on common patterns
    const categoryMap: { [key: string]: string } = {
      '67d582619dfc3452b04e4c77': 'Restaurant',
      '68035daf79fd624e59299358': 'Grocery',
      '68035dd9f2c01460883c9e14': 'Supermarket',
      // Add more mappings as needed
    };

    if (vendor.category && categoryMap[vendor.category]) {
      return categoryMap[vendor.category];
    }

    // Final fallback
    return 'Store';
  };

  // Debug: Log vendor data structure to help identify ID field
  if (vendorList.length > 0) {
    console.log("First vendor data structure:", vendorList[0]);
    console.log("Available ID fields:", {
      _id: vendorList[0]._id,
      id: vendorList[0].id,
      ID: vendorList[0].ID
    });
    console.log("Category information:", {
      category: vendorList[0].category,
      categoryName: vendorList[0].categoryName,
      businessType: vendorList[0].businessType,
      resolvedCategory: getCategoryName(vendorList[0])
    });
  }

  // Filter vendors based on search query
  const filteredVendorList = vendorList.filter((v: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (v.businessName && v.businessName.toLowerCase().includes(query)) ||
      (v.name && v.name.toLowerCase().includes(query)) ||
      (v.Name && v.Name.toLowerCase().includes(query)) ||
      (getCategoryName(v).toLowerCase().includes(query))
    );
  });

  // Auto-slide functionality
  useEffect(() => {
    if (isHovered || filteredVendorList.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filteredVendorList.length);
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [isHovered, filteredVendorList.length]);

  // Reset to first item when search query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

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
            <Box bg="#6C3FE8" w={"100%"} py={4}>
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

                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="44px">
                    {<SearchIcon ml={"10px"} width={"18px"} h={"18px"} color={"#8E8E93"} />}
                  </InputLeftElement>
                  <Input
                    placeholder="Search stores and items..."
                    width={"100%"}
                    fontSize={"17px"}
                    bg={"#fff"}
                    fontWeight={"400"}
                    h={"44px"}
                    borderRadius={"10px"}
                    color={"#000"}
                    _placeholder={{ color: "#8E8E93" }}
                    border="none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Wrapper>
            </Box>

            <Wrapper>
              {/* Content Section */}
              <Box py={4}>
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
                        border="1px solid"
                        borderColor="gray.200"
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
                ) : filteredVendorList.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text color="#8E8E93" fontSize="14px">
                      {searchQuery ? `No stores found for "${searchQuery}"` : "No stores available"}
                    </Text>
                  </Box>
                ) : (
                  <Box position="relative">
                    <Box
                      ref={carouselRef}
                      overflow="hidden"
                      w="100%"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {filteredVendorList.map((v: any, idx: number) => (
                          <Box
                            key={v._id || v.id}
                            flex="0 0 100%"
                            px={1}
                            onClick={() => {
                              const storeId = v._id || v.id;
                              if (storeId) {
                                router.push(`/user-dashboard/stores/${storeId}`);
                              } else {
                                console.error("Store ID is missing:", v);
                              }
                            }}
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
                                  {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
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
                      {filteredVendorList.map((_, index) => (
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
                ) : filteredVendorList.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text color="#8E8E93" fontSize="14px">
                      {searchQuery ? `No stores found for "${searchQuery}"` : "No stores available"}
                    </Text>
                  </Box>
                ) : (
                  <Box position="relative">
                    <Box overflow="hidden" w="100%">
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {filteredVendorList.map((v: any) => (
                          <Box
                            key={v._id || v.id}
                            flex="0 0 100%"
                            px={1}
                            onClick={() => {
                              const storeId = v._id || v.id;
                              if (storeId) {
                                router.push(`/user-dashboard/stores/${storeId}`);
                              } else {
                                console.error("Store ID is missing:", v);
                              }
                            }}
                            cursor="pointer"
                          >
                            <Box
                              bg="white"
                              borderRadius="12px"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="gray.200"
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
                                      {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
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
                ) : filteredVendorList.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Text color="#8E8E93" fontSize="14px">
                      {searchQuery ? `No stores found for "${searchQuery}"` : "No stores available"}
                    </Text>
                  </Box>
                ) : (
                  <Box position="relative">
                    <Box overflow="hidden" w="100%">
                      <motion.div
                        style={{ display: "flex", width: "100%" }}
                        animate={{ x: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {filteredVendorList.map((v: any) => (
                          <Box key={v._id || v.id} flex="0 0 100%" px={1}>
                            <Box
                              bg="white"
                              borderRadius="12px"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="gray.200"
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
                                      {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
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
                    {filteredVendorList.slice(0, 3).map((v: any) => (
                      <Box
                        key={v._id || v.id}
                        bg="white"
                        borderRadius="12px"
                        p={3}
                        border="1px solid"
                        borderColor="gray.200"
                        onClick={() => {
                          const storeId = v._id || v.id;
                          if (storeId) {
                            router.push(`/user-dashboard/stores/${storeId}`);
                          } else {
                            console.error("Store ID is missing:", v);
                          }
                        }}
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
                              {(v.distance || "0.6") + "km"} • {getCategoryName(v)}
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
          <>
            <Wrapper>
              <Box mb={"2em"}>
                <Flex justifyContent={"space-between"} mt={"3em"} mb={"1em"}>
                  <Text fontSize="20px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>
                    Saved
                  </Text>
                </Flex>
                <Box w="100%" h={"200px"} textAlign="center" position={"relative"}>
                  <Box
                    flex="0 0 100%"
                    p={10}
                    w="100%"
                    h="200px"
                    borderRadius="16px"
                    bgImage={"Food-item-3.jpg"}
                    bgSize="cover"
                    bgPosition="center"
                  >
                    <Text
                      fontSize="17px"
                      fontWeight="700"
                      position={"absolute"}
                      left={"5"}
                      bottom="5"
                      borderRadius={"16px"}
                      color={"#000"}
                      bg={"#fff"}
                      px={"12px"}
                      py={"4px"}
                    >
                      40 min
                    </Text>
                    <Icon
                      aria-label="Like"
                      as={GoHeartFill}
                      color={"rgba(240, 81, 147, 1)"}
                      borderRadius={"50%"}
                      opacity={1}
                      position="absolute"
                      top={5}
                      right={5}
                      fontSize="24px"
                    />
                  </Box>
                </Box>
                <Flex justifyContent={"space-between"} mt={"1em"}>
                  <Text fontSize="17px" fontWeight="700" mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>
                    Thicc Shakes
                  </Text>
                  <HStack spacing={1}>
                    <Image src="/Star.png" alt="Rating" width={"20px"} height={"20px"} />
                    <Text fontSize={"14px"} fontWeight={"700"} lineHeight={"18px"} letterSpacing={"-0.08px"}>
                      4.8
                    </Text>
                  </HStack>
                </Flex>
                <Text fontSize="15px" fontWeight="400" color={"Gray"} mb={2} lineHeight={"22px"} letterSpacing={"-0.41px"}>
                  Wapda Town
                </Text>
              </Box>
            </Wrapper>
          </>
        );

      case "notifications":
        return (
          <Wrapper>
            <Text fontSize="20px" fontWeight="700" mt={8}>
              Notifications
            </Text>
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
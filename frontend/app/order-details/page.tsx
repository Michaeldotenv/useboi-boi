"use client"
import { Box, Flex, HStack, Image, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text, VStack, Spinner, Badge } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { GoHeart, GoShareAndroid } from "react-icons/go";
import { PiDotsThreeVertical } from "react-icons/pi";
import { CiStar } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";





function OrderDetailsPage() {

   const router =  useRouter();
   const searchParams = useSearchParams();
   const vendorId = searchParams.get("id") || "";

   const vendorsQuery = useQuery({ queryKey: ["vendors"], queryFn: api.vendors });
   const selectedVendorId = vendorId || (((vendorsQuery.data as any)?.data || vendorsQuery.data || [])[0]?._id || "");
   const itemsQuery = useQuery({
     queryKey: ["vendor-items", selectedVendorId],
     queryFn: () => api.vendorItems(selectedVendorId),
     enabled: Boolean(selectedVendorId),
   });

  const vendorList = (vendorsQuery.data as any)?.data || vendorsQuery.data || [];
  const vendor = vendorList.find((v: any) => v._id === selectedVendorId) || vendorList[0] || {};
  const items = (itemsQuery.data as any)?.data || itemsQuery.data || [];

  return (
   <>
      <Box position={"relative"} w="100%" h="200px">
         <Box bgColor={"#5234E5"} bgImage={vendor.coverImage || "/Food-item-2.jpg"} bgSize={"cover"} bgPosition={"center"} bgRepeat={"no-repeat"} w={"100%"} h={"200px"}/>
         <Box position="absolute" top="0" left="0" w="100%" h="100%" bg="black" borderRadius={"16px"} opacity={0.4} pointerEvents="none"/>

         <Flex justifyContent="space-between" position="absolute" top="45px" left="0px" right={"0px"} w="100%" mx={"auto"}>
            <ArrowBackIcon width={"22px"} height={"22px"} color={"#fff"} ml={"25px"} onClick={() => location.replace("/user-dashboard")} cursor={"pointer"}/>

            <HStack mr={"25px"}>
               <GoHeart size={"22px"} color="#fff"/>
               <GoShareAndroid size={"22px"} color="#fff"/>
               <PiDotsThreeVertical size={"22px"} color="#fff"/>
            </HStack>
         </Flex>

         <Box>
            <Text position="absolute" bottom="45" left="30" color="white" fontSize={"22px"} fontWeight={"700"} lineHeight={"28px"} letterSpacing={"0.8px"}>{vendor.businessName || vendor.name || "Store"}</Text>
            <Text position="absolute" bottom="15" left="41" transform="translate(-18%, -18%)" color="white" fontSize={"15px"} fontWeight={"400"} lineHeight={"20px"} letterSpacing={"-0.24px"}>{vendor.city || vendor.address || ""}</Text>
         </Box>
      </Box>
   
      <Wrapper>
         <Flex justifyContent={"space-between"} maxW={"270px"} mx={"auto"} mt={"2em"}>
            <VStack>
               <CiStar size={"24px"}/>
               <Text fontSize="13px" fontWeight={"400"} color="#000" lineHeight={"18px"} letterSpacing={"-0.08px"}>{vendor.rating ?? "4.8"}</Text>
            </VStack>

            <VStack>
               <IoTimeOutline size={"24px"}/>
               <Text fontSize="13px" fontWeight={"400"} color="#000" lineHeight={"18px"} letterSpacing={"-0.08px"}>{vendor.eta || "40min"}</Text>
            </VStack>

            <VStack>
               <SlLocationPin size={"24px"}/>
               <Text fontSize="13px" fontWeight={"400"} color="#000" lineHeight={"18px"} letterSpacing={"-0.08px"}>{vendor.distance || "Nearby"}</Text>
            </VStack>
         </Flex>

         <Flex justifyContent={"center"} mx={"auto"} mt={"1.5em"}>
            <Tabs size={'sm'} isFitted variant='unstyled' width="100%" defaultIndex={0} scrollBehavior={"smooth"} overflowX="auto" css={{"&::-webkit-scrollbar": { height: "2px"}, "&::-webkit-scrollbar-thumb": {background: "gray.400", borderRadius: "10px"}}}>
               <TabList>
                  <Tab fontSize={"14px"} fontWeight={"700"} _selected={{color:"brand.primary"}}>Popular</Tab>
                  <Tab _selected={{color:"brand.primary"}} fontSize={"14px"} fontWeight={"700"} color={"gray"} >Deals</Tab>
                  <Tab _selected={{color:"brand.primary"}} fontSize={"14px"} fontWeight={"700"} color={"gray"} >Wraps</Tab>
                  <Tab _selected={{color:"brand.primary"}} fontSize={"14px"} fontWeight={"700"} color={"gray"}>Beverages</Tab>
                  <Tab _selected={{color:"brand.primary"}} fontSize={"14px"} fontWeight={"700"} color={"gray"}>Sandwiches</Tab>
               </TabList>
               <TabIndicator mt='3px' height='3px' bg="brand.primary" borderRadius='5px'/>

               <TabPanels>
                  <TabPanel>
                    {itemsQuery.isLoading ? (
                      <HStack justifyContent="center" py={6}><Spinner /></HStack>
                    ) : items.length === 0 ? (
                      <Text color="gray.600">No items yet.</Text>
                    ) : (
                      items.slice(0, 6).map((it: any) => (
                        <HStack key={it._id} spacing={5} mt={"1em"} cursor={"pointer"}>
                          <Image src={it.image || "/Food-item-6.jpg"} alt={it.name} width={"64px"} height={"64px"} borderRadius={"16px"} />
                          <Box>
                            <Text fontSize="17px" fontWeight="400" lineHeight={"22px"} letterSpacing={"-0.41px"}>{it.name}</Text>
                            {it.description ? (
                              <Text fontSize="15px" fontWeight="400" lineHeight={"20px"} letterSpacing={"-0.24px"} color={"gray"} mt={".3em"}>{it.description}</Text>
                            ) : null}
                            <HStack mt={".5em"}>
                              <Text fontSize="15px" fontWeight="700" lineHeight={"20px"} letterSpacing={"-0.24px"}>₦{it.price || it.amount || it.unitPrice}</Text>
                              {it.available === false ? <Badge colorScheme="red">Unavailable</Badge> : null}
                            </HStack>
                          </Box>
                        </HStack>
                      ))
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    <Text color="gray.600">No special deals available.</Text>
                  </TabPanel>
                  
                  <TabPanel>
                    <Text color="gray.600">No wraps available.</Text>
                  </TabPanel>
               </TabPanels>
            </Tabs>
         </Flex>
      </Wrapper>
   </>

  )
}

export default OrderDetailsPage;
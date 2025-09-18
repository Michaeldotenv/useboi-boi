"use client"
import { Button, Flex, FormControl, FormLabel, Image, Input, Text, useToast } from "@chakra-ui/react"
import Wrapper from "../components/Wrapper";
import Link from "next/link";
import { useRouter } from "next/navigation";





function ForgotPassword() {
  const router =  useRouter();
    
  const handleOtp = () => {
    router.push("/otp-verification");
  }

  const handleHomePage = () => {
    router.push("/");
  }

  return (
    <Wrapper>

        <Flex justifyContent={'center'}>
          <Image src={"/Boiboi (Palatinate blue).png"} alt={"BoiBoi Logo"} objectFit={"cover"} width={"200px"} height={"60px"} cursor={"pointer"} onClick={handleHomePage} aspectRatio={"4/3"} marginTop={"1.5em"}/>
        </Flex>

        <Flex justifyContent={"center"} mt={"3em"}>
          <form >
            <FormControl isRequired mt={"3em"} w={"100%"}>
              <Text fontWeight={"700"} fontSize={"24px"} letterSpacing={"0.75px"} mb={"1em"}>Input your credentials</Text>
              <FormLabel fontWeight={"400"} fontSize={"18px"}>Email</FormLabel>
              <Input type="email" color={"#000"} fontSize={"17px"} fontWeight={"400"} h={"74px"} w={{md:"461px", base:"300px"}} borderRadius={"16px"} px={"24px"} py={"16px"} placeholder="johndoe123@gmail.com" letterSpacing={"-0.41px"} mb={"1em"}/>
            </FormControl>
            
            <Flex justifyContent={"center"} display={"block"} mt={"1em"}>
              <Button mt={"1em"} bgColor={"#5438DC"}  color={"#fff"} width={"100%"} fontSize={"17px"} fontWeight={"700"} variant={"primary"} borderRadius={"16px"} type="submit" h={"74px"} onClick={handleOtp}>Reset</Button>
            </Flex>
          </form>
        </Flex>

    </Wrapper>
  )
}
  
export default ForgotPassword;
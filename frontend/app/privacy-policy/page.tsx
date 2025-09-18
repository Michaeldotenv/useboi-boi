import { Box, Heading, Text, UnorderedList, ListItem, Link } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";





const PrivacyPolicy = () => {

  return (
    <Wrapper>
        <Box p={5}>
        <Heading fontWeight={"700"} fontSize={{md:"30px", base:"22px"}} mb={4}>Privacy Policy of Boiboi</Heading>

        <Text mt={"2em"}>
        At Boiboi, we are dedicated to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines the types of data we collect, how we use it, and the measures we take to safeguard it when you engage with our food ordering and errands service. We value transparency and are committed to handling your information responsibly. By using our Service, you agree to the collection and use of your data in accordance with this policy.


        </Text>
        
        <Heading fontWeight={"700"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>1. Information We Collect</Heading>
        <UnorderedList mt={"1em"}>
            <ListItem><strong>Personal Information:</strong> Name, phone number, email address, and delivery address when you sign up or place an order.</ListItem>
            <ListItem><strong>Payment Information:</strong> Processed through third-party payment processors; we do not store payment details.</ListItem>
            <ListItem><strong>Usage Data:</strong> Data on how you interact with our Service, such as order history and preferences.</ListItem>
            <ListItem><strong>Device and Location Data:</strong> Location data to facilitate order delivery, subject to your consent.</ListItem>
            <ListItem><strong>Cookies and Tracking Technologies:</strong> Used to enhance your experience and analyze website traffic.</ListItem>
        </UnorderedList>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>2. How We Use Your Information</Heading>
        <UnorderedList mt={"1em"}>
            <ListItem>Process and fulfill your orders.</ListItem>
            <ListItem>Communicate with you about orders and support inquiries.</ListItem>
            <ListItem>Improve and personalize your experience.</ListItem>
            <ListItem>Ensure security and prevent fraud.</ListItem>
            <ListItem>Analyze usage patterns to enhance our platform.</ListItem>
            <ListItem>Send promotional offers (with your consent).</ListItem>
            <ListItem>Comply with legal obligations.</ListItem>
        </UnorderedList>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>3. Sharing Your Information</Heading>
        <UnorderedList mt={"1em"}>
            <ListItem><strong>Service Providers:</strong> Third-party partners for orders, payments, and deliveries.</ListItem>
            <ListItem><strong>Marketing and Analytics Partners:</strong> Non-personal, aggregated data may be shared.</ListItem>
            <ListItem><strong>Legal Authorities:</strong> When required by law or to protect our rights.</ListItem>
        </UnorderedList>
        
        <Heading as="h2" size="lg" mt={6}>4. Data Security</Heading>
        <Text mt={2}>We implement industry-standard security measures, including encryption and secure servers. However, no transmission method is 100% secure.</Text>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>5. Your Choices</Heading>
        <UnorderedList mt={"1em"}>
            <ListItem>Update or delete your account information by contacting us.</ListItem>
            <ListItem>Opt-out of promotional communications anytime.</ListItem>
            <ListItem>Manage location services through device settings.</ListItem>
            <ListItem>Control cookies via browser settings.</ListItem>
        </UnorderedList>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>6. Data Retention</Heading>
        <Text mt={"1em"}>We retain personal data only as long as necessary. You can request data deletion.</Text>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>7. Changes to This Policy</Heading>
        <Text mt={"1em"}>We may update this Privacy Policy. Any changes will be posted with a revised Effective Date. Please review it regularly.</Text>
        
        <Heading fontWeight={"800"} fontSize={{md:"30px", base:"22px"}} mt={"1em"}>8. Contact Us</Heading>
        <Text mt={"1em"} mb={"2em"}>
            If you have any questions, contact us at <Link href="mailto:boiboi.nigeria@gmail.com" color="blue.500" target="_blank">boiboi.nigeria@gmail.com</Link>.
        </Text>
        </Box>
    </Wrapper>
  );
};

export default PrivacyPolicy;
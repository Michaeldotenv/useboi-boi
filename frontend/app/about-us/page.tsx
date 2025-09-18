"use client";

import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  HStack, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  chakra, 
  Image,
  VStack,
  Badge,
  Container
} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Card from "../components/Card";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AddIcon, MinusIcon, StarIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function AboutUs() {
  const router = useRouter();

  const scrollToFaqs = () => {
    const faqsSection = document.getElementById('FAQs');
    if (faqsSection) {
      faqsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <Box bg="brand.primary" py={20} color="white">
        <Wrapper variant="section">
          <VStack spacing={8} align="center" textAlign="center">
            <Badge colorScheme="white" variant="solid" px={4} py={2} borderRadius="full">
              Our Story
            </Badge>
            <Text
              fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
              fontWeight="900"
              lineHeight="1.2"
            >
              <chakra.span color="white">BOIBOI's</chakra.span> STORY
            </Text>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              maxW="3xl"
              opacity={0.9}
              lineHeight="1.6"
            >
              Transforming campus life through efficient, sustainable, and technology-driven errand services
            </Text>
          </VStack>
        </Wrapper>
      </Box>

      {/* CEO Section */}
      <Box py={20} bg="gray.50">
        <Wrapper variant="section">
          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={12}
            align="center"
          >
            <Card variant="elevated" p={0} overflow="hidden" maxW="400px">
              <Image
                src="/ore_.jpg"
                alt="CEO Idowu Oreoluwa"
                width="100%"
                height="500px"
                objectFit="cover"
              />
              <Box p={6}>
                <Text fontSize="2xl" fontWeight="900" color="text.primary" mb={2}>
                  Idowu Oreoluwa
                </Text>
                <Text fontSize="lg" fontWeight="500" color="brand.primary">
                  CEO, Boiboi Technologies
                </Text>
              </Box>
            </Card>

            <VStack spacing={6} align="start" flex={1} maxW="2xl">
              <Text fontSize="xl" lineHeight="1.8" color="text.primary">
                <chakra.span fontSize="3xl" fontWeight="700" color="brand.primary">
                  There
                </chakra.span>{" "}
                is a growing demand for convenience, which is predicated on the need to achieve efficiency and maximum productivity. Errands and logistics services are needed on campuses as they help students balance their growing and busy schedules, alongside the demand for convenience, saving them time and effort while affording them reduced stress and increased productivity.
              </Text>

              <Text fontSize="lg" lineHeight="1.8" color="text.secondary">
                Also, with the current rise in the trend of the emergence of student entrepreneurs. Logistics seems to be the bane of this, and so logistic solutions help them scale and grow as their operational costs get reduced.
              </Text>

              <Card bg="brand.primary" color="white" p={6}>
                <VStack spacing={4} align="start">
                  <Text fontSize="lg" fontWeight="700">
                    Our Key Differentiators:
                  </Text>
                  <VStack spacing={2} align="start">
                    <Text>• Flexible, student-friendly scheduling</Text>
                    <Text>• Campus-specific expertise and student-focused services</Text>
                    <Text>• Customized errand services</Text>
                  </VStack>
                </VStack>
              </Card>
            </VStack>
          </Flex>
        </Wrapper>
      </Box>

      {/* Vision & Mission */}
      <Box py={20}>
        <Wrapper variant="section">
          <VStack spacing={12} align="center">
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="900"
              textAlign="center"
              color="text.primary"
            >
              Our Vision & Mission
            </Text>

            <Flex
              direction={{ base: "column", md: "row" }}
              gap={8}
              w="100%"
            >
              <Card variant="elevated" flex={1} textAlign="center">
                <VStack spacing={4}>
                  <Text
                    fontSize="2xl"
                    fontWeight="700"
                    color="brand.primary"
                  >
                    Our Vision
                  </Text>
                  <Text fontSize="lg" lineHeight="1.7" color="text.secondary">
                    To create a service-based company whose primary goal is to exceed customers' expectations by transforming their campus life through efficient, sustainable, and technology-driven errand services.
                  </Text>
                </VStack>
              </Card>

              <Card variant="elevated" flex={1} textAlign="center">
                <VStack spacing={4}>
                  <Text
                    fontSize="2xl"
                    fontWeight="700"
                    color="brand.primary"
                  >
                    Our Mission
                  </Text>
                  <Text fontSize="lg" lineHeight="1.7" color="text.secondary">
                    To deliver exceptional value to students, faculty, and staff. Also to ease distribution and transportation of goods of campus-based and student-led SMEs within the shortest period as we provide them with an environmentally friendly and expedient delivery service, therefore affording them the opportunity for growth and scalability.
                  </Text>
                </VStack>
              </Card>
            </Flex>
          </VStack>
        </Wrapper>
      </Box>

      {/* Core Values */}
      <Box py={20} bg="gray.50">
        <Wrapper variant="section">
          <VStack spacing={12} align="center">
            <VStack spacing={4} align="center" textAlign="center">
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="900"
                color="text.primary"
              >
                <chakra.span color="brand.primary">Our Core</chakra.span> Values
              </Text>
              <Text fontSize="lg" color="text.secondary" maxW="2xl">
                What makes us special and drives everything we do
              </Text>
            </VStack>

            <Flex
              direction={{ base: "column", lg: "row" }}
              gap={8}
              w="100%"
            >
              {[
                {
                  title: "Humans at the centre",
                  description: "We will strive to put people at the centre of our decisions, understand how these decisions affect their lives and experiences. We will do this in respect to product development, design, marketing, product/service offering and more!",
                  icon: "👥"
                },
                {
                  title: "Agile - Evolve and stay ahead",
                  description: "We want to be one step ahead of ourselves, our biggest competitor is the benchmark we've set for ourselves, we will strive to be better than who we were yesterday. This means constant improvement from each team member and department resulting in a positive and noticeable impact on our service, product, customer experience and overall perception of our brand.",
                  icon: "🚀"
                },
                {
                  title: "Passion and Potential",
                  description: "To be effective at the workplace, the impact we serve must align with your daily tasks, projects and ideas. We hold this impact close to our hearts as we make decisions, and fulfil our daily tasks to achieve this big vision.",
                  icon: "❤️"
                }
              ].map((value, index) => (
                <Card key={index} variant="elevated" flex={1} textAlign="center">
                  <VStack spacing={6}>
                    <Text fontSize="4xl">{value.icon}</Text>
                    <Text
                      fontSize="xl"
                      fontWeight="700"
                      color="brand.primary"
                    >
                      {value.title}
                    </Text>
                    <Text
                      fontSize="md"
                      lineHeight="1.7"
                      color="text.secondary"
                    >
                      {value.description}
                    </Text>
                  </VStack>
                </Card>
              ))}
            </Flex>
          </VStack>
        </Wrapper>
      </Box>

      {/* FAQs Section */}
      <Box py={20} id="FAQs">
        <Wrapper variant="section">
          <VStack spacing={12} align="center">
            <VStack spacing={4} align="center" textAlign="center">
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="900"
                color="text.primary"
              >
                Frequently Asked Questions
              </Text>
              <Text fontSize="lg" color="text.secondary" maxW="2xl">
                Got questions? We've got answers! Here are some common questions about our services.
              </Text>
            </VStack>

            <Accordion allowToggle w="100%" maxW="4xl">
              {[
                {
                  question: "How does this work?",
                  answer: "Each and every errand is fulfilled within 20 minutes of the scheduled hour. Implying that orders will only be fulfilled within the preferred schedules."
                },
                {
                  question: "Does Boiboi Food offer only food delivery?",
                  answer: "No, we also offer grocery delivery and errands service from your favorite local stores. No additional app downloads are required — search for the store and items of your choice directly within the Boiboi Food delivery app."
                },
                {
                  question: "Can I order with the app without having to use the delivery service?",
                  answer: "Yes, with BoiJump you can! Select 'Pickup' as your delivery option when you place your order, and the store will prepare it for you to pick up without you having to queue up."
                },
                {
                  question: "How long does it take to complete an order?",
                  answer: "The duration of order completion is based on the customer's requirements. We will always communicate with our customers when their task(s) is completed."
                },
                {
                  question: "What are the scheduled delivery periods?",
                  answer: "The scheduled periods are 10am, 12pm, 3pm, 6pm, 8pm"
                },
                {
                  question: "Are there extra charges?",
                  answer: "We provide the cost of our services upfront. However, if miscellaneous charges come up in the process of executing the errand task, we will update the price and inform you about the changes."
                },
                {
                  question: "What if I decide to cancel a request?",
                  answer: "Once we receive your order and assign and dispatch a delivery hero to the pickup point, we can no longer refund the cost to the customer. However, if canceled before dispatch, refunds come with a 20% deduction."
                }
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="12px"
                  mb={4}
                  bg="white"
                  _hover={{ borderColor: "brand.primary" }}
                  transition="border-color 0.2s ease"
                >
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton
                        _hover={{ bg: "gray.50" }}
                        py={6}
                        px={6}
                        borderRadius="12px"
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="700"
                            color="text.primary"
                          >
                            {faq.question}
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon
                            fontSize={{ base: "16px", md: "18px" }}
                            color="brand.primary"
                          />
                        ) : (
                          <AddIcon
                            fontSize={{ base: "16px", md: "18px" }}
                            color="brand.primary"
                          />
                        )}
                      </AccordionButton>
                      <AccordionPanel
                        pb={6}
                        px={6}
                        color="text.secondary"
                        fontSize="md"
                        lineHeight="1.6"
                      >
                        {faq.answer}
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Wrapper>
      </Box>

      {/* Footer */}
      <Footer />
    </>
  );
}

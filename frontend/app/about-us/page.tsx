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
      <Box 
        bg="brand.primary" 
        py={{ base: 12, md: 20 }} 
        color="white"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      >
        <Wrapper variant="section">
          <VStack spacing={{ base: 6, md: 8 }} align="center" textAlign="center" position="relative" zIndex={1}>
            <Badge colorScheme="white" variant="solid" px={{ base: 3, md: 4 }} py={{ base: 1.5, md: 2 }} borderRadius="full" fontSize={{ base: "sm", md: "md" }}>
              Our Story
            </Badge>
            <Text
              fontSize={{ base: "2xl", sm: "3xl", md: "5xl", lg: "6xl" }}
              fontWeight="900"
              lineHeight="1.2"
            >
              <chakra.span color="white">BOIBOI's</chakra.span> STORY
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              maxW="3xl"
              opacity={0.95}
              lineHeight="1.6"
              px={{ base: 4, md: 0 }}
            >
              Transforming campus life through efficient, sustainable, and technology-driven errand services
            </Text>
          </VStack>
        </Wrapper>
      </Box>

      {/* CEO Section */}
      <Box py={{ base: 12, md: 20 }} bg="gray.50">
        <Wrapper variant="section">
          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 8, md: 12 }}
            align="center"
          >
            <Card 
              variant="elevated" 
              p={0} 
              overflow="hidden" 
              maxW={{ base: "100%", md: "400px" }}
              w={{ base: "100%", md: "auto" }}
            >
              <Image
                src="/ore_.jpg"
                alt="CEO Idowu Oreoluwa"
                width="100%"
                height={{ base: "300px", md: "500px" }}
                objectFit="cover"
              />
              <Box p={{ base: 4, md: 6 }}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" color="text.primary" mb={2}>
                  Idowu Oreoluwa
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="500" color="brand.primary">
                  CEO, Boiboi Technologies
                </Text>
              </Box>
            </Card>

            <VStack spacing={{ base: 4, md: 6 }} align="start" flex={1} maxW="2xl">
              <Text fontSize={{ base: "md", md: "xl" }} lineHeight="1.8" color="text.primary">
                <chakra.span fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" color="brand.primary">
                  There
                </chakra.span>{" "}
                is a growing demand for convenience, which is predicated on the need to achieve efficiency and maximum productivity. Errands and logistics services are needed on campuses as they help students balance their growing and busy schedules, alongside the demand for convenience, saving them time and effort while affording them reduced stress and increased productivity.
              </Text>

              <Text fontSize={{ base: "sm", md: "lg" }} lineHeight="1.8" color="text.secondary">
                Also, with the current rise in the trend of the emergence of student entrepreneurs. Logistics seems to be the bane of this, and so logistic solutions help them scale and grow as their operational costs get reduced.
              </Text>

              <Card bg="brand.primary" color="white" p={{ base: 4, md: 6 }} w="100%">
                <VStack spacing={{ base: 3, md: 4 }} align="start">
                  <Text fontSize={{ base: "md", md: "lg" }} fontWeight="700">
                    Our Key Differentiators:
                  </Text>
                  <VStack spacing={{ base: 1.5, md: 2 }} align="start">
                    <Text fontSize={{ base: "sm", md: "md" }}>• Flexible, student-friendly scheduling</Text>
                    <Text fontSize={{ base: "sm", md: "md" }}>• Campus-specific expertise and student-focused services</Text>
                    <Text fontSize={{ base: "sm", md: "md" }}>• Customized errand services</Text>
                  </VStack>
                </VStack>
              </Card>
            </VStack>
          </Flex>
        </Wrapper>
      </Box>

      {/* Vision & Mission */}
      <Box py={{ base: 12, md: 20 }}>
        <Wrapper variant="section">
          <VStack spacing={{ base: 8, md: 12 }} align="center">
            <Text
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="900"
              textAlign="center"
              color="text.primary"
              px={{ base: 4, md: 0 }}
            >
              Our Vision & Mission
            </Text>

            <Flex
              direction={{ base: "column", md: "row" }}
              gap={{ base: 6, md: 8 }}
              w="100%"
            >
              <Card variant="elevated" flex={1} textAlign="center">
                <VStack spacing={{ base: 3, md: 4 }}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="700"
                    color="brand.primary"
                  >
                    Our Vision
                  </Text>
                  <Text fontSize={{ base: "sm", md: "lg" }} lineHeight="1.7" color="text.secondary">
                    To create a service-based company whose primary goal is to exceed customers' expectations by transforming their campus life through efficient, sustainable, and technology-driven errand services.
                  </Text>
                </VStack>
              </Card>

              <Card variant="elevated" flex={1} textAlign="center">
                <VStack spacing={{ base: 3, md: 4 }}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="700"
                    color="brand.primary"
                  >
                    Our Mission
                  </Text>
                  <Text fontSize={{ base: "sm", md: "lg" }} lineHeight="1.7" color="text.secondary">
                    To deliver exceptional value to students, faculty, and staff. Also to ease distribution and transportation of goods of campus-based and student-led SMEs within the shortest period as we provide them with an environmentally friendly and expedient delivery service, therefore affording them the opportunity for growth and scalability.
                  </Text>
                </VStack>
              </Card>
            </Flex>
          </VStack>
        </Wrapper>
      </Box>

      {/* Core Values */}
      <Box py={{ base: 12, md: 20 }} bg="gray.50">
        <Wrapper variant="section">
          <VStack spacing={{ base: 8, md: 12 }} align="center">
            <VStack spacing={{ base: 3, md: 4 }} align="center" textAlign="center">
              <Text
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="900"
                color="text.primary"
                px={{ base: 4, md: 0 }}
              >
                <chakra.span color="brand.primary">Our Core</chakra.span> Values
              </Text>
              <Text fontSize={{ base: "sm", md: "lg" }} color="text.secondary" maxW="2xl" px={{ base: 4, md: 0 }}>
                What makes us special and drives everything we do
              </Text>
            </VStack>

            <Flex
              direction={{ base: "column", lg: "row" }}
              gap={{ base: 6, md: 8 }}
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
                  <VStack spacing={{ base: 4, md: 6 }}>
                    <Text fontSize={{ base: "3xl", md: "4xl" }}>{value.icon}</Text>
                    <Text
                      fontSize={{ base: "lg", md: "xl" }}
                      fontWeight="700"
                      color="brand.primary"
                    >
                      {value.title}
                    </Text>
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
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
      <Box py={{ base: 12, md: 20 }} id="FAQs">
        <Wrapper variant="section">
          <VStack spacing={{ base: 8, md: 12 }} align="center">
            <VStack spacing={{ base: 3, md: 4 }} align="center" textAlign="center">
              <Text
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="900"
                color="text.primary"
                px={{ base: 4, md: 0 }}
              >
                Frequently Asked Questions
              </Text>
              <Text fontSize={{ base: "sm", md: "lg" }} color="text.secondary" maxW="2xl" px={{ base: 4, md: 0 }}>
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
                        py={{ base: 4, md: 6 }}
                        px={{ base: 4, md: 6 }}
                        borderRadius="12px"
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            fontSize={{ base: "sm", md: "md", lg: "lg" }}
                            fontWeight="700"
                            color="text.primary"
                          >
                            {faq.question}
                          </Text>
                        </Box>
                        {isExpanded ? (
                          <MinusIcon
                            fontSize={{ base: "14px", md: "16px", lg: "18px" }}
                            color="brand.primary"
                          />
                        ) : (
                          <AddIcon
                            fontSize={{ base: "14px", md: "16px", lg: "18px" }}
                            color="brand.primary"
                          />
                        )}
                      </AccordionButton>
                      <AccordionPanel
                        pb={{ base: 4, md: 6 }}
                        px={{ base: 4, md: 6 }}
                        color="text.secondary"
                        fontSize={{ base: "sm", md: "md" }}
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

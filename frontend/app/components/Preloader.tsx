"use client";

import { Box, Image, keyframes } from "@chakra-ui/react";

const fade = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

export default function Preloader() {
  return (
    <Box position="fixed" inset={0} display="flex" alignItems="center" justifyContent="center" bg="white" zIndex={1000}>
      <Image src="/Boiboi (Palatinate blue).png" alt="Boiboi" w="220px" h="70px" animation={`${fade} 1.6s ease-in-out infinite`} />
    </Box>
  );
}



"use client";

import { Box, keyframes } from "@chakra-ui/react";
import Image from "next/image";

const fade = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

export default function Preloader() {
  return (
    <Box position="fixed" inset={0} display="flex" alignItems="center" justifyContent="center" bg="white" zIndex={1000}>
      <Box 
        w="220px" 
        h="70px" 
        position="relative"
        sx={{
          animation: `${fade} 1.6s ease-in-out infinite`
        }}
      >
        <Image 
          src="/Boiboi (Palatinate blue).png" 
          alt="Boiboi" 
          fill
          priority
          style={{ objectFit: "contain" }}
        />
      </Box>
    </Box>
  );
}



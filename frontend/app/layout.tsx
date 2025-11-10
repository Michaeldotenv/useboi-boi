import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Preloader from "./components/Preloader";
import GlobalNavigationLayout from "./components/GlobalNavigationLayout";
import { Suspense } from "react";
// import ClientSetup from "./components/ClientSetup";

// Font configurations
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boiboi",
  description: "Delivery services",
  icons:{
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <Suspense fallback={<Preloader />}>
            <GlobalNavigationLayout>
              {children}
            </GlobalNavigationLayout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}

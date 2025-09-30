import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Preloader from "./components/Preloader";
import { Suspense } from "react";
// import ClientSetup from "./components/ClientSetup";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={<Preloader />}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}

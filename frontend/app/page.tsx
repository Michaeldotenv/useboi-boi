
"use client"
import { Box } from "@chakra-ui/react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HeroSection from "./components/sections/HeroSection";
import LocationSelector from "./components/sections/LocationSelector";
import FeaturedStores from "./components/sections/FeaturedStores";
import PopularCategories from "./components/sections/PopularCategories";
import PromotionalBanners from "./components/sections/PromotionalBanners";
import RecentOrders from "./components/sections/RecentOrders";
import AppDownload from "./components/sections/AppDownload";
import HeroWithImage from "./components/sections/HeroWithImage";
import Head from "next/head";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useColorModeValue } from "@chakra-ui/react";
import FeaturesSection from "./components/sections/FeaturesSection";
import FoodDeliverySection from "./components/sections/FoodDeliverySection";

type Vendor = { id: string; name: string; logoUrl?: string; coverImage?: string; rating?: number };
type Order = { id: string; status: string; createdAt?: string; vendorName?: string };

export default function LandingPage() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const [me, setMe] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [meRes, vendorsRes] = await Promise.allSettled([
          api.me() as Promise<any>,
          api.vendors() as Promise<Vendor[]>,
        ]);
        if (mounted && meRes.status === 'fulfilled') setMe(meRes.value);
        if (mounted && vendorsRes.status === 'fulfilled') setVendors(vendorsRes.value || []);
        if (mounted && meRes.status === 'fulfilled' && meRes.value?.id) {
          try {
            const myOrders = await api.ordersByCustomer(meRes.value.id);
            if (Array.isArray(myOrders)) setOrders(myOrders as Order[]);
          } catch {}
        }
      } catch {}
      finally {
        if (mounted) setLoading(false);
      }
    })();
    
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => void 0,
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
      );
    }
    return () => { mounted = false };
  }, []);

  return (
    <Box bg={bg}>
      <Head>
        <title>Boiboi | Food, Errands, and Local Stores near you</title>
        <meta name="description" content="Order from local stores, track deliveries, and run errands with Boiboi." />
      </Head>
      
      <Navigation />
      <HeroSection />
      <LocationSelector coords={coords} setCoords={setCoords} />
      <FeaturedStores vendors={vendors} loading={loading} />
      <PopularCategories loading={loading} />
      <PromotionalBanners />
      {me && <RecentOrders orders={orders} />}
      <AppDownload />
      <HeroWithImage />
      <FeaturesSection />
      <FoodDeliverySection />
      <Footer />
    </Box>
  );
}
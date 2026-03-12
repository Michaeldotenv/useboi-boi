
"use client"

import { useState } from "react"
import Navigation from "./components/Navigation";
import HeroSection from "./components/sections/HeroSection";
import PromotionalBanners from "./components/sections/PromotionalBanners";
import PopularCategories from "./components/sections/PopularCategories";
import FeaturedStores from "./components/sections/FeaturedStores";
import FoodDeliverySection from "./components/sections/FoodDeliverySection";
import Testimonials from "./components/sections/Testimonials";
import FeaturesSection from "./components/sections/FeaturesSection";
import HeroWithImage from "./components/sections/HeroWithImage";
import Footer from "./components/Footer";
// import FeatureSection from "./components/sections/FeatureSection";
import DiscoverSection from "./components/sections/DiscoverSection";

export default function Page() {
  const mockVendors = [
    {
      id: "1",
      name: "Pizza Palace",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Burger Barn",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.6,
    },
    {
      id: "3",
      name: "Sushi Supreme",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.9,
    },
    {
      id: "4",
      name: "Taco Tuesday",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.7,
    },
    {
      id: "5",
      name: "Pasta Paradise",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.5,
    },
    {
      id: "6",
      name: "Chicken Coop",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.8,
    },
    {
      id: "7",
      name: "Salad Station",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.4,
    },
    {
      id: "8",
      name: "Dessert Delight",
      logoUrl: "/Food-item-1.jpeg",
      coverImage: "/Food-item-1.jpeg",
      rating: 4.9,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <DiscoverSection />
      <PromotionalBanners />
      <PopularCategories loading={false} />
      <FeaturedStores vendors={mockVendors} loading={false} />
      <FoodDeliverySection />
      <Testimonials />
      <FeaturesSection />
      <HeroWithImage />
      <Footer />
    </div>
  )
}

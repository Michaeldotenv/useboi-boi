"use client"

import { motion } from "framer-motion"
import { Zap, Award, TrendingUp } from "lucide-react"

const BannerCard = ({ icon: Icon, title, description, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -4 }}
    className="group rounded-2xl border border-purple-100 bg-white p-8 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all"
  >
    <motion.div
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.6 }}
      className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
    >
      <Icon className="h-6 w-6 text-purple-600" />
    </motion.div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
)

export default function PromotionalBanners() {
  const banners = [
    {
      icon: Award,
      title: "Best Quality Guarantee",
      description: "We partner with top-rated restaurants to ensure every meal meets our strict quality standards.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Delivery",
      description: "30-minute delivery guarantee. If it takes longer, your meal is free. That's our promise!",
    },
    {
      icon: TrendingUp,
      title: "Exclusive Deals Daily",
      description: "Get 20-50% off on your favorite restaurants. New deals every day, just for you!",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose FoodHub?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the best food delivery service with guaranteed quality, speed, and savings
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {banners.map((banner, i) => (
            <BannerCard key={i} {...banner} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

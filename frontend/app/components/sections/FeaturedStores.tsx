"use client"

import { motion } from "framer-motion"
import { Star, Bike } from "lucide-react"
import { ArrowRight } from "lucide-react"

type Vendor = {
  id: string
  name: string
  logoUrl?: string
  coverImage?: string
  rating?: number
}

type Props = {
  vendors: Vendor[]
  loading: boolean
}

export default function FeaturedStores({ vendors, loading }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
  }

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">Top Picks</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Featured Restaurants</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the best restaurants near you. From local favorites to trending hotspots.
          </p>
        </motion.div>

        {/* Stores Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {vendors.map((vendor, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group rounded-2xl border border-purple-100 overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-purple-300 transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={vendor.coverImage || "/placeholder.svg?height=200&width=300&query=restaurant"}
                  alt={vendor.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Delivery Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Bike className="h-3 w-3" />
                  20-30 min
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {vendor.rating?.toFixed(1) || "4.5"}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{vendor.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">🍽️ Multi-Cuisine • ₦500 delivery</p>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold h-10">
                    Order Now
                  </button>
                  <button
                   
                    className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 font-bold h-10 bg-transparent"
                  >
                    Menu
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All button */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center">
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold h-12 px-8">
            View All Restaurants
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

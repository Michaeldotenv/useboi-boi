"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Anderson",
    role: "Regular Customer",
    text: "FoodHub has completely changed how I order food. Fast, reliable, and the restaurants are always amazing!",
    rating: 5,
    avatar: "🧑‍🦰",
  },
  {
    name: "James Chen",
    role: "Food Enthusiast",
    text: "The variety of restaurants is incredible. I've discovered so many new places thanks to FoodHub's recommendations.",
    rating: 5,
    avatar: "👨‍💼",
  },
  {
    name: "Emma Wilson",
    role: "Busy Professional",
    text: "When I'm swamped with work, FoodHub is a lifesaver. Delivery is always on time and food arrives hot!",
    rating: 5,
    avatar: "👩‍💻",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">Loved by Users</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-purple-100 bg-white p-8 shadow-sm hover:shadow-lg transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

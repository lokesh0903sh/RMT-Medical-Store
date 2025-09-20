import React from 'react'
import Product from '../Product/Product'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RMTStore from '../assets/RMT_Medical_Store.png'
import TopCategories from '../components/TopCategories'
import RMTStoreTransparent from '../assets/RMT_Medical_Store_Transparent.png'
import Capsule1 from '../assets/capsule1.png.png'
import Capsule2 from '../assets/capsule2.png.png'
import Capsule3 from '../assets/capsule3.png.png'
import Capsule4 from '../assets/capsule4.png.png'

const HeroSection = () => {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-12 sm:mb-16 gap-6 lg:gap-8">
        <motion.div 
          className="w-full lg:w-1/2 text-center lg:text-left px-4 lg:px-0"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] leading-tight mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Health Is Our <span className="text-[#1fa9be] dark:text-white">Priority</span>
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome to RMT Medical Store, your trusted source for quality healthcare products and medications. We care about your wellbeing.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/products" className="inline-block bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-lg shadow-[#036372]/20 dark:shadow-[#1fa9be]/20 transition-all transform hover:-translate-y-1 w-full sm:w-auto text-center">
                Browse Products
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/query-form" className="inline-block border-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-800 font-semibold px-6 sm:px-8 py-3 rounded-lg transition-all w-full sm:w-auto text-center">
                Medical Queries
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div 
          className="w-full lg:w-1/2 relative px-4 lg:px-0 mt-8 lg:mt-0"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Main hero image */}
          <motion.div 
            className="relative max-w-xs sm:max-w-sm lg:max-w-md mx-auto"
            animate={{
              y: [-5, 5, -5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.img 
              src={RMTStoreTransparent} 
              alt="RMT Medical Store" 
              className="w-full rounded-2xl relative z-10 cursor-pointer"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(3, 99, 114, 0.15)) drop-shadow(0 4px 10px rgba(3, 99, 114, 0.1))',
              }}
              initial={{ scale: 0.85, rotate: -4, y: 20, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: -2,
                y: 0,
                opacity: 1,
                filter: [
                  'drop-shadow(0 10px 25px rgba(3, 99, 114, 0.15)) drop-shadow(0 4px 10px rgba(3, 99, 114, 0.1))',
                  'drop-shadow(0 15px 35px rgba(31, 169, 190, 0.2)) drop-shadow(0 6px 15px rgba(3, 99, 114, 0.15))',
                  'drop-shadow(0 10px 25px rgba(3, 99, 114, 0.15)) drop-shadow(0 4px 10px rgba(3, 99, 114, 0.1))'
                ]
              }}
              whileHover={{ 
                scale: 1.08, 
                rotate: 1,
                y: -8,
                filter: 'drop-shadow(0 25px 50px rgba(31, 169, 190, 0.3)) drop-shadow(0 12px 25px rgba(3, 99, 114, 0.25))',
                transition: { 
                  duration: 0.5, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }
              }}
              whileTap={{ 
                scale: 0.95,
                rotate: -1,
                filter: 'drop-shadow(0 5px 15px rgba(3, 99, 114, 0.2))',
                transition: { duration: 0.1 }
              }}
              transition={{ 
                duration: 1.2,
                filter: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.8, delay: 0.3 }
              }}
            />
            
            {/* Floating capsule decorations with enhanced animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.img 
                src={Capsule1} 
                alt="Medical Capsule" 
                className="absolute top-2 left-2 sm:top-4 sm:left-4 w-5 h-5 sm:w-7 sm:h-7 opacity-50 sm:opacity-60"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(3, 99, 114, 0.2))'
                }}
                initial={{ y: 0, rotate: 0, scale: 0 }}
                animate={{ 
                  y: [-6, 8, -6],
                  rotate: [0, 360],
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                whileHover={{ scale: 1.4, opacity: 0.9, rotate: 180 }}
              />
              <motion.img 
                src={Capsule2} 
                alt="Medical Capsule" 
                className="absolute top-1/4 right-3 sm:right-6 w-4 h-4 sm:w-6 sm:h-6 opacity-40 sm:opacity-50"
                style={{
                  filter: 'drop-shadow(0 3px 6px rgba(31, 169, 190, 0.25))'
                }}
                initial={{ y: 0, rotate: 0, scale: 0 }}
                animate={{ 
                  y: [8, -10, 8],
                  rotate: [0, -360],
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                whileHover={{ scale: 1.4, opacity: 0.9, rotate: -180 }}
              />
              <motion.img 
                src={Capsule3} 
                alt="Medical Capsule" 
                className="absolute bottom-1/3 left-3 sm:left-6 w-5 h-5 sm:w-7 sm:h-7 opacity-55 sm:opacity-65"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(3, 99, 114, 0.2))'
                }}
                initial={{ y: 0, rotate: 0, scale: 0 }}
                animate={{ 
                  y: [-10, 12, -10],
                  rotate: [0, 180],
                  scale: [1, 1.2, 1],
                  opacity: [0.65, 0.85, 0.65]
                }}
                transition={{ 
                  duration: 4.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1.5
                }}
                whileHover={{ scale: 1.4, opacity: 0.9, rotate: 90 }}
              />
              <motion.img 
                src={Capsule4} 
                alt="Medical Capsule" 
                className="absolute bottom-6 right-2 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 opacity-45 sm:opacity-55"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(31, 169, 190, 0.3))'
                }}
                initial={{ y: 0, rotate: 0, scale: 0 }}
                animate={{ 
                  y: [6, -14, 6],
                  rotate: [0, -180],
                  scale: [1, 1.3, 1],
                  opacity: [0.55, 0.75, 0.55]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 2
                }}
                whileHover={{ scale: 1.4, opacity: 0.9, rotate: -90 }}
              />
            </div>
            
            {/* Subtle background glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-30"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(31, 169, 190, 0.1) 0%, transparent 70%)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Feature Cards */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <motion.h2 
          className="text-3xl font-bold text-center text-[#036372] dark:text-[#1fa9be] mb-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Why Choose Us
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              title: "Quality Products",
              description: "We source our medicines and products from trusted manufacturers only.",
              icon: "🏆",
              bgImage: Capsule1
            },
            {
              title: "Expert Consultation", 
              description: "Our pharmacists are available to answer your medical queries.",
              icon: "👨‍⚕️",
              bgImage: Capsule2
            },
            {
              title: "Fast Delivery",
              description: "Get your medicines delivered at your doorstep in no time.",
              icon: "🚚",
              bgImage: Capsule3
            }
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-[#036372] dark:border-[#1fa9be] relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background decoration */}
              <motion.div 
                className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              >
                <img 
                  src={feature.bgImage} 
                  alt="Medical decoration" 
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transform rotate-12"
                />
              </motion.div>
              
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#036372] dark:text-[#1fa9be] mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Featured Products */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
        >
          <h2 className="text-3xl font-bold text-[#036372] dark:text-[#1fa9be]">Featured Products</h2>
          <motion.div
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/products" className="text-[#1fa9be] hover:text-[#036372] dark:text-[#1fa9be] dark:hover:text-white font-medium">
              View All →
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
        >
          <Product/>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default HeroSection

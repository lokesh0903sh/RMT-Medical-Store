import React from 'react'
import Product from '../Product/Product'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div className="py-12">
      {/* Hero Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <div className="md:w-1/2">          <h1 className="text-4xl md:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] leading-tight mb-6">
            Your Health Is Our <span className="text-[#1fa9be] dark:text-white">Priority</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            Welcome to RMT Medical Store, your trusted source for quality healthcare products and medications. We care about your wellbeing.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white font-semibold px-8 py-3 rounded-lg shadow-lg shadow-[#036372]/20 dark:shadow-[#1fa9be]/20 transition-all transform hover:-translate-y-1">
              Browse Products
            </Link>
            <Link to="/query-form" className="border-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be] hover:bg-[#e0f7fa] dark:hover:bg-gray-800 font-semibold px-8 py-3 rounded-lg transition-all">
              Medical Queries
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="./src/assets/RMT_Medical_Store.png" 
            alt="RMT Medical Store" 
            className="w-full max-w-md mx-auto rounded-xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
          />
        </div>
      </div>
      
      {/* Feature Cards */}
      <div className="mb-16">        <h2 className="text-3xl font-bold text-center text-[#036372] dark:text-[#1fa9be] mb-10">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Quality Products",
              description: "We source our medicines and products from trusted manufacturers only.",
              icon: "🏆"
            },
            {
              title: "Expert Consultation",
              description: "Our pharmacists are available to answer your medical queries.",
              icon: "👨‍⚕️" 
            },
            {
              title: "Fast Delivery",
              description: "Get your medicines delivered at your doorstep in no time.",
              icon: "🚚"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-[#036372] dark:border-[#1fa9be]">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#036372] dark:text-[#1fa9be] mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Featured Products */}
      <div>        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#036372] dark:text-[#1fa9be]">Featured Products</h2>
          <Link to="/products" className="text-[#1fa9be] hover:text-[#036372] dark:text-[#1fa9be] dark:hover:text-white font-medium">
            View All →
          </Link>
        </div>
        <Product/>
      </div>
    </div>
  )
}

export default HeroSection
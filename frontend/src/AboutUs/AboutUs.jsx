import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

const AboutUs = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show button when user scrolls down
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300'>
      <NavBar />
      
      <motion.main 
        className='flex-grow container mx-auto px-4 py-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              About Us
            </motion.h1>
            <motion.div 
              className="h-1.5 w-24 bg-[#1fa9be] dark:bg-[#036372] mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            />
          </div>

          {/* Hero section with image */}
          <motion.div 
            className="flex flex-col md:flex-row gap-8 items-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="md:w-1/2">
              <motion.div
                className="rounded-2xl overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >                <img 
                  src="../src/assets/RMT_Medical_Store.png" 
                  alt="RMT Medical Store" 
                  className="w-full h-auto object-cover" 
                />
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                <span className="font-semibold text-[#036372] dark:text-[#1fa9be]">Greetings from RMT MEDICAL STORE</span>, the go-to online medical retailer that brings wellness and health right to your door.
              </p>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                We offer a large selection of authentic pharmaceutical items, over-the-counter medications, medical supplies, and wellness necessities. Our company was founded on the values of caring, dependability, and community involvement.
              </p>
            </div>
          </motion.div>

          {/* Our commitment */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-16"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#036372] dark:text-[#1fa9be] mb-6">Our Commitment</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              We recognise the value of prompt service and accessibility in the context of health. For this reason, we guarantee a fully stocked inventory, affordable costs, and timely support for each and every client who visits our store or makes an online purchase.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              At RMT MEDICAL STORE, we are committed to offering:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-[#e0f7fa] dark:bg-gray-700 p-6 rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#036372] dark:bg-[#1fa9be] p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Authentic Medicines</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">Sourced from licensed manufacturers and suppliers.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#e0f7fa] dark:bg-gray-700 p-6 rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#036372] dark:bg-[#1fa9be] p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Fast & Reliable Delivery</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">Across 10 km from our Location.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#e0f7fa] dark:bg-gray-700 p-6 rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#036372] dark:bg-[#1fa9be] p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Easy Prescription Upload</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">Verified dispensing by qualified pharmacists.</p>
              </motion.div>
              
              <motion.div 
                className="bg-[#e0f7fa] dark:bg-gray-700 p-6 rounded-xl"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#036372] dark:bg-[#1fa9be] p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Special Discounts & Offers</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">For regular customers.</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Our Services */}          <motion.div 
            className="mb-16"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#036372] dark:text-[#1fa9be] mb-8 text-center">Our Services Include</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Prescription Medicines",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#036372] dark:text-[#1fa9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  ),
                },
                {
                  title: "OTC Products & Health Supplements",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#036372] dark:text-[#1fa9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  ),
                },
                {
                  title: "First Aid & Personal Care Items",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#036372] dark:text-[#1fa9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ),
                },
                {
                  title: "Blood Pressure & Sugar Monitoring Devices",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#036372] dark:text-[#1fa9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  ),
                },
                {
                  title: "Free Home Delivery",
                  subtitle: "Available in selected areas",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#036372] dark:text-[#1fa9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  ),
                }
              ].map((service, index) => (
                <motion.div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {service.title}
                  </h3>
                  {service.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      ({service.subtitle})
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final message */}
          <motion.div 
            className="text-center max-w-3xl mx-auto bg-[#036372]/10 dark:bg-[#1fa9be]/10 p-8 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 italic">
              "Whether your goal is to keep healthy, replenish your family's first-aid supply, or manage a chronic illness, we are here to make your experience easy, safe, and stress-free."
            </p>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </motion.section>
      </motion.main>      
      <Footer />
      
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-[#036372] dark:bg-[#1fa9be] text-white p-3 rounded-full shadow-lg hover:bg-[#1fa9be] dark:hover:bg-[#036372] transition-colors z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AboutUs;

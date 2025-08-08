import React, { useState } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

const Help = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Show scroll to top button
  React.useEffect(() => {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const faqs = [
    {
      id: 1,
      question: "How can I place an order?",
      answer: "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. For prescription medicines, you'll need to upload a valid prescription during the checkout process."
    },
    {
      id: 2,
      question: "Do I need a prescription for all medicines?",
      answer: "No, only prescription medicines require a valid prescription. Over-the-counter (OTC) medicines, supplements, and healthcare products can be purchased without a prescription."
    },
    {
      id: 3,
      question: "What are your delivery areas?",
      answer: "We provide free home delivery within 10 km of our store location. For areas beyond this range, delivery charges may apply. Please check during checkout for delivery availability in your area."
    },
    {
      id: 4,
      question: "How long does delivery take?",
      answer: "Standard delivery takes 2-4 hours within our delivery zone. For urgent medicines, we offer express delivery within 1-2 hours (additional charges may apply)."
    },
    {
      id: 5,
      question: "Can I return medicines?",
      answer: "Due to safety regulations, medicines cannot be returned once delivered. However, if you receive damaged or incorrect items, please contact us immediately for replacement."
    },
    {
      id: 6,
      question: "How do I upload my prescription?",
      answer: "During checkout, you'll find an option to upload prescription. You can upload a clear photo or scan of your prescription. Our pharmacists will verify it before processing your order."
    },
    {
      id: 7,
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including cash on delivery, credit/debit cards, UPI, net banking, and digital wallets like Paytm, PhonePe, and Google Pay."
    },
    {
      id: 8,
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption to protect your personal and payment information. Your prescription details are kept confidential and only accessed by licensed pharmacists."
    },
    {
      id: 9,
      question: "Can I get medicine advice from your pharmacists?",
      answer: "Yes, our qualified pharmacists are available during business hours to answer your questions about medicines, dosages, and interactions. You can call us or use our medical query form."
    },
    {
      id: 10,
      question: "Do you offer discounts for regular customers?",
      answer: "Yes, we offer special discounts and loyalty programs for regular customers. You can also find seasonal offers and discounts on various products throughout the year."
    }
  ];

  const helpCategories = [
    {
      title: "Ordering & Payment",
      icon: "🛒",
      description: "Help with placing orders, payment methods, and checkout process",
      topics: ["Place an order", "Payment options", "Order tracking", "Invoice queries"]
    },
    {
      title: "Prescriptions",
      icon: "📋",
      description: "Information about prescription uploads and medicine verification",
      topics: ["Upload prescription", "Prescription guidelines", "Medicine verification", "Dosage questions"]
    },
    {
      title: "Delivery & Returns",
      icon: "🚚",
      description: "Delivery information, timings, and return policies",
      topics: ["Delivery areas", "Delivery timing", "Express delivery", "Return policy"]
    },
    {
      title: "Account & Profile",
      icon: "👤",
      description: "Manage your account, profile settings, and preferences",
      topics: ["Create account", "Update profile", "Change password", "Order history"]
    },
    {
      title: "Products & Availability",
      icon: "💊",
      description: "Information about our product range and stock availability",
      topics: ["Product catalog", "Stock updates", "New arrivals", "Substitute medicines"]
    },
    {
      title: "Technical Support",
      icon: "🔧",
      description: "Help with website issues, app problems, and technical queries",
      topics: ["Website issues", "App problems", "Login troubles", "Browser compatibility"]
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
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
        {/* Page Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4">
            Help Center
          </h1>
          <motion.div 
            className="h-1.5 w-24 bg-[#1fa9be] dark:bg-[#036372] mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to your questions and get the help you need. We're here to make your experience smooth and hassle-free.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help topics, FAQs, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 pr-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Help Categories */}
        {!searchQuery && (
          <motion.div 
            className="mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#036372] dark:text-[#1fa9be] text-center mb-10">
              Browse Help Topics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[#1fa9be] dark:hover:border-[#036372]"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-[#036372] dark:text-[#1fa9be] mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="space-y-1">
                    {category.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <span className="w-1.5 h-1.5 bg-[#036372] dark:bg-[#1fa9be] rounded-full mr-2"></span>
                        {topic}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#036372] dark:text-[#1fa9be] text-center mb-10">
            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Frequently Asked Questions'}
          </h2>
          
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 pr-4">
                    {faq.question}
                  </span>
                  <motion.svg
                    animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 text-[#036372] dark:text-[#1fa9be] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </motion.svg>
                </button>
                
                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t dark:border-gray-700"
                    >
                      <div className="px-6 py-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">No results found</p>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  Try different keywords or browse our help topics above
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors font-medium"
                >
                  Clear Search
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Contact Support */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          <div className="bg-[#036372]/10 dark:bg-[#1fa9be]/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white rounded-lg transition-colors font-medium"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-[#036372] dark:border-[#1fa9be] text-[#036372] dark:text-[#1fa9be] hover:bg-[#036372] dark:hover:bg-[#1fa9be] hover:text-white dark:hover:text-white rounded-lg transition-colors font-medium"
                onClick={() => window.location.href = 'tel:+919876543210'}
              >
                Call Us Now
              </motion.button>
            </div>
          </div>
        </motion.div>
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

export default Help;

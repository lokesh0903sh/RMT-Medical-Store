import React, { useState } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';
import { toast } from 'react-toastify';

const Contact = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Contact Us
          </h1>
          <motion.div 
            className="h-1.5 w-24 bg-[#1fa9be] dark:bg-[#036372] mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're here to help! Get in touch with us for any questions, concerns, or medical assistance you need.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-[#036372] dark:text-[#1fa9be] mb-8">Get In Touch</h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <motion.div 
                    className="flex items-start space-x-4"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-[#036372] dark:bg-[#1fa9be] p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Our Address</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        RMT Medical Store<br />
                        123 Healthcare Avenue<br />
                        Medical District, City - 110001
                      </p>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    className="flex items-start space-x-4"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-[#036372] dark:bg-[#1fa9be] p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Phone Number</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        +91 98765 43210<br />
                        +91 11 2345 6789 (Landline)
                      </p>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div 
                    className="flex items-start space-x-4"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-[#036372] dark:bg-[#1fa9be] p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Email Address</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        info@rmtmedicalstore.com<br />
                        support@rmtmedicalstore.com
                      </p>
                    </div>
                  </motion.div>

                  {/* Working Hours */}
                  <motion.div 
                    className="flex items-start space-x-4"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-[#036372] dark:bg-[#1fa9be] p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Working Hours</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Monday - Saturday: 8:00 AM - 10:00 PM<br />
                        Sunday: 9:00 AM - 8:00 PM<br />
                        <span className="text-[#036372] dark:text-[#1fa9be] font-medium">Emergency: 24/7</span>
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Emergency Notice */}
                <motion.div 
                  className="mt-8 p-4 bg-[#036372]/10 dark:bg-[#1fa9be]/10 rounded-xl border-l-4 border-[#036372] dark:border-[#1fa9be]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <p className="text-[#036372] dark:text-[#1fa9be] font-medium text-sm">
                    <strong>Emergency Services:</strong> For urgent medical needs, call our 24/7 helpline or visit our store directly.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-[#036372] dark:text-[#1fa9be] mb-8">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-[#1fa9be] dark:focus:border-[#036372] focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors resize-none"
                      placeholder="Please describe your query or concern in detail..."
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </div>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
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

export default Contact;

import React, { useState, useEffect } from 'react';
import { motion } from '../lib/motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

function MedicalQueryForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    hasPrescription: false,
    purchaseWithoutPrescription: false,
    productList: '',
    message: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    
    setErrorMsg('');
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
    
    // If unchecking the prescription checkbox, clear prescription error
    if (name === 'hasPrescription' && !checked && formErrors.prescription) {
      setFormErrors({ ...formErrors, prescription: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Clear prescription error if it exists
    if (formErrors.prescription) {
      setFormErrors({ ...formErrors, prescription: '' });
    }
    
    if (selectedFile) {
      // Check file size (5MB limit)
      const fileSizeInMB = selectedFile.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        const errorMsg = 'File size exceeds 5MB limit. Please select a smaller file.';
        setFormErrors({ ...formErrors, prescription: errorMsg });
        setErrorMsg(errorMsg);
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        const errorMsg = 'Invalid file type. Please upload a JPG, PNG or PDF file.';
        setFormErrors({ ...formErrors, prescription: errorMsg });
        setErrorMsg(errorMsg);
        return;
      }
      
      // File is valid
      setFile(selectedFile);
      setErrorMsg('');
      
      // Show toast notification for successful file selection
      toast.success(`File "${selectedFile.name}" selected successfully`, {
        autoClose: 2000,
        position: 'bottom-right'
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const { fullName, phone, email, message } = formData;
    
    // Validate full name
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    // Validate phone
    if (!phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Validate email
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate message
    if (!message.trim()) {
      errors.message = 'Message is required';
    }
    
    // Validate prescription file
    if (formData.hasPrescription && !file) {
      errors.prescription = 'Please upload your prescription';
    }
    
    setFormErrors(errors);
    
    // If there are any errors, show the general error message
    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please correct the errors in the form.');
      return false;
    }
    
    return true;
  };

  // Add effect to scroll to errors when they exist
  useEffect(() => {
    if (Object.keys(formErrors).length > 0 && isSubmitted) {
      const firstErrorField = document.querySelector('.field-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [formErrors, isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    // Create a new FormData instance
    const data = new FormData();
    
    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      // Convert boolean values to yes/no strings as expected by the backend
      const value = typeof formData[key] === 'boolean' 
        ? (formData[key] ? 'yes' : 'no') 
        : formData[key];
      
      data.append(key, value);
    });
    
    // Append file if prescription is selected
    if (formData.hasPrescription && file) {
      data.append('prescriptionFile', file);
    }

    try {
      // Show optimistic loading state
      const loadingToast = toast.loading("Submitting your query...");
      
      // Use the centralized API configuration
      const response = await api.post('/api/medical-query', data);  
      
      const responseData = response.data;

      // Update loading toast to success
      toast.update(loadingToast, {
        render: 'Your query has been submitted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });
      
      // Also set success message in the form
      setSuccessMsg('Your medical query has been submitted successfully. We will respond as soon as possible.');
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        hasPrescription: false,
        purchaseWithoutPrescription: false,
        productList: '',
        message: ''
      });
      setFile(null);
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      
      // Get the most specific error message possible
      let errorMessage;
      
      if (err.response) {
        // Axios error
        errorMessage = err.response.data?.error || err.response.data?.message || `Error ${err.response.status}: ${err.response.statusText}`;
        console.error('Response error data:', err.response.data);
      } else if (err.message) {
        // Regular Error object
        errorMessage = err.message;
      } else {
        // Fallback
        errorMessage = 'Submission failed. Please try again.';
      }
      
      // Update loading toast to error
      toast.update(loadingToast, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });
      
      setErrorMsg(errorMessage);
      
      // If there's a network error, give more specific advice
      if (err.code === 'ERR_NETWORK') {
        setErrorMsg('Network error: Please check your internet connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {/* Page loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-[#036372] dark:text-[#1fa9be]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Submitting your query...</p>
            </div>
          </div>
        )}
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-[#036372]/10 dark:shadow-[#1fa9be]/10 mt-10 border border-gray-100 dark:border-gray-700">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-6 text-center text-[#036372] dark:text-[#1fa9be]"
          >
            MEDICAL QUERY FORM
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 text-center mb-8"
          >
            Let us know what medicines you're looking for and our team will assist you.
          </motion.p>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>{errorMsg}</p>
              </div>
            </motion.div>
          )}
          
          {successMsg && (
            <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-6 rounded">
              <p>{successMsg}</p>
            </div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                aria-invalid={!!formErrors.fullName}
                aria-describedby={formErrors.fullName ? "fullName-error" : undefined}
                className={`w-full p-3 border ${formErrors.fullName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent`}
              />
              {formErrors.fullName && (
                <p id="fullName-error" className="mt-1 text-sm text-red-600 dark:text-red-400 field-error">{formErrors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765-43210"
                value={formData.phone}
                onChange={handleChange}
                aria-invalid={!!formErrors.phone}
                aria-describedby={formErrors.phone ? "phone-error" : undefined}
                className={`w-full p-3 border ${formErrors.phone ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent`}
              />
              {formErrors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400 field-error">{formErrors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                className={`w-full p-3 border ${formErrors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent`}
              />
              {formErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400 field-error">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#e0f7fa]/30 dark:bg-gray-700/30">
                <input
                  id="hasPrescription"
                  type="checkbox"
                  name="hasPrescription"
                  checked={formData.hasPrescription}
                  onChange={handleCheckbox}
                  className="w-4 h-4 rounded focus:ring-[#036372] dark:focus:ring-[#1fa9be] text-[#036372] dark:text-[#1fa9be]"
                />
                <label htmlFor="hasPrescription" className="text-gray-700 dark:text-gray-300">
                  I have a prescription to upload
                </label>
              </div>

              {formData.hasPrescription && (
                <div className={`bg-[#e0f7fa]/20 dark:bg-gray-700/20 p-4 rounded-lg border border-dashed ${formErrors.prescription ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}>
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <svg className="w-8 h-8 mb-3 text-[#036372] dark:text-[#1fa9be]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span className="mb-2 text-sm text-gray-700 dark:text-gray-300">Click to upload prescription</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG or PNG (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      aria-invalid={!!formErrors.prescription}
                      aria-describedby={formErrors.prescription ? "prescription-error" : undefined}
                      className="hidden"
                    />
                  </label>
                  {formErrors.prescription && (
                    <p id="prescription-error" className="mt-2 text-sm text-red-600 dark:text-red-400 text-center field-error">{formErrors.prescription}</p>
                  )}
                  {file && (
                    <div className="mt-3 p-2 bg-[#e0f7fa]/50 dark:bg-gray-700/50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-[#036372] dark:text-[#1fa9be] flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {file.name}
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-[#e0f7fa]/30 dark:bg-gray-700/30">
                <input
                  id="purchaseWithoutPrescription"
                  type="checkbox"
                  name="purchaseWithoutPrescription"
                  checked={formData.purchaseWithoutPrescription}
                  onChange={handleCheckbox}
                  className="w-4 h-4 rounded focus:ring-[#036372] dark:focus:ring-[#1fa9be] text-[#036372] dark:text-[#1fa9be]"
                />
                <label htmlFor="purchaseWithoutPrescription" className="text-gray-700 dark:text-gray-300">
                  I want to purchase without prescription (if applicable)
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="productList" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">List of Products</label>
              <textarea
                id="productList"
                name="productList"
                placeholder="Enter the names of medicines you wish to purchase"
                value={formData.productList}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Message *</label>
              <textarea
                id="message"
                name="message"
                placeholder="Please share any additional information about your requirements"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                aria-invalid={!!formErrors.message}
                aria-describedby={formErrors.message ? "message-error" : undefined}
                className={`w-full p-3 border ${formErrors.message ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent`}
              ></textarea>
              {formErrors.message && (
                <p id="message-error" className="mt-1 text-sm text-red-600 dark:text-red-400 field-error">{formErrors.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">* Required fields</p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Query'}
            </motion.button>
          </motion.form>

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-green-600 text-center mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-medium">Success!</span>
              </div>
              <p>Your query has been submitted successfully.</p>
              {formData.email && <p className="mt-1 text-sm">A receipt will be sent to your email.</p>}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MedicalQueryForm;

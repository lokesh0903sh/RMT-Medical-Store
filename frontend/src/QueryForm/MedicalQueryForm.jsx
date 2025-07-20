import React, { useState } from 'react';

// Use VITE_API_BASE_URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

function MedicalQueryForm() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');  
  };

  const handleCheckbox = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const validateForm = () => {
    const { fullName, phone, email, message } = formData;
    if (!fullName || !phone || !email || !message) {
      setErrorMsg('Please fill out all required fields.');
      return false;
    }
    if (formData.hasPrescription && !file) {
      setErrorMsg('Please upload your prescription.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, typeof formData[key] === 'boolean' ? (formData[key] ? 'yes' : 'no') : formData[key])
    );
    if (formData.hasPrescription && file) {
      data.append('prescriptionFile', file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-auth-token': localStorage.getItem('token')
          // Note: Do not set Content-Type for FormData, browser will set it with the boundary
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed. Please try again.');
      }

      const res = await response.json();
      setSuccessMsg('Form submitted successfully!');
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
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-[#036372]/10 dark:shadow-[#1fa9be]/10 mt-10 border border-gray-100 dark:border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#036372] dark:text-[#1fa9be]">MEDICAL QUERY FORM</h2>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">Let us know what medicines you're looking for and our team will assist you.</p>

      {errorMsg && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
          <p>{errorMsg}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-6 rounded">
          <p>{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="+91 98765-43210"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent"
          />        </div>

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
            <div className="bg-[#e0f7fa]/20 dark:bg-gray-700/20 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
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
                  className="hidden"
                />
              </label>
              {file && (
                <div className="mt-3 text-sm text-[#036372] dark:text-[#1fa9be]">
                  File selected: {file.name}
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#036372] dark:focus:ring-[#1fa9be] focus:border-transparent"
          ></textarea>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">* Required fields</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white py-3 px-6 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
        </button>
      </form>

      {successMsg && (
  <div className="text-green-600 text-center mt-6">
    Your query has been submitted successfully. {formData.email && "A receipt will be sent to your email."}
  </div>
)}

    </div>
  );
}

export default MedicalQueryForm;

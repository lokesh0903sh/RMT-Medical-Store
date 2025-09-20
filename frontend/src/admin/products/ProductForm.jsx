import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: '',
    subCategory: '',
    stock: '',
    sku: '',
    manufacturer: '',
    requiresPrescription: false,
    dosage: '',
    featured: false,
    // New fields
    dosageForm: '',
    packageSize: '',
    storage: '',
    countryOfOrigin: 'India',
    uses: [],
    symptoms: [],
    sideEffects: [],
    precautions: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [multipleImages, setMultipleImages] = useState([]);
  const [multipleImagePreviews, setMultipleImagePreviews] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(isEditMode);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const multipleImageInputRef = useRef(null);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Could not load categories');
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchProductData = async () => {
    try {
      setFetchingProduct(true);
      const response = await api.get(`/api/products/${id}`);
      
      const product = response.data;
      
      // Set form data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        mrp: product.mrp || '',
        category: product.category?._id || '',
        subCategory: product.subCategory || '',
        stock: product.stock || '',
        sku: product.sku || '',
        manufacturer: product.manufacturer || '',
        requiresPrescription: product.requiresPrescription || false,
        dosage: product.dosage || '',
        featured: product.featured || false,
        // New fields
        dosageForm: product.dosageForm || '',
        packageSize: product.packageSize || '',
        storage: product.storage || '',
        countryOfOrigin: product.countryOfOrigin || 'India',
        uses: product.uses || [],
        symptoms: product.symptoms || [],
        sideEffects: product.sideEffects || [],
        precautions: product.precautions || ''
      });
      
      // Set image preview if product has an image
      if (product.imageUrl) {
        // Check if it's a Cloudinary URL or local path
        const imageUrl = product.imageUrl.startsWith('http') 
          ? product.imageUrl 
          : `${api.defaults.baseURL}/${product.imageUrl}`;
        setImagePreview(imageUrl);
      }

      // Set additional images if product has them
      if (product.additionalImages && product.additionalImages.length > 0) {
        const additionalImageUrls = product.additionalImages.map(imageUrl => 
          imageUrl.startsWith('http') 
            ? imageUrl 
            : `${api.defaults.baseURL}/${imageUrl}`
        );
        setExistingAdditionalImages(additionalImageUrls);
        setMultipleImagePreviews(additionalImageUrls);
        // Note: We don't set multipleImages as those are File objects for new uploads
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Could not load product data');
      navigate('/admin/products');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Validate each file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxFiles = 5; // Limit to 5 additional images total
    
    // Check if adding these files would exceed the limit
    const totalExistingImages = existingAdditionalImages.length + multipleImages.length;
    if (totalExistingImages + files.length > maxFiles) {
      toast.error(`You can only have up to ${maxFiles} additional images total. Currently you have ${totalExistingImages}.`);
      return;
    }
    
    const validFiles = [];
    const previews = [];
    
    files.forEach((file, index) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${index + 1}: Invalid file type. Please upload JPEG or PNG images.`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${index + 1}: File is too large. Maximum size is 5MB.`);
        return;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          // Append new previews to existing ones
          setMultipleImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Append new files to existing ones
    setMultipleImages(prev => [...prev, ...validFiles]);
    
    // Reset the file input
    if (multipleImageInputRef.current) {
      multipleImageInputRef.current.value = '';
    }
  };

  const removeMultipleImage = (index) => {
    const totalPreviews = multipleImagePreviews.length;
    const existingCount = existingAdditionalImages.length;
    
    if (index < existingCount) {
      // Removing an existing image
      const newExistingImages = existingAdditionalImages.filter((_, i) => i !== index);
      setExistingAdditionalImages(newExistingImages);
      
      // Update previews to reflect removal
      const newPreviews = [...newExistingImages, ...multipleImagePreviews.slice(existingCount)];
      setMultipleImagePreviews(newPreviews);
    } else {
      // Removing a newly uploaded image
      const newImageIndex = index - existingCount;
      const newImages = multipleImages.filter((_, i) => i !== newImageIndex);
      setMultipleImages(newImages);
      
      // Update previews
      const newPreviews = [...existingAdditionalImages, ...multipleImagePreviews.slice(existingCount).filter((_, i) => i !== newImageIndex)];
      setMultipleImagePreviews(newPreviews);
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'description', 'price', 'mrp', 'category', 'stock'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    if (parseFloat(formData.price) <= 0 || parseFloat(formData.mrp) <= 0) {
      toast.error('Price and MRP must be greater than zero');
      return false;
    }
    
    if (parseInt(formData.stock) < 0) {
      toast.error('Stock cannot be negative');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create form data for multipart/form-data (for image upload)
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          // Handle array fields
          formData[key].forEach(item => {
            formDataToSend.append(key, item);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append main image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      // Append multiple images
      multipleImages.forEach((file) => {
        formDataToSend.append('additionalImages', file);
      });

      // For edit mode, send which existing images to keep
      if (isEditMode) {
        existingAdditionalImages.forEach((imageUrl) => {
          formDataToSend.append('keepExistingImages', imageUrl);
        });
      }
      
      // Make API request using axios
      let response;
      if (isEditMode) {
        response = await api.put(`/api/products/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/api/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct || fetchingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-t-4 border-[#036372] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sub-Category
              </label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
              />
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              Additional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU (Stock Keeping Unit) - Optional
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter unique SKU or leave empty"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty to auto-generate or enter a unique identifier
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dosage Information
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                placeholder="e.g., 500mg, 5ml, etc."
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#036372] focus:ring-[#1fa9be] border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Requires Prescription
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#036372] focus:ring-[#1fa9be] border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Product
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0 h-24 w-24 rounded border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1fa9be]">
                  <span>Upload image</span>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or WEBP up to 5MB
              </p>
            </div>
            
            {/* Multiple Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Images (Optional)
              </label>
              <div className="mt-1">
                <label className={`cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1fa9be] inline-flex items-center ${(existingAdditionalImages.length + multipleImages.length) >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{(existingAdditionalImages.length + multipleImages.length) >= 5 ? 'Maximum images reached' : 'Upload additional images'}</span>
                  <input 
                    ref={multipleImageInputRef}
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    multiple
                    disabled={(existingAdditionalImages.length + multipleImages.length) >= 5}
                    onChange={handleMultipleImagesChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload up to {5 - (existingAdditionalImages.length + multipleImages.length)} more images (JPG, PNG or WEBP up to 5MB each)
                </p>
              </div>
              
              {/* Multiple Image Previews */}
              {multipleImagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Images ({multipleImagePreviews.length}/5)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {multipleImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="h-20 w-20 rounded border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img 
                            src={preview} 
                            alt={`Additional preview ${index + 1}`} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMultipleImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Medical Information Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Medical Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dosage Form
                </label>
                <select
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                >
                  <option value="">Select Dosage Form</option>
                  {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Gel', 'Drops', 'Powder', 'Spray', 'Other'].map(form => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Package Size
                </label>
                <input
                  type="text"
                  name="packageSize"
                  value={formData.packageSize}
                  onChange={handleChange}
                  placeholder="e.g., 10 tablets, 100ml"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Storage Instructions
                </label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  placeholder="e.g., Store in a cool, dry place"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uses (Separate with commas)
                </label>
                <textarea
                  name="uses"
                  value={formData.uses.join(', ')}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      uses: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    });
                  }}
                  placeholder="e.g., Pain relief, Fever reduction, Anti-inflammatory"
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symptoms Treated (Separate with commas)
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms.join(', ')}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      symptoms: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    });
                  }}
                  placeholder="e.g., Headache, Fever, Muscle pain"
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Side Effects (Separate with commas)
                </label>
                <textarea
                  name="sideEffects"
                  value={formData.sideEffects.join(', ')}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      sideEffects: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    });
                  }}
                  placeholder="e.g., Drowsiness, Nausea, Dizziness"
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precautions
                </label>
                <textarea
                  name="precautions"
                  value={formData.precautions}
                  onChange={handleChange}
                  placeholder="Enter any precautions or warnings"
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1fa9be]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading 
                  ? 'bg-[#1fa9be]/70 dark:bg-[#036372]/70 cursor-not-allowed' 
                  : 'bg-[#036372] dark:bg-[#1fa9be] hover:bg-[#1fa9be] dark:hover:bg-[#036372]'
              } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1fa9be]`}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;

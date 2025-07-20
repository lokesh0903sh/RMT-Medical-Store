import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    displayOrder: '',
    featured: false
  });
  
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategory, setFetchingCategory] = useState(isEditMode);
  const [fetchingParentCategories, setFetchingParentCategories] = useState(true);

  // Fetch parent categories when component mounts
  useEffect(() => {
    fetchParentCategories();
  }, []);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCategoryData();
    }
  }, [id]);

  const fetchParentCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      
      // If in edit mode, filter out the current category to prevent self-reference
      const filteredCategories = isEditMode 
        ? response.data.filter(cat => cat._id !== id)
        : response.data;
        
      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
      toast.error('Could not load parent categories');
    } finally {
      setFetchingParentCategories(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      setFetchingCategory(true);
      const response = await api.get(`/api/categories/${id}`);
      const category = response.data;
      
      // Set form data
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategory: category.parentCategory?._id || '',
        displayOrder: category.displayOrder || '',
        featured: category.featured || false
      });
      
      // Set image preview if category has an image
      if (category.imageUrl) {
        // For Cloudinary URLs, use as is
        const imageUrl = category.imageUrl.startsWith('http') 
          ? category.imageUrl 
          : `${api.defaults.baseURL}/${category.imageUrl}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      toast.error('Could not load category data');
      navigate('/admin/categories');
    } finally {
      setFetchingCategory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create form data for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      
      if (formData.parentCategory) {
        formDataToSend.append('parentCategory', formData.parentCategory);
      } else {
        formDataToSend.append('parentCategory', 'null'); // Explicitly set as null/root category
      }
      
      formDataToSend.append('displayOrder', formData.displayOrder || '0');
      formDataToSend.append('featured', formData.featured);
      
      // Append image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      // Make API request with axios
      let response;
      if (isEditMode) {
        response = await api.put(`/api/categories/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/api/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      const savedCategory = response.data;
      
      toast.success(`Category ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/admin/categories');
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategory) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-t-4 border-[#036372] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
      >
        {isEditMode ? 'Edit Category' : 'Add New Category'}
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                  placeholder="Enter category description"
                />
              </div>
              
              {/* Parent Category */}
              <div>
                <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                  disabled={fetchingParentCategories}
                >
                  <option value="">None (Root Category)</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to create a top-level category
                </p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Image
                </label>
                <div className="mt-1 flex items-center space-x-6">
                  {/* Image Preview */}
                  <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <svg
                        className="h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                    >
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Display Order */}
              <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Lower numbers will display first
                </p>
              </div>
              
              {/* Featured Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#036372] focus:ring-[#1fa9be] border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Category
                </label>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#036372] hover:bg-[#1fa9be] text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#036372] flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditMode ? 'Update Category' : 'Create Category'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CategoryForm;

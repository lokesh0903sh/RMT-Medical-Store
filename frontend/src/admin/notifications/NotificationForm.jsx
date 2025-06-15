import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';
import Select from 'react-select';

const NotificationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    recipientType: 'all',
    recipients: [], // For specific users
    link: '',
    expireDays: '30' // Default 30 days expiration
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingNotification, setFetchingNotification] = useState(isEditMode);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // Notification types
  const notificationTypes = [
    { value: 'info', label: 'Information', color: '#3498db' },
    { value: 'warning', label: 'Warning', color: '#f39c12' },
    { value: 'success', label: 'Success', color: '#2ecc71' },
    { value: 'error', label: 'Error', color: '#e74c3c' }
  ];

  // Recipient types
  const recipientTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'admin', label: 'Admins Only' },
    { value: 'specific', label: 'Specific Users' }
  ];

  // Fetch users for recipient selection
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch notification data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchNotificationData();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: { 'x-auth-token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      
      // Format users for react-select
      const formattedUsers = data.map(user => ({
        value: user._id,
        label: `${user.name} (${user.email})`,
        role: user.role
      }));
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Could not load users');
    } finally {
      setFetchingUsers(false);
    }
  };

  const fetchNotificationData = async () => {
    try {
      setFetchingNotification(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notification');
      
      const notification = await response.json();
      
      // Calculate remaining days
      const expireDate = new Date(notification.expiresAt);
      const currentDate = new Date();
      const diffTime = expireDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Set form data
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
        type: notification.type || 'info',
        recipientType: notification.recipientType || 'all',
        recipients: notification.recipients || [],
        link: notification.link || '',
        expireDays: diffDays.toString() || '30'
      });
    } catch (err) {
      console.error('Error fetching notification:', err);
      toast.error('Could not load notification data');
      navigate('/admin/notifications');
    } finally {
      setFetchingNotification(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRecipientTypeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      recipientType: selectedOption.value,
      // Reset recipients when changing recipient type
      recipients: selectedOption.value !== 'specific' ? [] : prev.recipients
    }));
  };

  const handleTypeChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      type: selectedOption.value
    }));
  };

  const handleRecipientsChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      recipients: selectedOptions.map(option => option.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate recipients for specific type
      if (formData.recipientType === 'specific' && formData.recipients.length === 0) {
        toast.error('Please select at least one recipient');
        setLoading(false);
        return;
      }
      
      // Make API request
      const url = isEditMode 
        ? `http://localhost:5000/api/notifications/${id}`
        : 'http://localhost:5000/api/notifications';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save notification');
      }
      
      const savedNotification = await response.json();
      
      toast.success(`Notification ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/admin/notifications');
    } catch (err) {
      console.error('Error saving notification:', err);
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} notification`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingNotification) {
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
        {isEditMode ? 'Edit Notification' : 'Create New Notification'}
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                placeholder="Enter notification title"
              />
            </div>
            
            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                placeholder="Enter notification message"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notification Type
                </label>
                <Select
                  options={notificationTypes}
                  value={notificationTypes.find(type => type.value === formData.type)}
                  onChange={handleTypeChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                      borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB',
                    }),
                    option: (styles, { data, isFocused }) => ({
                      ...styles,
                      backgroundColor: isFocused ? '#E5E7EB' : 'white',
                      color: '#111827',
                      ':before': {
                        backgroundColor: data.color,
                        borderRadius: '50%',
                        content: '" "',
                        display: 'block',
                        marginRight: 8,
                        height: 10,
                        width: 10,
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }),
                    singleValue: (styles, { data }) => ({
                      ...styles,
                      color: document.documentElement.classList.contains('dark') ? 'white' : '#111827',
                      ':before': {
                        backgroundColor: data.color,
                        borderRadius: '50%',
                        content: '" "',
                        display: 'block',
                        marginRight: 8,
                        height: 10,
                        width: 10,
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }),
                  }}
                />
              </div>
              
              {/* Link */}
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                  placeholder="Enter URL for additional information"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add a link for additional information or actions
                </p>
              </div>
            </div>
            
            {/* Recipient Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Send To
                </label>
                <Select
                  options={recipientTypes}
                  value={recipientTypes.find(type => type.value === formData.recipientType)}
                  onChange={handleRecipientTypeChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                      borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB',
                    }),
                    option: (styles, { isFocused }) => ({
                      ...styles,
                      backgroundColor: isFocused ? '#E5E7EB' : 'white',
                      color: '#111827',
                    }),
                    singleValue: (styles) => ({
                      ...styles,
                      color: document.documentElement.classList.contains('dark') ? 'white' : '#111827',
                    }),
                  }}
                />
              </div>
              
              {/* Specific Users (if selected) */}
              {formData.recipientType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Users <span className="text-red-500">*</span>
                  </label>
                  <Select
                    isMulti
                    isLoading={fetchingUsers}
                    options={users}
                    value={users.filter(user => formData.recipients.includes(user.value))}
                    onChange={handleRecipientsChange}
                    placeholder="Select one or more users"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (styles) => ({
                        ...styles,
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB',
                      }),
                      option: (styles, { data, isFocused }) => ({
                        ...styles,
                        backgroundColor: isFocused ? '#E5E7EB' : 'white',
                        color: '#111827',
                      }),
                      multiValue: (styles) => ({
                        ...styles,
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                      }),
                      multiValueLabel: (styles) => ({
                        ...styles,
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827',
                      }),
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Notification will be sent only to selected users
                  </p>
                </div>
              )}
              
              {/* Expiration */}
              <div>
                <label htmlFor="expireDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  id="expireDays"
                  name="expireDays"
                  value={formData.expireDays}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#1fa9be] focus:border-[#1fa9be] dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Number of days until this notification expires
                </p>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
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
                <>{isEditMode ? 'Update Notification' : 'Create Notification'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NotificationForm;

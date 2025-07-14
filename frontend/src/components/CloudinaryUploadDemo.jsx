import React, { useState } from 'react';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';

const CloudinaryUploadDemo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Use different field names based on upload type
      if (uploadType === 'document') {
        formData.append('document', selectedFile);
      } else {
        formData.append('file', selectedFile);
      }

      const endpoint = uploadType === 'document' 
        ? '/api/uploads/upload/document'
        : '/api/uploads/upload/general';

      const response = await fetch(`https://rmt-medical-store.vercel.app/${endpoint}`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Add to uploaded files list
      const fileInfo = uploadType === 'document' ? result.document : result.file;
      setUploadedFiles(prev => [...prev, {
        ...fileInfo,
        uploadedAt: new Date().toISOString()
      }]);

      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId) => {
    try {
      const token = localStorage.getItem('token');
      const encodedPublicId = encodeURIComponent(publicId);
      
      const response = await fetch(`https://rmt-medical-store.vercel.app/api/uploads/delete/${encodedPublicId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      // Remove from uploaded files list
      setUploadedFiles(prev => prev.filter(file => file.publicId !== publicId));
      toast.success('File deleted successfully!');

    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Delete failed');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Cloudinary Upload Demo
      </h2>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mb-8"
      >
        {/* Upload Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="general">General Files</option>
            <option value="document">Documents (PDF, DOC, etc.)</option>
          </select>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select File
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept={uploadType === 'document' ? '.pdf,.doc,.docx,.txt' : '*'}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-[#036372] hover:bg-[#1fa9be] disabled:bg-gray-400 
                   text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            'Upload File'
          )}
        </button>
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={file.publicId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 
                         rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {file.originalName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Size: {formatFileSize(file.size)} | Format: {file.format.toUpperCase()}
                  </p>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#036372] hover:text-[#1fa9be] underline"
                  >
                    View File
                  </a>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(file.url)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 
                             text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 
                             dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(file.publicId)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded 
                             hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          Upload Limits
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• General Files: Up to 15MB</li>
          <li>• Documents: Up to 10MB (PDF, DOC, DOCX, TXT)</li>
          <li>• All files are automatically optimized and stored securely</li>
          <li>• Files are delivered via global CDN for fast loading</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default CloudinaryUploadDemo;

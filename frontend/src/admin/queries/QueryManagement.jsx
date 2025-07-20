import React, { useEffect, useState } from 'react';
import { motion } from '../../lib/motion';

const QueryManagement = () => {
  // Use VITE_API_BASE_URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseModal, setResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, [currentPage, statusFilter]);

  const fetchQueries = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/medical-queries?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queries');
      }

      const data = await response.json();
      setQueries(data.queries);
      setTotalPages(Math.ceil(data.total / 10));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setLoading(false);
    }
  };

  const updateQueryStatus = async (queryId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/medical-queries/${queryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update query status');
      }

      fetchQueries();
    } catch (error) {
      console.error('Error updating query status:', error);
    }
  };

  const submitResponse = async () => {
    if (!responseText.trim()) return;
    
    setSubmittingResponse(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/medical-queries/${selectedQuery._id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        },
        body: JSON.stringify({ response: responseText })
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      setResponseModal(false);
      setResponseText('');
      setSelectedQuery(null);
      fetchQueries();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'urgent': return 'text-red-800 font-bold';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036372]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#036372] to-[#1fa9be] text-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-semibold">Query Management</h1>
        <p className="mt-2 opacity-90">Manage user queries and medical help requests</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#036372] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchQueries}
              className="w-full px-4 py-2 bg-[#036372] text-white rounded-md hover:bg-[#1fa9be] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Queries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {queries.map((query, index) => (
          <motion.div
            key={query._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {query.subject || 'Medical Query'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(query.status)}`}>
                    {query.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(query.priority)}`}>
                    {query.priority} priority
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Patient:</span> {query.user?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {query.user?.email || 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Contact:</span> {query.contactNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Age:</span> {query.age || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Gender:</span> {query.gender || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Submitted:</span> {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Description:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    {query.queryText || query.symptoms || 'No description provided'}
                  </p>
                </div>

                {query.currentMedications && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Medications:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {query.currentMedications}
                    </p>
                  </div>
                )}

                {query.prescriptionFile && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prescription File:</p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <a 
                        href={query.prescriptionFile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#036372] dark:text-[#1fa9be] hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                        </svg>
                        View Prescription
                      </a>
                    </div>
                  </div>
                )}

                {query.response && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Response:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border-l-4 border-green-500">
                      {query.response}
                    </p>
                    {query.responseDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Responded on: {new Date(query.responseDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:ml-6 lg:flex-shrink-0 mt-4 lg:mt-0">
                <div className="space-y-2">
                  <select
                    value={query.status}
                    onChange={(e) => updateQueryStatus(query._id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#036372] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => {
                      setSelectedQuery(query);
                      setResponseModal(true);
                      setResponseText(query.response || '');
                    }}
                    className="w-full px-4 py-2 bg-[#036372] text-white text-sm rounded-md hover:bg-[#1fa9be] transition-colors"
                  >
                    {query.response ? 'Update Response' : 'Add Response'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'bg-[#036372] border-[#036372] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {queries.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No queries found</h3>
          <p className="mt-1 text-sm text-gray-500">No user queries match the current filters.</p>
        </motion.div>
      )}

      {/* Response Modal */}
      {responseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Respond to Query
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Patient: {selectedQuery?.user?.name || 'Anonymous'}
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Query Details:
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm text-gray-600 dark:text-gray-400">
                  {selectedQuery?.queryText || selectedQuery?.symptoms || 'No details provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Response: *
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#036372] focus:border-transparent"
                  placeholder="Provide your medical advice or response here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide professional medical advice. This response will be sent to the patient.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setResponseModal(false);
                  setResponseText('');
                  setSelectedQuery(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitResponse}
                disabled={!responseText.trim() || submittingResponse}
                className="px-4 py-2 bg-[#036372] text-white rounded-md hover:bg-[#1fa9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submittingResponse && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Send Response
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QueryManagement;

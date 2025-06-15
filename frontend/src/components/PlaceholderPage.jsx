import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6">
          This page is under construction. Please check back later.
        </p>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div className="bg-[#036372] dark:bg-[#1fa9be] h-full w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;

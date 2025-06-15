import React, { useState } from 'react';
import data from '../../public/data/injection.json';
import Card from '../Card/Card';

const Product = () => {
  const [filter, setFilter] = useState('all');
  
  // For a real implementation, you'd filter products based on categories
  const filteredData = data;
  
  return (
    <div className='mx-auto'>
      {/* Filter options */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All Products', 'Ayurvedic', 'Allopathic', 'Baby Care', 'Beauty'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                filter === category.toLowerCase() 
                  ? 'bg-[#036372] dark:bg-[#1fa9be] text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
              }`}
              onClick={() => setFilter(category.toLowerCase())}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select 
            id="sort" 
            className="bg-gray-100 dark:bg-gray-700 border-none text-sm rounded-lg focus:ring-[#036372] dark:focus:ring-[#1fa9be] p-2"
          >
            <option value="popular">Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
      
      {/* Products grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {filteredData.map((product, index) => (
          <Card
            key={index}
            productName={product.productName}
            mrp={product.mrp}
          />
        ))}
      </div>
    </div>
  );
};

export default Product;
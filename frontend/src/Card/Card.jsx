import React from 'react'

const Card = ({productName, mrp}) => {
  return (
    <div className='w-[260px] h-[360px] rounded-xl my-4 mx-auto group card-hover relative'>
      <div className="rounded-xl border border-gray-100 flex flex-col bg-white dark:bg-gray-800 p-3 shadow-md dark:border-gray-700 h-full transition-all relative">
        {/* Discount badge and wishlist */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-[#e0f7fa] dark:hover:bg-gray-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#036372] dark:text-[#1fa9be]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-[#e0f7fa] dark:hover:bg-gray-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#036372] dark:text-[#1fa9be]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        
        {/* Discount tag */}
        <div className="absolute top-2 left-2">
          <span className="bg-[#036372]/10 dark:bg-[#1fa9be]/20 text-[#036372] dark:text-[#1fa9be] text-xs font-medium px-2.5 py-1 rounded-full">
            15% OFF
          </span>
        </div>
        
        {/* Product Image */}
        <div className="h-[180px] w-full flex items-center justify-center mb-4 rounded-lg overflow-hidden bg-[#e0f7fa]/30 dark:bg-gray-700/30">
          <a href="#" className="relative w-full h-full flex items-center justify-center">
            <img className="h-[160px] object-contain hover:scale-110 transition-transform duration-300" 
                 src="./src/assets/lohasav.jpg" 
                 alt="Image Not Available" />
          </a>
        </div>
        
        {/* Product Info */}
        <div className="flex-grow flex flex-col">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[40px]">
            {productName || "Lohasav Syrup"}
          </h3>
          
          {/* Price */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-[#036372] dark:text-[#1fa9be]">
              ₹{mrp || '120'}
            </span>
            <span className="text-xs line-through text-gray-500 dark:text-gray-400">
              ₹{Math.round((mrp || 120) * 1.15)}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center mt-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < 4 ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}`}
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor" 
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(4.0)</span>
          </div>
          
          {/* Add to Cart Button */}
          <button className="mt-auto w-full bg-[#036372] hover:bg-[#1fa9be] dark:bg-[#1fa9be] dark:hover:bg-[#036372] text-white text-sm font-medium py-2 rounded-lg transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card
import React, { useState } from 'react';
import HoverRightDropDown from './HoverRightDropDown';

const DropDown = () => {
    const options = ['Ayurvedic', 'Allopathic', 'Beauty', 'Fitness', 'Health', 'Nutrition', 'Sexual Wellness', 'Vitamins'];
  return (
    <div className="relative inline-block text-left group">
                    <button className="rounded-md px-3 py-2 text-sm font-bold text-[#036372] hover:text-[#1fa9be] inline-flex items-center justify-center">
                        Medicine 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-chevron-down mt-1">
  <polyline points="4 6 8 10 12 6"></polyline>
</svg>

    </button>

      <div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 absolute z-10 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
        <div className="py-1">
          {options.map((option) => (
            <a
              key={option}
              href="#"
              className="block px-4 py-2 text-sm text-[#036372] hover:text-[#1fa9be]"
            >
              {option === 'Allopathic'? <div> 
                    <HoverRightDropDown value={option}/> 
            </div> : option}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DropDown
import React, { useState } from 'react';

const HoverRightDropDown = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const options = ['Branded', 'Generic'];

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex justify-center w-full rounded-md text-sm cursor-pointer">
        {props.value}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-chevron-right mt-1 text-[#036372] hover:text-[#1fa9be]"
        >
          <polyline points="6 4 10 8 6 12"></polyline>
        </svg>
      </div>

      <div
        className={`${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        } transition-all duration-300 absolute left-full top-0 ml-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
      >
        <div className="py-1">
          {options.map((option) => (
            <a
              key={option}
              href="#"
              className="block px-4 py-2 text-sm hover:text-[#1fa9be] text-[#036372]"
            >
              {option}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoverRightDropDown;

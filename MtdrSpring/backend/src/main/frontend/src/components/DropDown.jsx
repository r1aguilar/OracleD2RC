import React, { useState } from "react";

const Dropdown = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState(
    options.reduce((acc, opt) => ({ ...acc, [opt]: true }), {})
  );

  const toggleCheckbox = (option) => {
    setChecked((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="relative text-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2a2a2a] border border-gray-600 text-white px-4 py-2 rounded-md shadow-sm text-sm hover:bg-[#333] transition"
      >
        {label} <span className="ml-1">⌄</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-lg z-50 w-40 p-3 text-sm space-y-2">
          {options.map((option) => (
            <label key={option} className="block text-white cursor-pointer">
              <input
                type="checkbox"
                checked={checked[option]}
                onChange={() => toggleCheckbox(option)}
                className="mr-2 accent-[#ff0000]"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

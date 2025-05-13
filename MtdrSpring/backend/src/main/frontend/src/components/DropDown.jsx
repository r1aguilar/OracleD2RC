import React, { useState, useEffect, useRef } from "react";

const Dropdown = ({ label, options, onSelect, initialChecked = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checked, setChecked] = useState({});
  const initializedRef = useRef(false);

  // Initialize checkboxes only once when options change
  useEffect(() => {
    if (!options || options.length === 0 || initializedRef.current) return;
    
    // Create initial state object
    const initialState = {};
    options.forEach(option => {
      // Ensure we're using numeric IDs consistently
      const id = Number(typeof option === 'object' ? option.id : option);
      if (!isNaN(id)) {
        initialState[id] = initialChecked;
      }
    });
    
    setChecked(initialState);
    
    // Only notify parent about initial selections if they should be checked
    if (initialChecked && onSelect) {
      options.forEach(option => {
        const id = Number(typeof option === 'object' ? option.id : option);
        if (!isNaN(id)) {
          onSelect(id, initialChecked);
        }
      });
    }
    
    // Mark as initialized to prevent re-initialization
    initializedRef.current = true;
  }, [options, initialChecked, onSelect]);

  const toggleCheckbox = (option) => {
    // Ensure we're working with numeric IDs consistently
    const id = Number(typeof option === 'object' ? option.id : option);
    
    // Check if id is a valid number
    if (isNaN(id)) {
      console.error("Invalid ID detected:", option);
      return;
    }
    
    const newValue = !checked[id];
    
    // Update local state with the new checked value
    setChecked(prev => ({ ...prev, [id]: newValue }));
    
    // Call the onSelect callback when a sprint is toggled
    if (onSelect) {
      onSelect(id, newValue);
    }
  };

  // Get the selected count for the dropdown label
  const selectedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = options ? options.length : 0;

  return (
    <div className="relative text-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2a2a2a] border border-gray-600 text-white px-4 py-2 rounded-md shadow-sm text-sm hover:bg-[#333] transition"
      >
        {label} ({selectedCount}/{totalCount}) <span className="ml-1">v</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-lg z-50 w-60 p-3 text-sm space-y-2">
          <div className="flex justify-between mb-2 pb-2 border-b border-gray-700">
            <button
              className="text-xs hover:text-red-500"
              onClick={() => {
                const allSelected = Object.values(checked).every(Boolean);
                const newValue = !allSelected;
                const newState = {};
                
                options.forEach(option => {
                  const id = Number(typeof option === 'object' ? option.id : option);
                  if (!isNaN(id)) {
                    newState[id] = newValue;
                    if (onSelect) onSelect(id, newValue);
                  }
                });
                
                setChecked(newState);
              }}
            >
              {Object.values(checked).every(Boolean) ? "Deselect All" : "Select All"}
            </button>
            <button
              className="text-xs hover:text-red-500"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
          {options && options.map((option) => {
            const id = Number(typeof option === 'object' ? option.id : option);
            const name = typeof option === 'object' ? option.name : option;
            
            // Skip rendering if id is invalid
            if (isNaN(id)) {
              console.error("Invalid option ID:", option);
              return null;
            }
           
            return (
              <label
                key={id}
                className="flex items-center text-white cursor-pointer hover:bg-[#2a2a2a] p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={!!checked[id]}
                  onChange={() => toggleCheckbox(option)}
                  className="mr-2 accent-[#ff0000]"
                />
                <span className="truncate">{name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
// app/components/CountySelect.tsx
"use client";

import { useEffect, useState } from "react";
import Select from "react-select";

interface Props {
  options: { value: string; label: string }[];
  value?: string;
}

export default function CountySelect({ options, value }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(
    value ? { value, label: value } : null
  );
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <select className="border rounded px-3 py-2 w-full cursor-pointer hover:border-gray-400 transition-colors">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div className="relative">
      <Select
        value={selectedOption}
        onChange={setSelectedOption}
        inputValue={inputValue}
        onInputChange={(newValue) => {
          setInputValue(newValue);
          if (newValue) setIsOpen(true);
        }}
        menuIsOpen={isOpen}
        onMenuClose={() => setIsOpen(false)}
        options={options}
        isClearable
        isSearchable={true}
        placeholder="Type to search county..."
        classNamePrefix="react-select"
        components={{
          DropdownIndicator: () => (
            <div 
              className="px-2 py-2 cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ),
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            cursor: 'pointer',
            borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
            '&:hover': {
              borderColor: '#9ca3af',
            },
            transition: 'all 0.2s ease',
          }),
          input: (base) => ({
            ...base,
            cursor: 'text',
          }),
          option: (base, state) => ({
            ...base,
            cursor: 'pointer',
            backgroundColor: state.isSelected 
              ? '#6366f1' 
              : state.isFocused 
                ? '#f3f4f6' 
                : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
              backgroundColor: state.isSelected ? '#6366f1' : '#e5e7eb',
            },
            transition: 'all 0.15s ease',
          }),
          menu: (base) => ({
            ...base,
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }),
          singleValue: (base) => ({
            ...base,
            cursor: 'pointer',
          }),
          placeholder: (base) => ({
            ...base,
            cursor: 'pointer',
          }),
        }}
      />
      <input 
        type="hidden" 
        name="county" 
        value={selectedOption?.value || ''} 
      />
    </div>
  );
}

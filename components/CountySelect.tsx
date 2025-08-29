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
      <select className="border rounded px-3 py-2 w-full">
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
              className="px-2 py-2 cursor-pointer hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              ▼
            </div>
          ),
        }}
        styles={{
          control: (base) => ({
            ...base,
            cursor: 'text',
          }),
          input: (base) => ({
            ...base,
            cursor: 'text',
          })
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

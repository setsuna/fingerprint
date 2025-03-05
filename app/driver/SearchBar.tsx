'use client'

import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 搜索栏组件
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = '搜索文件名...',
  className = ''
}: SearchBarProps) {
  // 内部状态，用于防抖
  const [inputValue, setInputValue] = useState(value);
  
  // 当外部value改变时，更新内部状态
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // 防抖处理，300ms后触发onChange
    const timeoutId = setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  // 清除搜索内容
  const handleClear = () => {
    setInputValue('');
    onChange('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
      />
      
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
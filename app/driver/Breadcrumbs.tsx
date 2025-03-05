'use client'

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onItemClick: (path: string, index: number) => void;
}

/**
 * 面包屑导航组件
 * @param items 导航项目数组
 * @param onItemClick 点击导航项的回调函数
 */
export default function Breadcrumbs({ items, onItemClick }: BreadcrumbsProps) {
  return (
    <div className="bg-white rounded-lg p-3 mb-4 flex items-center overflow-x-auto shadow-sm">
      {items.map((item, index) => (
        <span key={item.path} className="flex items-center text-sm whitespace-nowrap">
          {index === 0 ? (
            <Home size={14} className="mr-1 text-gray-500" />
          ) : (
            <ChevronRight size={16} className="mx-1 text-gray-400" />
          )}
          
          <button 
            onClick={() => onItemClick(item.path, index)}
            className={`hover:text-brand-red transition-colors ${
              index === items.length - 1 
                ? 'text-brand-red font-medium' 
                : 'text-gray-600'
            }`}
          >
            {item.name}
          </button>
        </span>
      ))}
    </div>
  )
}
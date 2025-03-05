'use client'

import React from 'react'
import { Loader2, Folder } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileItem } from '@/app/services/synologyService'

interface TabNavigationProps {
  tabs: FileItem[];
  selectedTab: FileItem | null;
  loading: boolean;
  onTabSelect: (tab: FileItem) => void;
  emptyMessage?: string;
}

/**
 * 标签页导航组件
 */
export default function TabNavigation({
  tabs,
  selectedTab,
  loading,
  onTabSelect,
  emptyMessage = '请先选择左侧目录'
}: TabNavigationProps) {
  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex space-x-1 border-b border-gray-200 bg-white rounded-t-xl px-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.path}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onTabSelect(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center ${
              selectedTab?.path === tab.path
                ? 'text-brand-red border-b-2 border-brand-red'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Folder size={14} className="mr-1.5" />
            {tab.name}
          </motion.button>
        ))}
        
        {tabs.length === 0 && !loading && (
          <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
            {emptyMessage}
          </div>
        )}
        
        {loading && tabs.length === 0 && (
          <div className="px-4 py-3 flex items-center">
            <Loader2 size={16} className="animate-spin mr-2 text-brand-red" />
            <span className="text-sm">加载中...</span>
          </div>
        )}
      </div>
    </div>
  )
}
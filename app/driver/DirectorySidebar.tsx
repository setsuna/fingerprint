'use client'

import React from 'react'
import { Folder, HardDrive, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { FileItem } from '@/app/services/synologyService'

interface DirectorySidebarProps {
  directories: FileItem[];
  selectedDirectory: FileItem | null;
  loading: boolean;
  onDirectorySelect: (directory: FileItem) => void;
  title?: string;
}

/**
 * 目录侧边栏组件
 */
export default function DirectorySidebar({
  directories,
  selectedDirectory,
  loading,
  onDirectorySelect,
  title = '文件目录'
}: DirectorySidebarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 w-64 flex-shrink-0 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <HardDrive size={18} className="mr-2 text-brand-red" />
        {title}
      </h2>
      
      {directories.length > 0 ? (
        <ul className="space-y-2">
          {directories.map((dir) => (
            <motion.li 
              key={dir.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => onDirectorySelect(dir)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-colors ${
                  selectedDirectory?.path === dir.path
                    ? 'bg-red-50 text-brand-red font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Folder size={16} className={`mr-2 ${
                  selectedDirectory?.path === dir.path ? 'text-brand-red' : 'text-gray-500'
                }`} />
                <span className="truncate">{dir.name}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-brand-red" />
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">无目录</p>
      )}
    </div>
  )
}
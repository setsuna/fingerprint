'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Download, Loader2, Package } from 'lucide-react'
import FileIcon from './FileIcon'
import { FileItem, formatFileSize, formatDateTime } from '@/app/services/synologyService'

interface FileListProps {
  files: FileItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onFileClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onClearSearch?: () => void;
}

/**
 * 文件列表组件
 */
export default function FileList({
  files,
  loading,
  error,
  searchQuery,
  onFileClick,
  onDownload,
  onClearSearch
}: FileListProps) {
  // 筛选文件列表
  const filteredFiles = searchQuery
    ? files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }
  
  if (loading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 size={40} className="animate-spin text-brand-red mb-4" />
        <p className="text-gray-500">加载文件列表中...</p>
      </div>
    );
  }
  
  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Package size={40} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-2">
          {searchQuery ? '没有找到匹配的文件' : '当前目录为空'}
        </p>
        {searchQuery && onClearSearch && (
          <button
            onClick={onClearSearch}
            className="text-brand-red text-sm hover:underline"
          >
            清除搜索条件
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {filteredFiles.map((file) => (
        <FileListItem 
          key={file.path} 
          file={file} 
          onClick={onFileClick}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

interface FileListItemProps {
  file: FileItem;
  onClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

/**
 * 文件列表项组件
 */
function FileListItem({ file, onClick, onDownload }: FileListItemProps) {
  const handleClick = () => {
    onClick(file);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(file);
  };
  
  // 获取文件类型
  const fileType = file.isdir 
    ? 'folder' 
    : file.name.includes('.') 
      ? file.name.split('.').pop()?.toLowerCase() || 'file'
      : 'file';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="bg-gray-50 p-3 rounded-lg">
          <FileIcon 
            fileType={fileType} 
            size={28} 
            className={file.isdir ? "text-brand-red" : "text-gray-600"} 
          />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold truncate max-w-md">{file.name}</h3>
              {!file.isdir && (
                <p className="text-sm text-gray-500 mt-1">
                  大小: {formatFileSize(file.size)}
                </p>
              )}
            </div>
            
            {!file.isdir && (
              <button
                onClick={handleDownload}
                className="bg-brand-red hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Download size={16} className="mr-1" />
                下载
              </button>
            )}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">修改时间:</span>
              <span className="font-medium">{formatDateTime(file.time.mtime)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
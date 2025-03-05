'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { FileItem, formatFileSize, formatDateTime } from '@/app/services/enhancedSynologyService'
import FileIcon from './FileIcon'
import FileTypeBadge from './FileTypeBadge'

interface FileGridViewProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

/**
 * 文件网格视图组件
 * 以网格卡片形式显示文件和文件夹
 */
export default function FileGridView({
  files,
  onFileClick,
  onDownload
}: FileGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileGridItem
          key={file.path}
          file={file}
          onClick={onFileClick}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

interface FileGridItemProps {
  file: FileItem;
  onClick: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
}

/**
 * 文件网格项组件
 */
function FileGridItem({ file, onClick, onDownload }: FileGridItemProps) {
  // 处理点击事件
  const handleClick = () => {
    onClick(file);
  };
  
  // 处理下载事件
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
      
  // 获取文件修改时间
  const modifiedTime = formatDateTime(file.time.mtime);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      {/* 顶部图标区域 */}
      <div className={`h-32 flex items-center justify-center ${file.isdir ? 'bg-red-50' : 'bg-gray-50'}`}>
        <FileIcon 
          fileType={fileType} 
          size={64} 
          className={file.isdir ? "text-brand-red" : "text-gray-600"} 
        />
      </div>
      
      {/* 文件信息区域 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="max-w-[80%]">
            <h3 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h3>
            <FileTypeBadge fileType={fileType} className="mt-1" />
          </div>
          
          {!file.isdir && (
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-brand-red hover:text-white transition-colors text-gray-500"
              title="下载文件"
            >
              <Download size={14} />
            </button>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {!file.isdir && (
            <div className="mb-1">
              大小: {formatFileSize(file.size)}
            </div>
          )}
          <div>
            修改时间: {modifiedTime}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 文件卡片视图组件 - 更大尺寸更多细节的卡片
 */
export function FileLargeCard({
  file,
  onClick,
  onDownload
}: FileGridItemProps) {
  // 处理点击事件
  const handleClick = () => {
    onClick(file);
  };
  
  // 处理下载事件
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
      
  // 获取文件修改时间
  const modifiedTime = formatDateTime(file.time.mtime);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer w-full"
      onClick={handleClick}
    >
      <div className="flex">
        {/* 图标区域 */}
        <div className={`w-24 h-24 flex items-center justify-center ${file.isdir ? 'bg-red-50' : 'bg-gray-50'}`}>
          <FileIcon 
            fileType={fileType} 
            size={40} 
            className={file.isdir ? "text-brand-red" : "text-gray-600"} 
          />
        </div>
        
        {/* 文件信息区域 */}
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium truncate max-w-xs" title={file.name}>
                {file.name}
              </h3>
              <FileTypeBadge fileType={fileType} className="mt-1" />
            </div>
            
            {!file.isdir && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-brand-red hover:text-white transition-colors text-gray-500"
                title="下载文件"
              >
                <Download size={16} />
              </button>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {!file.isdir && (
              <div className="flex items-center">
                <span>大小: {formatFileSize(file.size)}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span>修改时间: {modifiedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
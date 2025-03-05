'use client'

import React from 'react'
import { 
  Calendar, 
  Clock, 
  Download, 
  FilePlus, 
  HardDrive, 
  X 
} from 'lucide-react'
import { FileItem, formatFileSize, formatDateTime } from '@/app/services/synologyService'
import FileIcon from './FileIcon'

interface FileDetailsProps {
  file: FileItem;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

/**
 * 文件详情组件
 * 显示选中文件的详细信息
 */
export default function FileDetails({ file, onClose, onDownload }: FileDetailsProps) {
  const handleDownload = () => {
    onDownload(file);
  };
  
  // 获取文件类型
  const fileType = file.isdir 
    ? 'folder' 
    : file.name.includes('.') 
      ? file.name.split('.').pop()?.toLowerCase() || 'file'
      : 'file';
      
  // 获取文件创建时间
  const createdTime = formatDateTime(file.time.ctime);
  
  // 获取文件修改时间
  const modifiedTime = formatDateTime(file.time.mtime);
  
  // 获取文件访问时间
  const accessedTime = formatDateTime(file.time.atime);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center mb-6">
          <div className="p-4 bg-gray-100 rounded-lg mr-4">
            <FileIcon 
              fileType={fileType} 
              size={32} 
              className={file.isdir ? "text-brand-red" : "text-gray-600"} 
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">{file.name}</h2>
            <p className="text-gray-500 mt-1">
              {file.isdir ? '文件夹' : `${fileType.toUpperCase()} 文件`}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 文件大小 */}
          {!file.isdir && (
            <div className="flex items-center">
              <HardDrive size={18} className="text-gray-500 mr-2" />
              <div>
                <span className="text-gray-500">大小：</span>
                <span className="font-medium">{formatFileSize(file.size)}</span>
              </div>
            </div>
          )}
          
          {/* 创建时间 */}
          <div className="flex items-center">
            <FilePlus size={18} className="text-gray-500 mr-2" />
            <div>
              <span className="text-gray-500">创建时间：</span>
              <span className="font-medium">{createdTime}</span>
            </div>
          </div>
          
          {/* 修改时间 */}
          <div className="flex items-center">
            <Calendar size={18} className="text-gray-500 mr-2" />
            <div>
              <span className="text-gray-500">修改时间：</span>
              <span className="font-medium">{modifiedTime}</span>
            </div>
          </div>
          
          {/* 访问时间 */}
          <div className="flex items-center">
            <Clock size={18} className="text-gray-500 mr-2" />
            <div>
              <span className="text-gray-500">访问时间：</span>
              <span className="font-medium">{accessedTime}</span>
            </div>
          </div>
          
          {/* 文件路径 */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-500 text-sm">文件路径：</p>
            <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">{file.path}</p>
          </div>
        </div>
        
        {/* 下载按钮 */}
        {!file.isdir && (
          <div className="mt-6">
            <button
              onClick={handleDownload}
              className="w-full bg-brand-red hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <Download size={16} className="mr-2" />
              下载文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client'

import React from 'react'
import FileIcon from './FileIcon'

interface FileTypeBadgeProps {
  fileType: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 文件类型颜色映射
const fileTypeColors: Record<string, { bg: string; text: string }> = {
  // 文件夹
  folder: { bg: 'bg-red-100', text: 'text-red-600' },
  
  // 文档文件
  doc: { bg: 'bg-blue-100', text: 'text-blue-600' },
  docx: { bg: 'bg-blue-100', text: 'text-blue-600' },
  pdf: { bg: 'bg-red-100', text: 'text-red-600' },
  txt: { bg: 'bg-gray-100', text: 'text-gray-600' },
  
  // 表格文件
  xls: { bg: 'bg-green-100', text: 'text-green-600' },
  xlsx: { bg: 'bg-green-100', text: 'text-green-600' },
  csv: { bg: 'bg-green-100', text: 'text-green-600' },
  
  // 演示文件
  ppt: { bg: 'bg-orange-100', text: 'text-orange-600' },
  pptx: { bg: 'bg-orange-100', text: 'text-orange-600' },
  
  // 图像文件
  jpg: { bg: 'bg-pink-100', text: 'text-pink-600' },
  jpeg: { bg: 'bg-pink-100', text: 'text-pink-600' },
  png: { bg: 'bg-pink-100', text: 'text-pink-600' },
  gif: { bg: 'bg-pink-100', text: 'text-pink-600' },
  
  // 压缩文件
  zip: { bg: 'bg-purple-100', text: 'text-purple-600' },
  rar: { bg: 'bg-purple-100', text: 'text-purple-600' },
  '7z': { bg: 'bg-purple-100', text: 'text-purple-600' },
  
  // 安装文件
  exe: { bg: 'bg-green-100', text: 'text-green-600' },
  msi: { bg: 'bg-green-100', text: 'text-green-600' },
  
  // 代码文件
  html: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  css: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  js: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  
  // 默认
  default: { bg: 'bg-gray-100', text: 'text-gray-600' }
};

// 文件类型标签映射
const fileTypeLabels: Record<string, string> = {
  folder: '文件夹',
  doc: 'Word',
  docx: 'Word',
  pdf: 'PDF',
  txt: '文本',
  xls: 'Excel',
  xlsx: 'Excel',
  csv: 'CSV',
  ppt: 'PPT',
  pptx: 'PPT',
  jpg: '图片',
  jpeg: '图片',
  png: '图片',
  gif: '图片',
  zip: '压缩包',
  rar: '压缩包',
  '7z': '压缩包',
  exe: '可执行',
  msi: '安装包',
  html: 'HTML',
  css: 'CSS',
  js: 'JS',
};

/**
 * 文件类型徽章组件
 * 用于显示文件类型的视觉指示器
 */
export default function FileTypeBadge({
  fileType,
  className = '',
  showLabel = true,
  size = 'md'
}: FileTypeBadgeProps) {
  // 获取文件类型（如果有后缀则取后缀）
  const type = fileType.includes('.')
    ? fileType.split('.').pop()?.toLowerCase() || 'default'
    : fileType.toLowerCase();
  
  // 获取颜色样式
  const colors = fileTypeColors[type] || fileTypeColors.default;
  
  // 获取标签文本
  const label = fileTypeLabels[type] || type.toUpperCase();
  
  // 尺寸样式
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };
  
  // 图标尺寸
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };
  
  return (
    <span className={`inline-flex items-center rounded-full ${colors.bg} ${colors.text} ${sizeStyles[size]} ${className}`}>
      <FileIcon 
        fileType={type} 
        size={iconSizes[size]} 
        className="mr-1" 
      />
      {showLabel && label}
    </span>
  );
}

/**
 * 简单的文件扩展名徽章
 */
export function FileExtensionBadge({
  extension,
  className = ''
}: {
  extension: string;
  className?: string;
}) {
  const ext = extension.toLowerCase().replace('.', '');
  const colors = fileTypeColors[ext] || fileTypeColors.default;
  
  return (
    <span className={`inline-block bg-gray-100 text-xs font-medium rounded px-1.5 py-0.5 ${colors.text} ${className}`}>
      {ext.toUpperCase()}
    </span>
  );
}
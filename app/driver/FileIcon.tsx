'use client'

import React from 'react'
import { 
  File, 
  FileText, 
  Image, 
  Video, 
  FileArchive, 
  FileCog, 
  FileSpreadsheet, 
  FileCode, 
  Package, 
  Folder,
  FolderOpen
} from 'lucide-react'

// 文件图标映射表
const fileIconMap: Record<string, React.ComponentType<any>> = {
  // 文件夹
  folder: Folder,
  folderOpen: FolderOpen,
  
  // 常规文件
  file: File,
  text: FileText,
  
  // 图像文件
  image: Image,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  bmp: Image,
  svg: Image,
  
  // 视频文件
  video: Video,
  mp4: Video,
  avi: Video,
  mov: Video,
  wmv: Video,
  
  // 压缩文件
  archive: FileArchive,
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  
  // 安装文件
  installer: Package,
  exe: Package,
  msi: Package,
  dmg: Package,
  
  // 文档文件
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  
  // 电子表格
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  
  // 代码文件
  code: FileCode,
  html: FileCode,
  css: FileCode,
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  json: FileCode,
  xml: FileCode,
  
  // 配置文件
  config: FileCog,
  ini: FileCog,
  cfg: FileCog,
  conf: FileCog,
  yml: FileCog,
  yaml: FileCog,
}

interface FileIconProps {
  fileType: string;
  isOpen?: boolean;
  className?: string;
  size?: number;
}

/**
 * 文件图标组件
 * @param fileType 文件类型
 * @param isOpen 文件夹是否打开
 * @param className CSS类名
 * @param size 图标大小
 */
export default function FileIcon({ 
  fileType, 
  isOpen = false, 
  className = '', 
  size = 24 
}: FileIconProps) {
  // 获取文件后缀名（如果有）
  const extension = fileType.includes('.') 
    ? fileType.split('.').pop()?.toLowerCase() || ''
    : fileType.toLowerCase();
  
  // 检查是否为文件夹
  const isFolder = fileType === 'folder';
  
  // 获取对应图标组件
  let IconComponent = isFolder 
    ? (isOpen ? fileIconMap.folderOpen : fileIconMap.folder)
    : (fileIconMap[extension] || fileIconMap.file);
  
  return <IconComponent size={size} className={className} />;
}
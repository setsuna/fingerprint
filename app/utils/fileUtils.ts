// app/utils/fileUtils.ts

import { FileItem } from '@/app/services/synologyService';

/**
 * 文件工具类
 * 用于处理文件相关的工具函数
 */

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名 (不包含点号)
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * 检查文件是否为指定类型
 * @param filename 文件名
 * @param extensions 扩展名列表
 * @returns 是否为指定类型
 */
export function isFileType(filename: string, extensions: string[]): boolean {
  const ext = getFileExtension(filename);
  return extensions.includes(ext);
}

/**
 * 检查文件是否为图像
 * @param filename 文件名
 * @returns 是否为图像
 */
export function isImage(filename: string): boolean {
  return isFileType(filename, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']);
}

/**
 * 检查文件是否为文档
 * @param filename 文件名
 * @returns 是否为文档
 */
export function isDocument(filename: string): boolean {
  return isFileType(filename, ['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt']);
}

/**
 * 检查文件是否为表格
 * @param filename 文件名
 * @returns 是否为表格
 */
export function isSpreadsheet(filename: string): boolean {
  return isFileType(filename, ['xls', 'xlsx', 'csv', 'ods']);
}

/**
 * 检查文件是否为演示文稿
 * @param filename 文件名
 * @returns 是否为演示文稿
 */
export function isPresentation(filename: string): boolean {
  return isFileType(filename, ['ppt', 'pptx', 'odp']);
}

/**
 * 检查文件是否为压缩包
 * @param filename 文件名
 * @returns 是否为压缩包
 */
export function isArchive(filename: string): boolean {
  return isFileType(filename, ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']);
}

/**
 * 检查文件是否为安装包
 * @param filename 文件名
 * @returns 是否为安装包
 */
export function isInstaller(filename: string): boolean {
  return isFileType(filename, ['exe', 'msi', 'deb', 'rpm', 'pkg', 'dmg']);
}

/**
 * 根据文件类型对文件数组进行分组
 * @param files 文件数组
 * @returns 分组后的文件对象
 */
export function groupFilesByType(files: FileItem[]): Record<string, FileItem[]> {
  const groups: Record<string, FileItem[]> = {
    folders: [],
    images: [],
    documents: [],
    spreadsheets: [],
    presentations: [],
    archives: [],
    installers: [],
    others: []
  };
  
  files.forEach(file => {
    if (file.isdir) {
      groups.folders.push(file);
    } else if (isImage(file.name)) {
      groups.images.push(file);
    } else if (isDocument(file.name)) {
      groups.documents.push(file);
    } else if (isSpreadsheet(file.name)) {
      groups.spreadsheets.push(file);
    } else if (isPresentation(file.name)) {
      groups.presentations.push(file);
    } else if (isArchive(file.name)) {
      groups.archives.push(file);
    } else if (isInstaller(file.name)) {
      groups.installers.push(file);
    } else {
      groups.others.push(file);
    }
  });
  
  return groups;
}

/**
 * 根据文件名排序文件
 * @param files 文件数组
 * @param ascending 是否升序
 * @returns 排序后的文件数组
 */
export function sortFilesByName(files: FileItem[], ascending: boolean = true): FileItem[] {
  return [...files].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    return ascending 
      ? nameA.localeCompare(nameB) 
      : nameB.localeCompare(nameA);
  });
}

/**
 * 根据文件大小排序文件
 * @param files 文件数组
 * @param ascending 是否升序
 * @returns 排序后的文件数组
 */
export function sortFilesBySize(files: FileItem[], ascending: boolean = true): FileItem[] {
  return [...files].sort((a, b) => {
    // 文件夹始终排在前面
    if (a.isdir && !b.isdir) return -1;
    if (!a.isdir && b.isdir) return 1;
    
    return ascending 
      ? a.size - b.size 
      : b.size - a.size;
  });
}

/**
 * 根据修改时间排序文件
 * @param files 文件数组
 * @param ascending 是否升序
 * @returns 排序后的文件数组
 */
export function sortFilesByModifiedTime(files: FileItem[], ascending: boolean = true): FileItem[] {
  return [...files].sort((a, b) => {
    return ascending 
      ? a.time.mtime - b.time.mtime 
      : b.time.mtime - a.time.mtime;
  });
}

/**
 * 搜索文件
 * @param files 文件数组
 * @param query 搜索关键字
 * @returns 搜索结果
 */
export function searchFiles(files: FileItem[], query: string): FileItem[] {
  if (!query) return files;
  
  const lowerQuery = query.toLowerCase();
  return files.filter(file => 
    file.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 构建面包屑路径
 * @param path 文件路径
 * @param rootName 根目录名称
 * @returns 面包屑数组
 */
export function buildBreadcrumbsFromPath(path: string, rootName: string = '根目录'): {name: string; path: string}[] {
  const parts = path.split('/').filter(part => part !== '');
  const breadcrumbs = [{ name: rootName, path: '/' + parts[0] }];
  
  // 添加中间路径
  for (let i = 1; i < parts.length; i++) {
    const currentPath = '/' + parts.slice(0, i + 1).join('/');
    breadcrumbs.push({ name: parts[i], path: currentPath });
  }
  
  return breadcrumbs;
}

/**
 * 获取人类可读的文件类型名称
 * @param filename 文件名
 * @returns 文件类型名称
 */
export function getHumanReadableFileType(filename: string): string {
  if (isImage(filename)) return '图片';
  if (isDocument(filename)) return '文档';
  if (isSpreadsheet(filename)) return '电子表格';
  if (isPresentation(filename)) return '演示文稿';
  if (isArchive(filename)) return '压缩文件';
  if (isInstaller(filename)) return '安装程序';
  
  const ext = getFileExtension(filename);
  if (ext) return ext.toUpperCase() + ' 文件';
  return '未知类型';
}
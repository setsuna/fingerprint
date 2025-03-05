// app/services/synologyService.ts

/**
 * Synology File Station API Service
 * 用于连接和访问Synology NAS的File Station API
 */

// API 基础URL
const API_BASE_URL = 'http://192.168.20.249:5000';

// API 端点
const API_ENDPOINTS = {
  AUTH: '/webapi/auth.cgi',
  FILE_STATION: '/webapi/entry.cgi',
};

// 账号信息
const CREDENTIALS = {
  username: 'zs',
  password: 'Zz13173632655',
};

// Session ID
let sid: string | null = null;

/**
 * 获取文件类型图标
 * @param fileName 文件名
 * @returns 对应的图标类型
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'exe':
    case 'msi':
      return 'installer';
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'ppt':
    case 'pptx':
      return 'powerpoint';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'video';
    default:
      if (!extension) return 'folder';
      return 'file';
  }
}

/**
 * 登录到 Synology NAS
 * @returns 登录成功与否的结果
 */
export async function login(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH}?api=SYNO.API.Auth&version=3&method=login&account=${CREDENTIALS.username}&passwd=${CREDENTIALS.password}&session=FileStation&format=json`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      sid = data.data.sid;
      console.log('登录成功', sid);
      return true;
    } else {
      console.error('登录失败:', data.error);
      return false;
    }
  } catch (error) {
    console.error('登录异常:', error);
    return false;
  }
}

/**
 * 登出 Synology NAS
 */
export async function logout(): Promise<void> {
  if (!sid) return;
  
  try {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH}?api=SYNO.API.Auth&version=1&method=logout&session=FileStation&_sid=${sid}`;
    
    await fetch(url, {
      method: 'GET',
    });
    
    sid = null;
  } catch (error) {
    console.error('登出异常:', error);
  }
}

/**
 * 获取指定路径下的文件和文件夹
 * @param folderPath 文件夹路径
 * @returns 文件和文件夹列表
 */
export async function listFiles(folderPath: string = '/home/drive'): Promise<any> {
  try {
    // 如果没有登录或会话已过期，则重新登录
    if (!sid) {
      const loggedIn = await login();
      if (!loggedIn) {
        throw new Error('无法登录到Synology NAS');
      }
    }
    
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: folderPath,
      additional: 'size,time,type',
      _sid: sid as string
    });
    
    const url = `${API_BASE_URL}${API_ENDPOINTS.FILE_STATION}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // 如果返回401或403，可能是会话已过期，尝试重新登录
      if (response.status === 401 || response.status === 403) {
        sid = null;
        return listFiles(folderPath); // 递归调用自身，重新登录并获取文件列表
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.files;
    } else {
      throw new Error(`API error: ${data.error.code}`);
    }
  } catch (error) {
    console.error('获取文件列表异常:', error);
    throw error;
  }
}

/**
 * 获取文件下载链接
 * @param filePath 文件路径
 * @returns 下载链接
 */
export async function getDownloadLink(filePath: string): Promise<string> {
  try {
    // 如果没有登录或会话已过期，则重新登录
    if (!sid) {
      const loggedIn = await login();
      if (!loggedIn) {
        throw new Error('无法登录到Synology NAS');
      }
    }
    
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path: filePath,
      mode: 'download',
      _sid: sid as string
    });
    
    // 返回完整的下载URL
    return `${API_BASE_URL}${API_ENDPOINTS.FILE_STATION}?${params.toString()}`;
  } catch (error) {
    console.error('获取下载链接异常:', error);
    throw error;
  }
}

/**
 * 接口：文件或文件夹
 */
export interface FileItem {
  isdir: boolean;
  name: string;
  path: string;
  size: number;
  time: {
    ctime: number;
    mtime: number;
    atime: number;
  };
  type?: string;
  children?: FileItem[];
}

/**
 * 从API数据中构建文件树
 * @returns 文件树结构
 */
export async function buildFileTree(rootPath: string = '/home/drive'): Promise<FileItem[]> {
  try {
    const files = await listFiles(rootPath);
    return files.map((file: any) => ({
      isdir: file.isdir,
      name: file.name,
      path: file.path,
      size: file.additional.size,
      time: {
        ctime: file.additional.time.ctime,
        mtime: file.additional.time.mtime,
        atime: file.additional.time.atime,
      },
      type: getFileIcon(file.name),
    }));
  } catch (error) {
    console.error('构建文件树异常:', error);
    return [];
  }
}

/**
 * 获取一级目录（根目录下的文件夹）
 * @returns 一级目录列表
 */
export async function getFirstLevelDirectories(): Promise<FileItem[]> {
  try {
    const rootItems = await buildFileTree();
    return rootItems.filter(item => item.isdir);
  } catch (error) {
    console.error('获取一级目录异常:', error);
    return [];
  }
}

/**
 * 获取二级目录（指定一级目录下的文件夹）
 * @param firstLevelPath 一级目录路径
 * @returns 二级目录列表
 */
export async function getSecondLevelDirectories(firstLevelPath: string): Promise<FileItem[]> {
  try {
    const items = await buildFileTree(firstLevelPath);
    return items.filter(item => item.isdir);
  } catch (error) {
    console.error('获取二级目录异常:', error);
    return [];
  }
}

/**
 * 获取三级文件列表（指定二级目录下的所有文件和文件夹）
 * @param secondLevelPath 二级目录路径
 * @returns 文件和文件夹列表
 */
export async function getThirdLevelItems(secondLevelPath: string): Promise<FileItem[]> {
  try {
    return await buildFileTree(secondLevelPath);
  } catch (error) {
    console.error('获取三级项目异常:', error);
    return [];
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳
 * @returns 格式化后的日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
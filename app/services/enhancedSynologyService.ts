// app/services/enhancedSynologyService.ts

import SynologyConfig from '@/app/config/synologyConfig';

/**
 * Synology API 响应接口
 */
interface SynologyResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message?: string;
  };
}

/**
 * API 错误信息映射
 */
const API_ERROR_MESSAGES: Record<number, string> = {
  100: '未知错误',
  101: '无效参数',
  102: 'API 版本不支持',
  103: '方法不存在',
  104: '超时',
  105: '会话已过期',
  106: '会话中断',
  107: '权限不足',
  108: '权限不足',
  400: '无效参数',
  401: '未经授权的请求',
  402: '无效的授权',
  403: '禁止访问',
  404: '资源不存在',
  405: '方法不允许',
  406: '不接受',
  407: '需要代理授权',
  408: '请求超时',
  409: '冲突',
  413: '请求实体过大',
  414: 'URI 过长',
  415: '不支持的媒体类型',
  423: '锁定错误',
  500: '内部服务器错误',
  501: '不支持该功能',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

/**
 * Synology API 错误
 */
export class SynologyApiError extends Error {
  code: number;
  
  constructor(code: number, message?: string) {
    const errorMessage = message || API_ERROR_MESSAGES[code] || '未知错误';
    super(errorMessage);
    this.name = 'SynologyApiError';
    this.code = code;
  }
}

/**
 * 会话管理
 */
class SessionManager {
  private sid: string | null = null;
  private loginPromise: Promise<string> | null = null;
  
  /**
   * 获取会话ID
   */
  async getSid(): Promise<string> {
    if (this.sid) {
      return this.sid;
    }
    
    // 如果已经有一个登录过程在进行，等待它完成
    if (this.loginPromise) {
      return this.loginPromise;
    }
    
    // 开始新的登录过程
    this.loginPromise = this.login();
    
    try {
      this.sid = await this.loginPromise;
      return this.sid;
    } finally {
      this.loginPromise = null;
    }
  }
  
  /**
   * 清除会话ID
   */
  clearSid(): void {
    this.sid = null;
  }
  
  /**
   * 设置会话ID
   */
  setSid(sid: string): void {
    this.sid = sid;
  }
  
  /**
   * 登录到Synology NAS
   */
  private async login(): Promise<string> {
    const { API_BASE_URL, API_ENDPOINTS, CREDENTIALS } = SynologyConfig;
    
    const params = new URLSearchParams({
      api: 'SYNO.API.Auth',
      version: '3',
      method: 'login',
      account: CREDENTIALS.username,
      passwd: CREDENTIALS.password,
      session: 'FileStation',
      format: 'json'
    });
    
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH}?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new SynologyApiError(response.status);
      }
      
      const data: SynologyResponse<{ sid: string }> = await response.json();
      
      if (!data.success) {
        throw new SynologyApiError(data.error?.code || 100, data.error?.message);
      }
      
      return data.data!.sid;
    } catch (error) {
      if (error instanceof SynologyApiError) {
        throw error;
      }
      throw new SynologyApiError(100, '无法连接到Synology NAS');
    }
  }
  
  /**
   * 登出Synology NAS
   */
  async logout(): Promise<void> {
    if (!this.sid) return;
    
    const { API_BASE_URL, API_ENDPOINTS } = SynologyConfig;
    
    const params = new URLSearchParams({
      api: 'SYNO.API.Auth',
      version: '1',
      method: 'logout',
      session: 'FileStation',
      _sid: this.sid
    });
    
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH}?${params.toString()}`;
    
    try {
      await fetch(url, { method: 'GET' });
    } catch (error) {
      console.error('登出异常:', error);
    } finally {
      this.sid = null;
    }
  }
}

/**
 * 文件 API 客户端
 */
class FileStationClient {
  private sessionManager: SessionManager;
  
  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }
  
  /**
   * 发送 API 请求
   */
  private async sendRequest<T>(params: URLSearchParams): Promise<T> {
    const { API_BASE_URL, API_ENDPOINTS } = SynologyConfig;
    
    // 获取会话 ID
    const sid = await this.sessionManager.getSid();
    params.append('_sid', sid);
    
    const url = `${API_BASE_URL}${API_ENDPOINTS.FILE_STATION}?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // 如果返回401或403，可能是会话已过期
        if (response.status === 401 || response.status === 403) {
          this.sessionManager.clearSid();
          // 重新尝试
          return this.sendRequest<T>(params);
        }
        throw new SynologyApiError(response.status);
      }
      
      const data: SynologyResponse<T> = await response.json();
      
      if (!data.success) {
        // 如果会话过期，重新登录并重试
        if (data.error?.code === 105 || data.error?.code === 106) {
          this.sessionManager.clearSid();
          // 重新尝试
          return this.sendRequest<T>(params);
        }
        throw new SynologyApiError(data.error?.code || 100, data.error?.message);
      }
      
      return data.data as T;
    } catch (error) {
      if (error instanceof SynologyApiError) {
        throw error;
      }
      throw new SynologyApiError(100, '请求发送失败');
    }
  }
  
  /**
   * 获取文件和文件夹列表
   */
  async listFiles(folderPath: string = SynologyConfig.ROOT_PATH): Promise<any[]> {
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'list',
      folder_path: folderPath,
      additional: 'size,time,type'
    });
    
    const data = await this.sendRequest<{ files: any[] }>(params);
    return data.files;
  }
  
  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<any> {
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.List',
      version: '2',
      method: 'getinfo',
      path: filePath,
      additional: 'size,time,type,perm'
    });
    
    const data = await this.sendRequest<{ files: any[] }>(params);
    return data.files[0];
  }
  
  /**
   * 获取文件下载链接
   */
  async getDownloadLink(filePath: string): Promise<string> {
    // 获取会话ID
    const sid = await this.sessionManager.getSid();
    
    const { API_BASE_URL, API_ENDPOINTS } = SynologyConfig;
    
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.Download',
      version: '2',
      method: 'download',
      path: filePath,
      mode: 'download',
      _sid: sid
    });
    
    return `${API_BASE_URL}${API_ENDPOINTS.FILE_STATION}?${params.toString()}`;
  }
  
  /**
   * 搜索文件
   */
  async searchFiles(
    folderPath: string = SynologyConfig.ROOT_PATH,
    keyword: string
  ): Promise<any[]> {
    const params = new URLSearchParams({
      api: 'SYNO.FileStation.Search',
      version: '2',
      method: 'start',
      folder_path: folderPath,
      pattern: keyword,
      additional: 'size,time,type'
    });
    
    // 开始搜索任务
    const startData = await this.sendRequest<{ taskid: string }>(params);
    const taskId = startData.taskid;
    
    // 等待搜索完成
    let isFinished = false;
    let files: any[] = [];
    
    while (!isFinished) {
      // 等待一秒
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取搜索状态
      const statusParams = new URLSearchParams({
        api: 'SYNO.FileStation.Search',
        version: '2',
        method: 'status',
        taskid: taskId
      });
      
      const statusData = await this.sendRequest<{ finished: boolean }>(statusParams);
      isFinished = statusData.finished;
      
      // 如果完成，获取结果
      if (isFinished) {
        const listParams = new URLSearchParams({
          api: 'SYNO.FileStation.Search',
          version: '2',
          method: 'list',
          taskid: taskId,
          additional: 'size,time,type'
        });
        
        const listData = await this.sendRequest<{ files: any[] }>(listParams);
        files = listData.files;
      }
    }
    
    // 清理搜索任务
    const cleanupParams = new URLSearchParams({
      api: 'SYNO.FileStation.Search',
      version: '2',
      method: 'stop',
      taskid: taskId
    });
    
    await this.sendRequest(cleanupParams);
    
    return files;
  }
}

// 创建单例实例
const sessionManager = new SessionManager();
const fileStationClient = new FileStationClient(sessionManager);

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 文件项接口
 */
export interface FileItem {
  isdir: boolean;
  name: string;
  path: string;
  size: number;
  type?: string;
  time: {
    ctime: number; // 创建时间
    mtime: number; // 修改时间
    atime: number; // 访问时间
  };
}

/**
 * 从API响应构建文件项
 */
export function buildFileItem(file: any): FileItem {
  return {
    isdir: file.isdir,
    name: file.name,
    path: file.path,
    size: file.additional?.size || 0,
    type: getFileIcon(file.name),
    time: {
      ctime: file.additional?.time?.ctime || 0,
      mtime: file.additional?.time?.mtime || 0,
      atime: file.additional?.time?.atime || 0
    }
  };
}

/**
 * 获取文件图标类型
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (extension === '') return 'folder';
  
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
      return 'file';
  }
}

/**
 * 获取指定路径下的文件和文件夹
 */
export async function listFiles(folderPath: string = SynologyConfig.ROOT_PATH): Promise<FileItem[]> {
  try {
    const files = await fileStationClient.listFiles(folderPath);
    return files.map(buildFileItem);
  } catch (error) {
    console.error('获取文件列表异常:', error);
    throw error;
  }
}

/**
 * 获取一级目录（根目录下的文件夹）
 */
export async function getFirstLevelDirectories(): Promise<FileItem[]> {
  try {
    const rootItems = await listFiles();
    return rootItems.filter(item => item.isdir);
  } catch (error) {
    console.error('获取一级目录异常:', error);
    throw error;
  }
}

/**
 * 获取二级目录（指定一级目录下的文件夹）
 */
export async function getSecondLevelDirectories(firstLevelPath: string): Promise<FileItem[]> {
  try {
    const items = await listFiles(firstLevelPath);
    return items.filter(item => item.isdir);
  } catch (error) {
    console.error('获取二级目录异常:', error);
    throw error;
  }
}

/**
 * 获取三级文件列表（指定二级目录下的所有文件和文件夹）
 */
export async function getThirdLevelItems(secondLevelPath: string): Promise<FileItem[]> {
  try {
    return await listFiles(secondLevelPath);
  } catch (error) {
    console.error('获取三级项目异常:', error);
    throw error;
  }
}

/**
 * 获取文件下载链接
 */
export async function getDownloadLink(filePath: string): Promise<string> {
  try {
    return await fileStationClient.getDownloadLink(filePath);
  } catch (error) {
    console.error('获取下载链接异常:', error);
    throw error;
  }
}

/**
 * 搜索文件
 */
export async function searchFiles(
  keyword: string,
  folderPath: string = SynologyConfig.ROOT_PATH
): Promise<FileItem[]> {
  try {
    const files = await fileStationClient.searchFiles(folderPath, keyword);
    return files.map(buildFileItem);
  } catch (error) {
    console.error('搜索文件异常:', error);
    throw error;
  }
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  return sessionManager.logout();
}
// app/utils/apiErrorHandler.ts

/**
 * API 错误处理工具
 */

/**
 * API 错误类
 */
export class ApiError extends Error {
    status: number;
    
    constructor(message: string, status: number = 500) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
  
  /**
   * 处理 API 响应
   * @param response 响应对象
   * @returns 处理后的响应数据
   * @throws ApiError 如果响应不成功
   */
  export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API请求失败 (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `API错误: ${errorData.error}`;
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
        }
      } catch (e) {
        // 如果无法解析响应为JSON，使用默认错误消息
      }
      
      throw new ApiError(errorMessage, response.status);
    }
    
    return await response.json() as T;
  }
  
  /**
   * 创建带错误处理的请求函数
   * @param baseUrl 基础URL
   * @returns 发送请求的函数
   */
  export function createApiClient(baseUrl: string = '') {
    return {
      /**
       * 发送 GET 请求
       * @param endpoint 端点
       * @param params 查询参数
       * @returns 响应数据
       */
      async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const url = `${baseUrl}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        return handleApiResponse<T>(response);
      },
      
      /**
       * 发送 POST 请求
       * @param endpoint 端点
       * @param data 请求数据
       * @returns 响应数据
       */
      async post<T>(endpoint: string, data?: any): Promise<T> {
        const url = `${baseUrl}${endpoint}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });
        
        return handleApiResponse<T>(response);
      }
    };
  }
  
  // 创建默认API客户端
  export const apiClient = createApiClient();
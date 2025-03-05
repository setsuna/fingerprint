// app/api/synology/route.ts
import { NextRequest, NextResponse } from 'next/server';
import SynologyConfig from '@/app/config/synologyConfig';

/**
 * Synology API 代理路由
 * 解决前端请求 Synology NAS API 的跨域问题
 */

// 用于缓存会话 ID 的对象
let sessionCache: {
  sid: string | null;
  expiresAt: number | null;
} = {
  sid: null,
  expiresAt: null,
};

/**
 * 登录到 Synology NAS 并获取会话 ID
 */
async function login(): Promise<string> {
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
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`登录失败: HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`登录失败: ${data.error?.code} ${data.error?.message || ''}`);
  }
  
  // 设置会话缓存，有效期15分钟
  sessionCache.sid = data.data.sid;
  sessionCache.expiresAt = Date.now() + 15 * 60 * 1000;
  
  return data.data.sid;
}

/**
 * 确保有可用的会话 ID
 */
async function ensureSession(): Promise<string> {
  // 如果会话存在且未过期，则返回
  if (sessionCache.sid && sessionCache.expiresAt && Date.now() < sessionCache.expiresAt) {
    return sessionCache.sid;
  }
  
  // 否则登录并获取新会话
  return await login();
}

/**
 * 代理 Synology API 请求
 */
export async function GET(request: NextRequest) {
  try {
    // 从查询参数中获取 API 端点、方法和其他参数
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    // 确保 endpoint 参数存在
    if (!endpoint) {
      return NextResponse.json(
        { error: '缺少必要的 endpoint 参数' },
        { status: 400 }
      );
    }
    
    const { API_BASE_URL, API_ENDPOINTS } = SynologyConfig;
    
    // 根据 endpoint 确定目标 URL
    let targetEndpoint = '';
    if (endpoint === 'auth') {
      targetEndpoint = API_ENDPOINTS.AUTH;
    } else if (endpoint === 'filestation') {
      targetEndpoint = API_ENDPOINTS.FILE_STATION;
    } else {
      return NextResponse.json(
        { error: '无效的 endpoint 参数' },
        { status: 400 }
      );
    }
    
    // 获取其他必要参数
    const api = searchParams.get('api');
    const method = searchParams.get('method');
    
    // 验证参数有效性
    if (!api || !method) {
      return NextResponse.json(
        { error: '缺少必要的 api 或 method 参数' },
        { status: 400 }
      );
    }
    
    // 为非登录请求自动添加会话 ID
    const isLoginRequest = endpoint === 'auth' && method === 'login';
    let sid = null;
    
    if (!isLoginRequest) {
      try {
        sid = await ensureSession();
      } catch (error) {
        console.error('获取会话失败:', error);
        return NextResponse.json(
          { error: '无法连接到 Synology NAS' },
          { status: 500 }
        );
      }
    }
    
    // 构建请求参数
    const queryParams = new URLSearchParams();
    
    // 复制所有原始查询参数（除了 endpoint，它是 Next.js API 使用的）
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'endpoint') {
        queryParams.append(key, value);
      }
    }
    
    // 添加会话 ID（如果需要）
    if (sid && !isLoginRequest) {
      queryParams.append('_sid', sid);
    }
    
    // 构建目标 URL
    const targetUrl = `${API_BASE_URL}${targetEndpoint}?${queryParams.toString()}`;
    
    // 发送请求到 Synology NAS
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 对于文件下载，直接传递二进制响应
    if (endpoint === 'filestation' && method === 'download') {
      const blob = await response.blob();
      
      // 获取原始响应头
      const headers = new Headers();
      response.headers.forEach((value, key) => {
        // 复制内容类型和内容处置等关键头
        if (key.toLowerCase() === 'content-type' || 
            key.toLowerCase() === 'content-disposition' ||
            key.toLowerCase() === 'content-length') {
          headers.append(key, value);
        }
      });
      
      return new NextResponse(blob, {
        status: response.status,
        headers
      });
    }
    
    // 对于 API 响应，返回 JSON
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API 代理异常:', error);
    return NextResponse.json(
      { error: '处理请求时出错', message: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 处理 POST 请求
 */
export async function POST(request: NextRequest) {
  // 目前 Synology API 主要使用 GET 请求，但可以根据需要添加 POST 支持
  return NextResponse.json(
    { error: 'POST 方法暂不支持' },
    { status: 405 }
  );
}
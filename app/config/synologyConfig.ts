// app/config/synologyConfig.ts

/**
 * Synology NAS和文件站点配置
 */

export const SynologyConfig = {
    // API基础URL - Synology NAS地址
    API_BASE_URL: 'http://192.168.30.249:5000',
    
    // 登录凭证
    CREDENTIALS: {
      username: 'zs',
      password: 'Zz13173632655',
    },
    
    // 根文件夹路径
    ROOT_PATH: '/home/drive',
    
    // API端点
    API_ENDPOINTS: {
      AUTH: '/webapi/auth.cgi',
      FILE_STATION: '/webapi/entry.cgi',
    },
    
    // 自动登录重试次数
    LOGIN_RETRY_COUNT: 3,
    
    // 文件类型对应的图标样式
    FILE_ICON_COLORS: {
      folder: 'text-brand-red',
      exe: 'text-green-500',
      msi: 'text-green-500',
      zip: 'text-purple-500',
      rar: 'text-purple-500',
      '7z': 'text-purple-500',
      pdf: 'text-red-500',
      doc: 'text-blue-600',
      docx: 'text-blue-600',
      xls: 'text-green-600',
      xlsx: 'text-green-600',
      ppt: 'text-orange-500',
      pptx: 'text-orange-500',
      jpg: 'text-pink-500',
      jpeg: 'text-pink-500',
      png: 'text-pink-500',
      default: 'text-gray-600'
    },
    
    // 页面标题设置
    PAGE_TITLES: {
      main: '驱动下载',
      firstLevel: '一级目录',
      secondLevel: '二级目录',
      fileList: '文件列表',
    },
    
    // 页面描述
    PAGE_DESCRIPTION: '获取驱动程序和文档',
  };
  
  export default SynologyConfig;
'use client'

import { useState } from 'react'
import { Download, FileDown, Monitor, HardDrive, Smartphone, Fingerprint, CreditCard, Camera, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageNavigator from '@/app/components/PageNavigator'

// Define interface for driver category and driver item
interface DriverItem {
  id: string;
  name: string;
  icon: any;
  version: string;
  date: string;
  size: string;
  os: string[];
  description: string;
  downloadUrl: string;
}

interface DriverSubCategory {
  id: string;
  name: string;
  items: DriverItem[];
}

interface DriverCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  subCategories: DriverSubCategory[];
}

// Mock data structure based on potential driver list.xlsx structure
const driverCategories: DriverCategory[] = [
  {
    id: 'fingerprint',
    name: '指纹识别',
    icon: Fingerprint,
    color: 'text-brand-red',
    subCategories: [
      {
        id: 'fingerprint-scanners',
        name: '指纹扫描仪',
        items: [
          {
            id: 'zk4500',
            name: 'ZK4500指纹采集器驱动',
            icon: FileDown,
            version: 'v3.2.1',
            date: '2024-12-10',
            size: '12.5 MB',
            os: ['Windows 10', '麒麟2303', 'UOS'],
            description: '适用于ZK4500指纹采集器的最新版本驱动程序，支持Windows和国产操作系统。',
            downloadUrl: '#zk4500-driver'
          },
          {
            id: 'uru4500',
            name: 'URU4500指纹采集器驱动',
            icon: FileDown,
            version: 'v2.1.0',
            date: '2024-11-25',
            size: '10.2 MB',
            os: ['Windows 10/11', 'Windows 7/8'],
            description: '适用于URU4500指纹采集器的驱动，兼容Windows操作系统。',
            downloadUrl: '#uru4500-driver'
          }
        ]
      },
      {
        id: 'fingerprint-sdk',
        name: 'SDK开发包',
        items: [
          {
            id: 'fingerprint-sdk',
            name: '指纹识别SDK',
            icon: FileDown,
            version: 'v4.0.2',
            date: '2024-12-15',
            size: '25.7 MB',
            os: ['Windows 10/11', '麒麟2303'],
            description: '指纹识别开发包，包含API接口文档和示例代码。',
            downloadUrl: '#fingerprint-sdk'
          }
        ]
      }
    ]
  },
  {
    id: 'idcard',
    name: '身份证识别',
    icon: CreditCard,
    color: 'text-green-500',
    subCategories: [
      {
        id: 'idcard-readers',
        name: '身份证读卡器',
        items: [
          {
            id: 'huashi-cvr100u',
            name: '华视CVR-100U读卡器驱动',
            icon: Monitor,
            version: 'v2.5.0',
            date: '2024-11-25',
            size: '8.3 MB',
            os: ['Windows 10/11', 'Windows 7/8', '麒麟2303', 'UOS'],
            description: '华视CVR-100U身份证读卡器驱动程序，支持Windows和国产操作系统。',
            downloadUrl: '#huashi-driver'
          },
          {
            id: 'deka-d2',
            name: '德卡D2读卡器驱动',
            icon: Monitor,
            version: 'v1.8.3',
            date: '2024-10-30',
            size: '7.5 MB',
            os: ['Windows 10/11', '麒麟2303'],
            description: '德卡D2身份证读卡器驱动程序。',
            downloadUrl: '#deka-driver'
          }
        ]
      },
      {
        id: 'idcard-sdk',
        name: 'SDK开发包',
        items: [
          {
            id: 'idcard-sdk',
            name: '身份证识别SDK',
            icon: FileDown,
            version: 'v3.1.5',
            date: '2024-12-05',
            size: '18.3 MB',
            os: ['Windows 10/11', '麒麟2303', 'UOS'],
            description: '身份证识别开发包，包含API接口和示例程序。',
            downloadUrl: '#idcard-sdk'
          }
        ]
      }
    ]
  },
  {
    id: 'camera',
    name: '高拍仪',
    icon: Camera,
    color: 'text-purple-500',
    subCategories: [
      {
        id: 'camera-drivers',
        name: '高拍仪驱动',
        items: [
          {
            id: 'liangtian',
            name: '良田高拍仪驱动',
            icon: HardDrive,
            version: 'v1.8.3',
            date: '2024-12-15',
            size: '15.7 MB',
            os: ['Windows 10/11', 'Windows 7/8'],
            description: '良田品牌高拍仪设备驱动程序。',
            downloadUrl: '#liangtian-driver'
          },
          {
            id: 'founder',
            name: '方正高拍仪驱动',
            icon: HardDrive,
            version: 'v2.0.1',
            date: '2024-11-10',
            size: '14.2 MB',
            os: ['Windows 10/11', '麒麟2303'],
            description: '方正品牌高拍仪设备驱动程序。',
            downloadUrl: '#founder-driver'
          }
        ]
      }
    ]
  },
  {
    id: 'printer',
    name: '打印机',
    icon: Monitor,
    color: 'text-blue-500',
    subCategories: [
      {
        id: 'label-printers',
        name: '标签打印机',
        items: [
          {
            id: 'zebra',
            name: 'Zebra标签打印机驱动',
            icon: HardDrive,
            version: 'v2.5.1',
            date: '2024-12-01',
            size: '22.5 MB',
            os: ['Windows 10/11', 'Windows 7/8'],
            description: 'Zebra品牌标签打印机驱动程序。',
            downloadUrl: '#zebra-driver'
          }
        ]
      },
      {
        id: 'thermal-printers',
        name: '热敏打印机',
        items: [
          {
            id: 'epson',
            name: 'Epson热敏打印机驱动',
            icon: HardDrive,
            version: 'v1.9.3',
            date: '2024-11-15',
            size: '18.3 MB',
            os: ['Windows 10/11', 'Windows 7/8', '麒麟2303'],
            description: 'Epson品牌热敏打印机驱动程序。',
            downloadUrl: '#epson-driver'
          }
        ]
      }
    ]
  },
  {
    id: 'other',
    name: '其他设备',
    icon: Smartphone,
    color: 'text-orange-500',
    subCategories: [
      {
        id: 'barcode-scanners',
        name: '条码扫描器',
        items: [
          {
            id: 'honeywell',
            name: 'Honeywell条码扫描器驱动',
            icon: HardDrive,
            version: 'v1.5.2',
            date: '2024-10-20',
            size: '9.8 MB',
            os: ['Windows 10/11', 'Windows 7/8'],
            description: 'Honeywell品牌条码扫描器驱动程序。',
            downloadUrl: '#honeywell-driver'
          }
        ]
      }
    ]
  }
];

// Component to render a single driver item
const DriverCard = ({ driver, osFilter }: { driver: DriverItem, osFilter: string }) => {
  // Check if this driver supports the filtered OS
  const isSupported = osFilter === 'all' || driver.os.some(os => os.includes(osFilter));
  
  // If filtering is active and this driver doesn't match, don't render it
  if (osFilter !== 'all' && !isSupported) return null;
  
  const handleDownload = () => {
    alert(`开始下载 ${driver.name}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 mb-4"
    >
      <div className="flex items-start">
        <div className="bg-gray-100 p-3 rounded-lg">
          <driver.icon size={28} className="text-brand-red" />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{driver.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{driver.description}</p>
            </div>
            
            <button
              onClick={handleDownload}
              className="bg-brand-red hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Download size={16} className="mr-1" />
              下载
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">版本:</span>
              <span className="font-medium">{driver.version}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">发布日期:</span>
              <span className="font-medium">{driver.date}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">文件大小:</span>
              <span className="font-medium">{driver.size}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">支持系统:</span>
              <span className="font-medium">{driver.os.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component to render a subcategory with its driver items
const DriverSubCategory = ({ 
  subCategory, 
  osFilter,
  expanded,
  toggleExpand
}: { 
  subCategory: DriverSubCategory, 
  osFilter: string,
  expanded: boolean,
  toggleExpand: () => void
}) => {
  return (
    <div className="mb-4">
      <button 
        onClick={toggleExpand}
        className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors mb-2"
      >
        <span className="font-medium text-gray-700">{subCategory.name}</span>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pl-4 border-l-2 border-gray-100"
          >
            {subCategory.items.map(driver => (
              <DriverCard key={driver.id} driver={driver} osFilter={osFilter} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DriverPage() {
  // State for active tab (category)
  const [activeCategory, setActiveCategory] = useState<string>(driverCategories[0].id);
  
  // State for expanded subcategories
  const [expandedSubCategories, setExpandedSubCategories] = useState<Record<string, boolean>>({});
  
  // State for OS filter
  const [osFilter, setOsFilter] = useState<string>('all');
  
  // State for search
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Get the active category data
  const activeCategoryData = driverCategories.find(cat => cat.id === activeCategory);
  
  // Toggle subcategory expansion
  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategories(prev => ({
      ...prev,
      [subCategoryId]: !prev[subCategoryId]
    }));
  };
  
  // Filter drivers by search query
  const getFilteredSubCategories = () => {
    if (!activeCategoryData) return [];
    
    if (!searchQuery) return activeCategoryData.subCategories;
    
    return activeCategoryData.subCategories.map(subCat => ({
      ...subCat,
      items: subCat.items.filter(driver => 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(subCat => subCat.items.length > 0);
  };
  
  const filteredSubCategories = getFilteredSubCategories();
  
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>驱动下载</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">提供各硬件设备的驱动程序下载</span>
          </div>
        </div>
        
        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索驱动程序..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white w-full border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={osFilter}
              onChange={(e) => setOsFilter(e.target.value)}
              className="bg-transparent border-none text-gray-700 focus:outline-none text-sm"
            >
              <option value="all">所有系统</option>
              <option value="Windows">Windows</option>
              <option value="麒麟">麒麟</option>
              <option value="UOS">UOS</option>
            </select>
          </div>
        </div>
        
        {/* 主分类选项卡 */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-200">
            {driverCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center ${
                  activeCategory === category.id
                    ? 'text-brand-red border-b-2 border-brand-red'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <category.icon size={16} className={`mr-1.5 ${category.color}`} />
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* 子分类和驱动项 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {activeCategoryData && (
            <>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <activeCategoryData.icon size={20} className={`mr-2 ${activeCategoryData.color}`} />
                {activeCategoryData.name}驱动下载
              </h2>
              
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map(subCategory => (
                  <DriverSubCategory
                    key={subCategory.id}
                    subCategory={subCategory}
                    osFilter={osFilter}
                    expanded={Boolean(expandedSubCategories[subCategory.id])}
                    toggleExpand={() => toggleSubCategory(subCategory.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">没有找到匹配的驱动程序</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* 页面导航 */}
      <PageNavigator />
    </div>
  );
}
'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, HardDrive } from 'lucide-react'
import PageNavigator from '@/app/components/PageNavigator'
import * as SynologyService from '@/app/services/enhancedSynologyService'
import SynologyConfig from '@/app/config/synologyConfig'
import { sortFilesByName, sortFilesBySize, sortFilesByModifiedTime } from '@/app/utils/fileUtils'

// 导入创建的组件
import DirectorySidebar from './DirectorySidebar'
import TabNavigation from './TabNavigation'
import Breadcrumbs from './Breadcrumbs'
import SearchBar from './SearchBar'
import FileList from './FileList'
import FileGridView from './FileGridView'
import { FileLargeCard } from './FileGridView'
import FileDetails from './FileDetails'
import ViewSelector, { ViewMode, SortType, SortDirection } from './ViewSelector'
import { FullScreenLoader, InlineLoader } from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function DriverPage() {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 目录和文件数据
  const [firstLevelDirs, setFirstLevelDirs] = useState<SynologyService.FileItem[]>([]);
  const [secondLevelDirs, setSecondLevelDirs] = useState<SynologyService.FileItem[]>([]);
  const [thirdLevelItems, setThirdLevelItems] = useState<SynologyService.FileItem[]>([]);
  
  // 当前选中的目录
  const [selectedFirstLevel, setSelectedFirstLevel] = useState<SynologyService.FileItem | null>(null);
  const [selectedSecondLevel, setSelectedSecondLevel] = useState<SynologyService.FileItem | null>(null);
  
  // 当前选中的文件（用于显示详情）
  const [selectedFile, setSelectedFile] = useState<SynologyService.FileItem | null>(null);
  
  // 面包屑导航路径
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string; path: string}[]>([
    { name: '根目录', path: SynologyConfig.ROOT_PATH }
  ]);
  
  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 视图模式和排序
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // 初始化 - 获取一级目录
  useEffect(() => {
    async function initData() {
      try {
        setInitialLoading(true);
        setError(null);
        
        // 获取一级目录
        const firstLevel = await SynologyService.getFirstLevelDirectories();
        setFirstLevelDirs(firstLevel);
        
        // 如果有一级目录，默认选中第一个
        if (firstLevel.length > 0) {
          setSelectedFirstLevel(firstLevel[0]);
        }
        
      } catch (err) {
        if (err instanceof SynologyService.SynologyApiError) {
          setError(`初始化失败: ${err.message}`);
        } else {
          setError('初始化失败，请检查网络连接或刷新页面重试');
        }
        console.error('初始化异常:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    
    initData();
    
    // 组件卸载时登出
    return () => {
      SynologyService.logout();
    };
  }, []);
  
  // 选择一级目录后，获取二级目录
  useEffect(() => {
    async function loadSecondLevel() {
      if (!selectedFirstLevel) return;
      
      try {
        setLoading(true);
        setSecondLevelDirs([]);
        setThirdLevelItems([]);
        setSelectedSecondLevel(null);
        
        // 更新面包屑
        setBreadcrumbs([
          { name: '根目录', path: SynologyConfig.ROOT_PATH },
          { name: selectedFirstLevel.name, path: selectedFirstLevel.path }
        ]);
        
        // 获取二级目录
        const secondLevel = await SynologyService.getSecondLevelDirectories(selectedFirstLevel.path);
        setSecondLevelDirs(secondLevel);
        
        // 如果有二级目录，默认选中第一个并加载其内容
        if (secondLevel.length > 0) {
          setSelectedSecondLevel(secondLevel[0]);
        }
        
      } catch (err) {
        if (err instanceof SynologyService.SynologyApiError) {
          setError(`加载目录失败: ${err.message}`);
        } else {
          setError('加载二级目录失败');
        }
        console.error('加载二级目录异常:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSecondLevel();
  }, [selectedFirstLevel]);
  
  // 选择二级目录后，获取三级文件列表
  useEffect(() => {
    async function loadThirdLevel() {
      if (!selectedSecondLevel) return;
      
      try {
        setLoading(true);
        setThirdLevelItems([]);
        
        // 更新面包屑
        if (selectedFirstLevel) {
          setBreadcrumbs([
            { name: '根目录', path: SynologyConfig.ROOT_PATH },
            { name: selectedFirstLevel.name, path: selectedFirstLevel.path },
            { name: selectedSecondLevel.name, path: selectedSecondLevel.path }
          ]);
        }
        
        // 获取三级文件列表
        const thirdLevel = await SynologyService.getThirdLevelItems(selectedSecondLevel.path);
        setThirdLevelItems(thirdLevel);
        
      } catch (err) {
        if (err instanceof SynologyService.SynologyApiError) {
          setError(`加载文件列表失败: ${err.message}`);
        } else {
          setError('加载文件列表失败');
        }
        console.error('加载文件列表异常:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadThirdLevel();
  }, [selectedSecondLevel, selectedFirstLevel]);
  
  // 处理排序和筛选
  const filteredAndSortedFiles = (() => {
    // 先筛选
    let result = thirdLevelItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // 再排序
    if (sortType === 'name') {
      result = sortFilesByName(result, sortDirection === 'asc');
    } else if (sortType === 'size') {
      result = sortFilesBySize(result, sortDirection === 'asc');
    } else if (sortType === 'time') {
      result = sortFilesByModifiedTime(result, sortDirection === 'asc');
    }
    
    return result;
  })();
  
  // 处理一级目录点击
  const handleFirstLevelClick = (dir: SynologyService.FileItem) => {
    setSelectedFirstLevel(dir);
  };
  
  // 处理二级目录点击
  const handleSecondLevelClick = (dir: SynologyService.FileItem) => {
    setSelectedSecondLevel(dir);
  };
  
  // 处理三级项目点击
  const handleThirdLevelClick = async (item: SynologyService.FileItem) => {
    // 如果是文件夹，则进入该文件夹
    if (item.isdir) {
      try {
        setLoading(true);
        
        // 更新面包屑
        if (selectedFirstLevel && selectedSecondLevel) {
          setBreadcrumbs([...breadcrumbs, { name: item.name, path: item.path }]);
        }
        
        // 获取该文件夹下的文件列表
        const items = await SynologyService.listFiles(item.path);
        setThirdLevelItems(items);
        
      } catch (err) {
        if (err instanceof SynologyService.SynologyApiError) {
          setError(`加载文件夹内容失败: ${err.message}`);
        } else {
          setError('加载文件夹内容失败');
        }
        console.error('加载文件夹内容异常:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // 如果是文件，则显示详情
      setSelectedFile(item);
    }
  };
  
  // 处理下载
  const handleDownload = async (file: SynologyService.FileItem) => {
    try {
      const downloadLink = await SynologyService.getDownloadLink(file.path);
      // 创建一个临时的a标签来触发下载
      const link = document.createElement('a');
      link.href = downloadLink;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载文件异常:', error);
      alert('下载文件失败，请重试');
    }
  };
  
  // 刷新数据
  const handleRefresh = async () => {
    if (selectedSecondLevel) {
      setLoading(true);
      try {
        const items = await SynologyService.getThirdLevelItems(selectedSecondLevel.path);
        setThirdLevelItems(items);
        setError(null);
      } catch (err) {
        if (err instanceof SynologyService.SynologyApiError) {
          setError(`刷新数据失败: ${err.message}`);
        } else {
          setError('刷新数据失败');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 处理面包屑导航点击
  const handleBreadcrumbClick = async (path: string, index: number) => {
    try {
      setLoading(true);
      
      // 根据点击的面包屑级别重置状态
      if (index === 0) {
        // 点击根目录，重置所有状态
        const firstLevel = await SynologyService.getFirstLevelDirectories();
        setFirstLevelDirs(firstLevel);
        
        if (firstLevel.length > 0) {
          setSelectedFirstLevel(firstLevel[0]);
        } else {
          setSelectedFirstLevel(null);
        }
        
        setSecondLevelDirs([]);
        setThirdLevelItems([]);
        setSelectedSecondLevel(null);
        setBreadcrumbs([{ name: '根目录', path: SynologyConfig.ROOT_PATH }]);
        
      } else if (index === 1) {
        // 点击一级目录，重置二级和三级状态
        const firstLevel = firstLevelDirs.find(dir => dir.path === path);
        if (firstLevel) {
          setSelectedFirstLevel(firstLevel);
        }
        
      } else if (index === 2) {
        // 点击二级目录，只重置三级状态
        const secondLevel = secondLevelDirs.find(dir => dir.path === path);
        if (secondLevel) {
          setSelectedSecondLevel(secondLevel);
        }
      } else if (index >= 3) {
        // 点击更深层级，加载该路径的内容
        try {
          const items = await SynologyService.listFiles(path);
          setThirdLevelItems(items);
          
          // 更新面包屑，保留前面的路径
          setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        } catch (err) {
          console.error('加载路径内容异常:', err);
          if (err instanceof SynologyService.SynologyApiError) {
            setError(`加载路径内容失败: ${err.message}`);
          } else {
            setError('加载路径内容失败');
          }
        }
      }
    } catch (err) {
      if (err instanceof SynologyService.SynologyApiError) {
        setError(`导航失败: ${err.message}`);
      } else {
        setError('导航失败');
      }
      console.error('导航异常:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染文件视图
  const renderFileView = () => {
    if (viewMode === 'list') {
      return (
        <FileList
          files={filteredAndSortedFiles}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onFileClick={handleThirdLevelClick}
          onDownload={handleDownload}
          onClearSearch={() => setSearchQuery('')}
        />
      );
    } else if (viewMode === 'grid') {
      return (
        <FileGridView
          files={filteredAndSortedFiles}
          onFileClick={handleThirdLevelClick}
          onDownload={handleDownload}
        />
      );
    } else {
      // 大图标视图
      return (
        <div className="space-y-3">
          {filteredAndSortedFiles.map(file => (
            <FileLargeCard
              key={file.path}
              file={file}
              onClick={handleThirdLevelClick}
              onDownload={handleDownload}
            />
          ))}
        </div>
      );
    }
  };
  
  // 清除搜索
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // 处理视图模式变化
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  // 处理排序变化
  const handleSortChange = (type: SortType, direction: SortDirection) => {
    setSortType(type);
    setSortDirection(direction);
  };
  
  // 如果正在初始加载，显示全屏加载动画
  if (initialLoading) {
    return <FullScreenLoader text="正在连接到 NAS..." />;
  }
  
  return (
    <div className="ultrawide-layout">
      <div className="flex-1 p-6 md:p-8 pb-24 flex flex-col">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="brand-logo">
              <span className="brand-dot"></span>
              <span>{SynologyConfig.PAGE_TITLES.main}</span>
            </div>
            <span className="text-sm text-gray-500 ml-3">{SynologyConfig.PAGE_DESCRIPTION}</span>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
            disabled={loading}
          >
            {loading ? (
              <InlineLoader text="刷新中" />
            ) : (
              <>
                <RefreshCw size={14} className="mr-1" />
                刷新
              </>
            )}
          </button>
        </div>
        
        {/* 面包屑导航 */}
        <Breadcrumbs 
          items={breadcrumbs}
          onItemClick={handleBreadcrumbClick}
        />
        
        {/* 搜索和视图选择器 */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
          
          <ViewSelector 
            viewMode={viewMode}
            sortType={sortType}
            sortDirection={sortDirection}
            onViewModeChange={handleViewModeChange}
            onSortChange={handleSortChange}
          />
        </div>
        
        {/* 主体内容 */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* 左侧一级目录 */}
          <DirectorySidebar
            directories={firstLevelDirs}
            selectedDirectory={selectedFirstLevel}
            loading={loading && firstLevelDirs.length === 0}
            onDirectorySelect={handleFirstLevelClick}
            title={SynologyConfig.PAGE_TITLES.firstLevel}
          />
          
          {/* 中间内容区 */}
          <div className="flex-1 flex flex-col">
            {/* 二级目录 Tab */}
            <TabNavigation
              tabs={secondLevelDirs}
              selectedTab={selectedSecondLevel}
              loading={loading && secondLevelDirs.length === 0}
              onTabSelect={handleSecondLevelClick}
            />
            
            {/* 错误提示 */}
            {error && (
              <ErrorMessage 
                message={error} 
                onRetry={handleRefresh}
                className="mb-4"
              />
            )}
            
            {/* 文件列表 */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1 overflow-y-auto">
              {loading && thirdLevelItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <FullScreenLoader text="加载文件中..." transparent={true} />
                </div>
              ) : filteredAndSortedFiles.length > 0 ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <HardDrive size={20} className="mr-2 text-brand-red" />
                    {selectedSecondLevel?.name || '文件列表'}
                  </h2>
                  
                  {renderFileView()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-gray-500 mb-2">
                    {searchQuery ? '没有找到匹配的文件' : '当前目录为空'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="text-brand-red text-sm hover:underline"
                    >
                      清除搜索条件
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 文件详情模态框 */}
      {selectedFile && (
        <FileDetails 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
        />
      )}
      
      {/* 页面导航 */}
      <PageNavigator />
    </div>
  );
}
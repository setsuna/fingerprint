'use client'

import React from 'react'
import { Grid, List, SortAsc, SortDesc, Calendar, FileText, ChevronDown } from 'lucide-react'

// 视图类型
export type ViewMode = 'list' | 'grid' | 'large';

// 排序类型
export type SortType = 'name' | 'size' | 'time';

// 排序方向
export type SortDirection = 'asc' | 'desc';

interface ViewSelectorProps {
  viewMode: ViewMode;
  sortType: SortType;
  sortDirection: SortDirection;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (type: SortType, direction: SortDirection) => void;
}

/**
 * 视图选择器组件
 */
export default function ViewSelector({
  viewMode,
  sortType,
  sortDirection,
  onViewModeChange,
  onSortChange
}: ViewSelectorProps) {
  // 切换排序方向
  const toggleSortDirection = () => {
    onSortChange(sortType, sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  // 处理排序类型变化
  const handleSortTypeChange = (newSortType: SortType) => {
    if (newSortType === sortType) {
      // 如果排序类型相同，切换排序方向
      toggleSortDirection();
    } else {
      // 如果排序类型不同，使用默认排序方向
      onSortChange(newSortType, 'asc');
    }
  };
  
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
      <div className="flex border-r border-gray-200 pr-2">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-1.5 rounded ${
            viewMode === 'list' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="列表视图"
        >
          <List size={18} />
        </button>
        
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1.5 rounded ${
            viewMode === 'grid' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="网格视图"
        >
          <Grid size={18} />
        </button>
        
        <button
          onClick={() => onViewModeChange('large')}
          className={`p-1.5 rounded ${
            viewMode === 'large' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="大图标视图"
        >
          <FileText size={18} />
        </button>
      </div>
      
      <div className="flex">
        <button
          onClick={() => handleSortTypeChange('name')}
          className={`p-1.5 flex items-center rounded ${
            sortType === 'name' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="按名称排序"
        >
          <span className="text-xs font-medium mr-1">名称</span>
          {sortType === 'name' && (
            sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
          )}
        </button>
        
        <button
          onClick={() => handleSortTypeChange('size')}
          className={`p-1.5 flex items-center rounded ${
            sortType === 'size' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="按大小排序"
        >
          <span className="text-xs font-medium mr-1">大小</span>
          {sortType === 'size' && (
            sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
          )}
        </button>
        
        <button
          onClick={() => handleSortTypeChange('time')}
          className={`p-1.5 flex items-center rounded ${
            sortType === 'time' ? 'bg-gray-100 text-brand-red' : 'text-gray-500 hover:bg-gray-50'
          }`}
          title="按时间排序"
        >
          <span className="text-xs font-medium mr-1">时间</span>
          {sortType === 'time' && (
            sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * 简化版视图选择器组件（下拉菜单）
 */
export function CompactViewSelector({
  viewMode,
  sortType,
  sortDirection,
  onViewModeChange,
  onSortChange
}: ViewSelectorProps) {
  // 视图模式文本映射
  const viewModeText = {
    list: '列表视图',
    grid: '网格视图',
    large: '大图标视图'
  };
  
  // 排序类型文本映射
  const sortTypeText = {
    name: '按名称',
    size: '按大小',
    time: '按时间'
  };
  
  // 排序图标
  const SortIcon = sortDirection === 'asc' ? SortAsc : SortDesc;
  
  // 显示下拉菜单
  const [showViewDropdown, setShowViewDropdown] = React.useState(false);
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  
  // 视图模式下拉引用
  const viewDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // 排序下拉引用
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false);
      }
      
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      {/* 视图选择器 */}
      <div className="relative" ref={viewDropdownRef}>
        <button
          onClick={() => setShowViewDropdown(!showViewDropdown)}
          className="bg-white flex items-center gap-1 text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
        >
          {viewMode === 'list' && <List size={14} />}
          {viewMode === 'grid' && <Grid size={14} />}
          {viewMode === 'large' && <FileText size={14} />}
          <span>{viewModeText[viewMode]}</span>
          <ChevronDown size={14} />
        </button>
        
        {showViewDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-10 min-w-32">
            <button
              onClick={() => {
                onViewModeChange('list');
                setShowViewDropdown(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                viewMode === 'list' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <List size={14} />
              <span>列表视图</span>
            </button>
            
            <button
              onClick={() => {
                onViewModeChange('grid');
                setShowViewDropdown(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                viewMode === 'grid' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <Grid size={14} />
              <span>网格视图</span>
            </button>
            
            <button
              onClick={() => {
                onViewModeChange('large');
                setShowViewDropdown(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                viewMode === 'large' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <FileText size={14} />
              <span>大图标视图</span>
            </button>
          </div>
        )}
      </div>
      
      {/* 排序选择器 */}
      <div className="relative" ref={sortDropdownRef}>
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="bg-white flex items-center gap-1 text-sm px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
        >
          <SortIcon size={14} />
          <span>{sortTypeText[sortType]}</span>
          <ChevronDown size={14} />
        </button>
        
        {showSortDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-md z-10 min-w-32">
            <button
              onClick={() => {
                //handleSortTypeChange('name');
                setShowSortDropdown(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                sortType === 'name' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <span>按名称</span>
              {sortType === 'name' && <SortIcon size={14} />}
            </button>
            
            <button
              onClick={() => {
                //handleSortTypeChange('size');
                setShowSortDropdown(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                sortType === 'size' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <span>按大小</span>
              {sortType === 'size' && <SortIcon size={14} />}
            </button>
            
            <button
              onClick={() => {
                //handleSortTypeChange('time');
                setShowSortDropdown(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                sortType === 'time' ? 'bg-gray-50 text-brand-red' : ''
              }`}
            >
              <span>按时间</span>
              {sortType === 'time' && <SortIcon size={14} />}
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button
              onClick={() => {
                //toggleSortDirection();
                setShowSortDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
            >
              {sortDirection === 'asc' ? (
                <>
                  <SortDesc size={14} />
                  <span>降序排列</span>
                </>
              ) : (
                <>
                  <SortAsc size={14} />
                  <span>升序排列</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
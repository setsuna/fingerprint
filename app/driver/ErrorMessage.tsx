'use client'

import React from 'react'
import { AlertOctagon, RefreshCw, Info } from 'lucide-react'

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  type?: 'error' | 'warning' | 'info';
}

/**
 * 错误消息组件
 * 用于显示错误、警告或提示信息
 */
export default function ErrorMessage({
  message,
  onRetry,
  className = '',
  type = 'error'
}: ErrorMessageProps) {
  // 根据类型设置样式
  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600',
      icon: AlertOctagon
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-600',
      icon: AlertOctagon
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      icon: Info
    }
  };
  
  const { bg, border, text, icon: Icon } = styles[type];
  
  return (
    <div className={`${bg} ${border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`${text} mr-3 flex-shrink-0`} size={20} />
        
        <div className="flex-1">
          <p className={`${text} text-sm`}>{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-2 flex items-center ${text} text-sm hover:underline`}
            >
              <RefreshCw size={14} className="mr-1" />
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 空状态组件
 * 用于显示无内容状态
 */
export function EmptyState({
  message = '没有找到内容',
  icon: CustomIcon,
  action
}: {
  message: string;
  icon?: React.ComponentType<any>;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const Icon = CustomIcon || Info;
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Icon size={40} className="text-gray-300 mb-4" />
      <p className="text-gray-500 mb-4 text-center">{message}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="text-brand-red hover:text-red-700 text-sm flex items-center"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
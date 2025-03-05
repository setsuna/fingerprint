'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  text?: string;
}

/**
 * 加载动画组件
 */
export default function LoadingSpinner({
  size = 24,
  color = 'text-brand-red',
  className = '',
  text = '加载中...'
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 size={size} className={`animate-spin ${color} mb-2`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

/**
 * 全屏加载组件
 */
export function FullScreenLoader({
  text = '加载中...',
  transparent = false
}: {
  text?: string;
  transparent?: boolean;
}) {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      transparent ? 'bg-white bg-opacity-80' : 'bg-white'
    }`}>
      <LoadingSpinner size={40} text={text} />
    </div>
  );
}

/**
 * 内联加载组件
 */
export function InlineLoader({
  text = '加载中'
}: {
  text?: string;
}) {
  return (
    <div className="flex items-center">
      <Loader2 size={16} className="animate-spin text-brand-red mr-2" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}
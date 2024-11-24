import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';


interface FileStatusProps {
  status: 'processing' | 'completed' | 'error';
}

export function FileStatus({ status }: FileStatusProps) {
  const statusConfig = {
    processing: {
      icon: Loader2,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      label: 'Processing'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      label: 'Completed'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      label: 'Error'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={clsx(
      'flex items-center space-x-2 px-3 py-1 rounded-full w-fit',
      config.bgColor
    )}>
      <Icon className={clsx('w-4 h-4', config.color, {
        'animate-spin': status === 'processing'
      })} />
      <span className={clsx('text-sm font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
}
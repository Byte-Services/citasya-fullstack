'use client';

import { PlusIcon } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  leftActions?: React.ReactNode;
  createButtonText?: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  showDate?: boolean;
  dateToolbar?: React.ReactNode;
}

export default function PageLayout({ 
  title,
  subtitle,
  children,
  actions,
  leftActions,
  createButtonText = "Nuevo",
  onCreateClick,
  showCreateButton = true,
  showDate = false,
  dateToolbar
}: PageLayoutProps) {


  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 2xl:px-10 overflow-y-auto pt-10"
      style={{ scrollbarGutter: 'stable' }}
    >
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto w-full">
          <div className={`flex items-start gap-3${showDate ? ' items-center' : ''}`}>
            {leftActions}
            <div className="min-w-0 flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            </div>
          </div>
          {subtitle && (
            <p className="mt-2 text-md text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-2 items-center">
          {showDate && dateToolbar && (
            <div className="ml-4">{dateToolbar}</div>
          )}
          {actions}
          {onCreateClick && showCreateButton && (
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm md:text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <PlusIcon className="h-5 w-5" />
              {createButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {children}
      </div>
    </div>
  );
} 
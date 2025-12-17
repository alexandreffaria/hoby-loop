import React from 'react';

/**
 * Standard page container component providing consistent layout
 * for all pages in the application.
 */
export default function PageContainer({ 
  children, 
  title = '',
  maxWidth = 'max-w-4xl',
  className = ''
}) {
  return (
    <div className="min-h-screen p-6">
      <div className={`mx-auto ${maxWidth} ${className}`}>
        {title && (
          <h1 className="text-2xl font-black uppercase mb-6 bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
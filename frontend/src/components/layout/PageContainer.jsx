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
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className={`mx-auto ${maxWidth} ${className}`}>
        {title && (
          <h1 className="text-xl font-black text-gray-800 uppercase mb-6">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
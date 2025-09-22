import React from 'react';
import { EmbeddableCalculator } from '@/components/loan/EmbeddableCalculator';

const EmbedPage: React.FC = () => {
  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search);
  
  const compact = urlParams.get('compact') === 'true';
  const theme = (urlParams.get('theme') as 'light' | 'dark') || 'light';
  const brandColor = decodeURIComponent(urlParams.get('brandColor') || '#2563eb');
  const redirectUrl = decodeURIComponent(urlParams.get('redirectUrl') || 'https://your-mfo-site.com');
  const widgetId = urlParams.get('widgetId') || 'mfo-calc';

  return (
    <div className={`
      min-h-screen flex items-center justify-center p-4
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <EmbeddableCalculator
        compact={compact}
        theme={theme}
        brandColor={brandColor}
        redirectUrl={redirectUrl}
        widgetId={widgetId}
      />
    </div>
  );
};

export default EmbedPage;
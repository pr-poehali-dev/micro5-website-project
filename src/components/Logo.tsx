import React from 'react';

interface Props {
  className?: string;
  tone?: 'light' | 'dark';
}

const Logo: React.FC<Props> = ({ className = '', tone = 'light' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill={tone === 'light' ? 'rgba(255,255,255,0.18)' : '#6C4EE0'} />
      <path d="M7 11h13m0 0-5-5m5 5-5 5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 23H14m0 0 5-5m-5 5 5 5" stroke="#2EE58A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className={`font-display font-bold text-xl tracking-tight ${tone === 'light' ? 'text-white' : 'text-micro-dark'}`}>
      Микро<span className="text-micro-mint">5</span>
    </span>
  </div>
);

export default Logo;

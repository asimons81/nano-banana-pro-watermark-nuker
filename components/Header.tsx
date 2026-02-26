import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 border-b border-neutral-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon removed as requested */}
          <h1 className="text-xl font-bold">
            <span className="text-white">Nano Banana Pro </span>
            <span className="text-[#4fb7a0]">Watermark Nuker</span>
          </h1>
        </div>
      </div>
    </header>
  );
};
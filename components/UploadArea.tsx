import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      } else {
        alert('Please drop a valid image file');
      }
    }
  };

  return (
    <div
      className={`relative w-full border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer overflow-hidden group
        ${isDragOver 
          ? 'border-[#4fb7a0] bg-[#4fb7a0]/10' 
          : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 bg-neutral-900/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      {/* Icon Background */}
      <div className={`p-4 rounded-full bg-neutral-800 group-hover:scale-110 transition-transform duration-300 ${isDragOver ? 'bg-[#4fb7a0]' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Upload an image</h3>
        <p className="text-sm text-neutral-400">Click to browse or drag and drop</p>
        <p className="text-xs text-neutral-500 mt-2">Supports JPG, PNG, WEBP</p>
      </div>

      {!disabled && (
        <Button 
          variant="secondary" 
          className="mt-2 pointer-events-none" // Pointer events none because the parent div handles the click
          onClick={(e) => e.stopPropagation()} 
        >
          Select File
        </Button>
      )}
    </div>
  );
};
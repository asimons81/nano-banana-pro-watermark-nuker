import React from 'react';

interface ComparisonViewProps {
  originalUrl: string;
  processedUrl: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ originalUrl, processedUrl }) => {
  
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // On mobile, direct data-uri downloads can be flaky. 
    // Converting to a blob usually helps.
    if (processedUrl.startsWith('data:')) {
      e.preventDefault();
      
      fetch(processedUrl)
        .then(res => res.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'watermark_removed.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(err => {
            console.error('Download failed, falling back to default', err);
            // Fallback logic if fetch fails
            const link = document.createElement('a');
            link.href = processedUrl;
            link.download = 'watermark_removed.png';
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fade-in">
      {/* Original Image */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Original</span>
        </div>
        <div className="relative aspect-auto rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
          <img 
            src={originalUrl} 
            alt="Original" 
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white">
            Before
          </div>
        </div>
      </div>

      {/* Processed Image */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#4fb7a0] uppercase tracking-wider">Processed Result</span>
          <a 
            href={processedUrl} 
            download="watermark_removed.png"
            onClick={handleDownload}
            className="text-xs flex items-center gap-1 text-[#4fb7a0] hover:text-[#6cdfd6] font-medium transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 15V3" />
            </svg>
            Download
          </a>
        </div>
        <div className="relative aspect-auto rounded-xl overflow-hidden border-2 border-[#4fb7a0]/30 bg-neutral-900 shadow-xl shadow-[#4fb7a0]/10">
          <img 
            src={processedUrl} 
            alt="Processed" 
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-[#4fb7a0]/90 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white shadow-lg">
            After
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/ui/Button';
import { ComparisonView } from './components/ComparisonView';
import { removeWatermarkFromImage } from './services/geminiService';
import { LoadingState } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [instructions, setInstructions] = useState<string>('');

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    };
  }, [originalPreviewUrl]);

  const handleImageSelect = (file: File) => {
    setOriginalImage(file);
    const url = URL.createObjectURL(file);
    setOriginalPreviewUrl(url);
    
    // Reset state for new image
    setProcessedImageUrl(null);
    setLoadingState({ status: 'idle' });
    setInstructions('');
  };

  const handleRemoveWatermark = async () => {
    if (!originalImage) return;

    setLoadingState({ status: 'processing', message: 'Nuking artifacts and restoring background...' });

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(originalImage);
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Extract the actual base64 data (remove "data:image/xyz;base64,")
        const base64Data = base64String.split(',')[1];
        const mimeType = originalImage.type;

        try {
          // Pass the user instructions to the service
          const resultBase64 = await removeWatermarkFromImage(base64Data, mimeType, instructions);
          const resultUrl = `data:image/png;base64,${resultBase64}`;
          setProcessedImageUrl(resultUrl);
          setLoadingState({ status: 'success' });
        } catch (apiError) {
          console.error(apiError);
          setLoadingState({ 
            status: 'error', 
            message: 'Failed to process image. Please try again or use a smaller image.' 
          });
        }
      };

      reader.onerror = () => {
        setLoadingState({ status: 'error', message: 'Error reading file.' });
      };

    } catch (error) {
      console.error(error);
      setLoadingState({ status: 'error', message: 'An unexpected error occurred.' });
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalPreviewUrl(null);
    setProcessedImageUrl(null);
    setLoadingState({ status: 'idle' });
    setInstructions('');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        
        <div className="w-full max-w-5xl space-y-8">
          
          {/* Hero Section */}
          {!originalImage && (
            <div className="text-center space-y-4 mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                SAY GOODBYE TO THE <span className="text-[#4fb7a0]">STAR.</span>
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Powered by the same Google AI that once suggested adding glue to pizza. Don't worry, it's actually really good at removing watermarks—much better than it is at culinary advice.
              </p>
            </div>
          )}

          {/* Upload Area */}
          {!originalImage && (
            <div className="max-w-2xl mx-auto w-full">
              <UploadArea onImageSelected={handleImageSelect} />
            </div>
          )}

          {/* Editor / Processing Area */}
          {originalImage && (
            <div className="w-full space-y-8 animate-fade-in">
              
              {/* Controls */}
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-6">
                
                {/* File Info & Reset */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-xs font-medium text-neutral-300 truncate max-w-[200px]">
                          {originalImage.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                          {(originalImage.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                  </div>
                  <Button variant="secondary" onClick={handleReset} disabled={loadingState.status === 'processing'}>
                    New Image
                  </Button>
                </div>

                {/* Processing Input */}
                {!processedImageUrl && (
                  <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-neutral-800">
                    <div className="flex-grow relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Hint: e.g. 'remove bottom-right logo, keep central text'"
                            className="block w-full pl-10 pr-3 py-2.5 bg-black border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#4fb7a0] focus:border-transparent transition-all"
                            disabled={loadingState.status === 'processing'}
                            onKeyDown={(e) => e.key === 'Enter' && handleRemoveWatermark()}
                        />
                    </div>
                    <Button 
                      onClick={handleRemoveWatermark} 
                      isLoading={loadingState.status === 'processing'}
                      disabled={loadingState.status === 'processing'}
                      className="w-full md:w-auto min-w-[160px]"
                    >
                      Nuke It!
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {loadingState.status === 'error' && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-center animate-fade-in">
                  <p>{loadingState.message || 'Something went wrong.'}</p>
                </div>
              )}

              {/* Main Display Area */}
              <div className="w-full">
                {!processedImageUrl ? (
                  // Single View (Before Processing)
                  <div className="flex flex-col items-center justify-center bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 md:p-8 min-h-[400px]">
                    {loadingState.status === 'processing' ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-neutral-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[#4fb7a0] rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-white">Nuking Watermark...</h3>
                            <p className="text-neutral-400">Removing unwanted elements from your image.</p>
                        </div>
                    ) : (
                        <img 
                            src={originalPreviewUrl!} 
                            alt="Original Preview" 
                            className="max-h-[600px] w-auto max-w-full rounded-lg shadow-2xl"
                        />
                    )}
                  </div>
                ) : (
                  // Comparison View (After Processing)
                  <div className="flex flex-col items-center gap-8 animate-fade-in">
                    <ComparisonView 
                      originalUrl={originalPreviewUrl!} 
                      processedUrl={processedImageUrl} 
                    />
                    
                    <div className="flex flex-col items-center gap-2">
                      <Button onClick={handleReset} className="min-w-[200px] h-12 text-lg shadow-lg shadow-[#4fb7a0]/20">
                        Start Over
                      </Button>
                      <p className="text-neutral-500 text-sm">Ready for the next image?</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-neutral-800 bg-neutral-900 text-center text-neutral-500 text-sm">
        <p>© {new Date().getFullYear()} Nano Banana Pro Watermark Nuker. Created by <a href="https://www.tonyreviewsthings.com/links" target="_blank" rel="noopener noreferrer" className="text-[#4fb7a0] hover:text-[#7ceadd] transition-colors">Tony Simons</a>.</p>
      </footer>
    </div>
  );
};

export default App;
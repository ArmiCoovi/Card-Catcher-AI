
import React, { useState, useRef, useCallback } from 'react';
import { BusinessCard } from './types';
import { scanBusinessCards } from './services/geminiService';
import { CameraIcon, CardStackIcon, ClipboardIcon, ClipboardCheckIcon, ErrorIcon, ScanIcon } from './components/Icons';
import { Card } from './components/Card';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [cards, setCards] = useState<BusinessCard[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        processImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    setCards(null);
    setIsCopied(false);

    try {
      const imageData = base64Image.split(',')[1];
      const result = await scanBusinessCards(imageData);
      setCards(result);
    } catch (err) {
      setError('Failed to process the business card. The image might be unclear or the format is not supported. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleReset = () => {
    setImage(null);
    setCards(null);
    setError(null);
    setIsLoading(false);
    setIsCopied(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyToClipboard = () => {
    if (!cards) return;

    const headers = ['Name', 'Title', 'Company', 'Phone', 'Email', 'Website', 'Address'];
    const csvContent = [
      headers.join(','),
      ...cards.map(card => 
        [
          `"${card.name || ''}"`,
          `"${card.title || ''}"`,
          `"${card.company || ''}"`,
          `"${card.phone || ''}"`,
          `"${card.email || ''}"`,
          `"${card.website || ''}"`,
          `"${(card.address || '').replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n');

    navigator.clipboard.writeText(csvContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Spinner />
          <p className="mt-4 text-lg text-teal-300 animate-pulse">AI is analyzing the image...</p>
          <p className="mt-2 text-sm text-gray-400">Extracting contact details.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-red-900/20 rounded-lg">
          <ErrorIcon />
          <p className="mt-4 text-lg font-semibold text-red-400">An Error Occurred</p>
          <p className="mt-2 text-gray-300">{error}</p>
        </div>
      );
    }

    if (cards) {
      return (
        <div className="w-full">
           <img src={image!} alt="Scanned business card" className="rounded-lg mb-6 w-full max-w-sm mx-auto shadow-lg" />
           <div className="space-y-4">
             {cards.map((card, index) => <Card key={index} card={card} />)}
           </div>
        </div>
      );
    }
    
    return (
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
            <CardStackIcon />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Scan & Digitize</h2>
        <p className="text-gray-400 max-w-xs mx-auto">Use your camera to capture business cards and instantly convert them to contacts.</p>
        <button
            onClick={handleScanClick}
            className="mt-8 flex items-center justify-center w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg shadow-teal-500/30"
          >
            <CameraIcon />
            <span className="ml-3">Scan Business Card</span>
        </button>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="p-4 text-center border-b border-gray-700/50">
        <h1 className="text-2xl font-bold tracking-wider text-white">Card Catcher <span className="text-teal-400">AI</span></h1>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
            {renderContent()}
        </div>
      </main>
      
      { (cards || error) && !isLoading && (
        <footer className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-4">
          <div className="max-w-md mx-auto flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <ScanIcon />
              <span className="ml-2">Scan Another</span>
            </button>
            {cards && (
              <button
                onClick={handleCopyToClipboard}
                className={`flex-1 flex items-center justify-center font-semibold py-3 px-4 rounded-lg transition ${isCopied ? 'bg-green-600' : 'bg-teal-500 hover:bg-teal-600'} text-white`}
              >
                {isCopied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
                <span className="ml-2">{isCopied ? 'Copied!' : 'Copy as CSV'}</span>
              </button>
            )}
          </div>
        </footer>
      )}

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default App;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { useCRM } from '../context/CRMContext';
import { 
  Upload, 
  Camera, 
  Copy, 
  PhoneCall, 
  MessageCircle, 
  Share2, 
  Plus, 
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

interface OCRExtractionViewProps {
  onSaveAsLead: (prefill: { phone: string; name?: string; company?: string }) => void;
}

export const OCRExtractionView: React.FC<OCRExtractionViewProps> = ({ onSaveAsLead }) => {
  const { addNotification } = useCRM();
  
  // OCR states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [detectedNumbers, setDetectedNumbers] = useState<string[]>([]);
  
  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Phone action helpers
  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    addNotification('success', `Copied number ${phone} to clipboard.`);
  };

  const handleShare = (phone: string) => {
    const text = `Extracted builder contact: ${phone}`;
    if (navigator.share) {
      navigator.share({ title: 'Builder Contact', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      addNotification('success', 'Contact copied to clipboard to share.');
    }
  };

  const handleWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setExtractedText('');
        setDetectedNumbers([]);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera access
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setExtractedText('');
      setDetectedNumbers([]);
      setImageSrc(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      addNotification('error', 'Could not access the camera. Check your permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Match canvas dimensions to video feed
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup camera streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Run Tesseract OCR on the image
  const performOCR = async () => {
    if (!imageSrc) return;
    
    setStatus('processing');
    setProgress(0);
    
    try {
      const worker = await createWorker('eng');
      
      // Monitor progress
      // (Note: createWorker handles load status inside, we'll increment progress simulated/actual)
      setProgress(25);
      
      const { data: { text } } = await worker.recognize(imageSrc);
      setProgress(85);
      
      await worker.terminate();
      setProgress(100);
      
      setExtractedText(text);
      extractPhoneNumbers(text);
      setStatus('success');
      addNotification('success', 'OCR Text extraction completed.');
    } catch (err) {
      console.error(err);
      setStatus('error');
      addNotification('error', 'Failed to process image OCR. Check format.');
    }
  };

  // Helper to extract phone numbers from text using regular expressions
  const extractPhoneNumbers = (text: string) => {
    // Matches common patterns including country codes, spaces, dashes, parentheses
    // e.g. +1 555-0199, (555) 123-4567, 5551234567, etc.
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex) || [];
    
    // Deduplicate and clean
    const uniqueMatches = Array.from(new Set(matches.map(n => n.trim())))
      .filter(n => n.replace(/\D/g, '').length >= 10); // Ensure it's a full number

    setDetectedNumbers(uniqueMatches);
  };

  const handleReset = () => {
    setImageSrc(null);
    setExtractedText('');
    setDetectedNumbers([]);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          OCR Lead Extractor
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload an invoice, business card, or site blueprint to scan phone numbers and import them as leads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Capture or Upload Image */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
          
          {!imageSrc && !isCameraActive && (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
              <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3.5 stroke-1" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                Upload business document
              </h3>
              <p className="text-xs text-slate-500 text-center max-w-xs mb-5">
                Supports JPG, PNG, JPEG, and WEBP formats. Scans details automatically.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 transition-colors cursor-pointer">
                  <Upload className="h-4.5 w-4.5" />
                  Select File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={startCamera}
                  className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  <Camera className="h-4.5 w-4.5 text-blue-500" />
                  Use Camera
                </button>
              </div>
            </div>
          )}

          {/* Active Camera View */}
          {isCameraActive && (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 rounded-2xl overflow-hidden relative min-h-[300px]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full h-full object-cover max-h-[400px]"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                <button
                  onClick={capturePhoto}
                  className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image Selected Preview */}
          {imageSrc && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[300px]">
                <img 
                  src={imageSrc} 
                  alt="Lead Source preview" 
                  className="max-h-[300px] object-contain w-full"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* OCR Controls */}
              <div className="pt-5 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/40 mt-5">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                
                {status === 'idle' && (
                  <button
                    onClick={performOCR}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                  >
                    Start Processing
                  </button>
                )}

                {status === 'processing' && (
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Scanning Document ({progress}%)
                  </div>
                )}

                {status === 'success' && (
                  <button
                    onClick={performOCR}
                    className="flex items-center gap-1.5 border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Scan Again
                  </button>
                )}

                {status === 'error' && (
                  <span className="text-xs text-rose-600 font-semibold">
                    Extraction Error. Try again.
                  </span>
                )}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Right Side: Detected Phone Numbers & OCR Text Outputs */}
        <div className="space-y-6">
          
          {/* Detected Phone Numbers Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Detected Contacts
              </h2>
              <p className="text-xs text-slate-500">Phone numbers identified from scanning the document.</p>
            </div>

            <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
              {detectedNumbers.length > 0 ? (
                detectedNumbers.map((number, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-colors"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                      {number}
                    </span>
                    
                    {/* Phone Utilities Actions */}
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${number}`}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Call"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleCopy(number)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Copy"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleShare(number)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-teal-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-teal-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(number)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-green-600 dark:border-slate-800 dark:text-slate-400 dark:hover:text-green-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Open WhatsApp chat"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onSaveAsLead({ phone: number, name: '', company: 'OCR Lead' })}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Import as Lead"
                      >
                        <Plus className="h-3 w-3" />
                        Import
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center">
                  <FileText className="h-9 w-9 text-slate-300 mb-2 stroke-1" />
                  <p className="text-xs">No phone numbers detected yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Text Output panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Full Extracted Text
              </h2>
              <p className="text-xs text-slate-500">View and edit raw OCR content matches.</p>
            </div>
            
            <textarea
              readOnly
              value={extractedText || "Raw text will appear here after processing..."}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 font-mono resize-none focus:outline-none"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

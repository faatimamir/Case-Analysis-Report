import React, { useCallback, useState } from 'react';
import { ProcessingStatus } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  status: ProcessingStatus;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, status }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const getProgressPercentage = () => {
    if (status.total === 0) return 0;
    return Math.round((status.current / status.total) * 100);
  };

  if (status.stage !== 'idle' && status.stage !== 'complete' && status.stage !== 'error') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Processing Document</h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                {status.stage === 'extracting' ? 'Reading PDF' : 'AI Analysis'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {getProgressPercentage()}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div style={{ width: `${getProgressPercentage()}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"></div>
          </div>
          <p className="text-sm text-slate-500 text-center animate-pulse">
            {status.stage === 'extracting' 
              ? `Extracting text from page ${status.current} of ${status.total}...` 
              : `Analyzing legal cases on page ${status.current} of ${status.total}...`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-2xl mx-auto p-12 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer bg-white
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
      `}
    >
      <input
        type="file"
        id="fileInput"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Upload Cause List PDF
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        Drag and drop your PDF here, or click to select files. The AI agent will extract and classify cases automatically.
      </p>

      <label
        htmlFor="fileInput"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md hover:shadow-lg"
      >
        Select PDF File
      </label>
    </div>
  );
};
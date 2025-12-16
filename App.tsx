import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { extractTextFromPdf } from './services/pdfService';
import { analyzeCaseText } from './services/geminiService';
import { AnalysisResult, ProcessingStatus, LegalCase } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>({
    total: 0,
    current: 0,
    stage: 'idle',
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileProcess = async (file: File) => {
    setStatus({ total: 0, current: 0, stage: 'extracting' });
    setResult(null);

    try {
      // Step 1: Extract Text
      const pagesText = await extractTextFromPdf(file, (current, total) => {
        setStatus({ stage: 'extracting', current, total });
      });

      // Step 2: Analyze with Gemini
      setStatus({ stage: 'analyzing', current: 0, total: pagesText.length });
      
      let allCases: LegalCase[] = [];
      
      // Process pages in parallel chunks to be faster, but strict enough to show progress
      const chunkSize = 3; 
      for (let i = 0; i < pagesText.length; i += chunkSize) {
        const chunk = pagesText.slice(i, i + chunkSize);
        const promises = chunk.map((text, idx) => analyzeCaseText(text, i + idx + 1));
        
        const chunkResults = await Promise.all(promises);
        chunkResults.forEach(cases => allCases = [...allCases, ...cases]);
        
        setStatus(prev => ({ 
          ...prev, 
          current: Math.min(prev.total, i + chunkSize) 
        }));
      }

      setResult({
        fileName: file.name,
        uploadDate: new Date(),
        cases: allCases
      });
      setStatus({ ...status, stage: 'complete' });

    } catch (error) {
      console.error(error);
      setStatus({ ...status, stage: 'error', message: 'Failed to process document.' });
      alert("An error occurred while processing the PDF. Please check the console or try again.");
    }
  };

  const resetApp = () => {
    setResult(null);
    setStatus({ total: 0, current: 0, stage: 'idle' });
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                LegalCase AI
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Powered by Gemini 2.5
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!result ? (
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Automated Cause List Analysis
              </h2>
              <p className="text-lg text-slate-600">
                Upload your court cause list PDFs. Our AI agent will extract cases, identify parties, and classify them into legal categories instantly.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileProcess} status={status} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
              {[
                { title: 'Upload PDF', desc: 'Accepts standard court documents', icon: '📄' },
                { title: 'AI Extraction', desc: 'Gemini parses messy OCR text', icon: '🤖' },
                { title: 'Visual Report', desc: 'Categorized tables & charts', icon: '📊' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Dashboard result={result} onReset={resetApp} />
        )}
      </main>
    </div>
  );
};

export default App;
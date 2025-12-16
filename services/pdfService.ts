import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@3.11.174';

// Fix for ESM import where default export might be nested
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Initialize the worker
// Using unpkg is often more reliable for the worker file than esm.sh for cross-origin worker loading
const workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
}

export const extractTextFromPdf = async (
  file: File, 
  onProgress: (current: number, total: number) => void
): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use the resolved pdfjs object
    // cMapUrl and cMapPacked are needed for handling non-latin characters correctly sometimes
    const loadingTask = pdfjs.getDocument({ 
      data: arrayBuffer,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const pagesText: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      onProgress(i, numPages);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore - pdfjs types are sometimes loose on 'str' property
        .map((item: any) => item.str || '')
        .join(' ');
      pagesText.push(pageText);
    }

    return pagesText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to parse PDF file. Please ensure it is a valid PDF.");
  }
};
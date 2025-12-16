export enum CaseCategory {
  CRIMINAL = 'Criminal',
  SERVICE = 'Service',
  CIVIL = 'Civil',
  FAMILY = 'Family',
  ELECTION = 'Election',
  TAX = 'Tax',
  OTHER = 'Other'
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string; // e.g., "Person A vs Person B"
  category: CaseCategory;
  summary: string; // A short description of the matter (e.g., "Bail after arrest", "Dismissal from service")
  lawyers: string[];
  bench?: string;
  date?: string; // YYYY-MM-DD format extracted from the case text
}

export interface ProcessingStatus {
  total: number;
  current: number;
  stage: 'idle' | 'extracting' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

export interface AnalysisResult {
  fileName: string;
  uploadDate: Date;
  cases: LegalCase[];
}

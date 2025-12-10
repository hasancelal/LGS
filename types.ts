
export enum Subject {
  MATEMATIK = 'Matematik',
  FEN_BILIMLERI = 'Fen Bilimleri',
  TURKCE = 'Türkçe',
  INKILAP = 'T.C. İnkılap Tarihi',
  INGILIZCE = 'İngilizce',
  DIN_KULTURU = 'Din Kültürü',
  DIGER = 'Diğer'
}

export enum Status {
  NEW = 'Yeni',
  NEEDS_REVIEW = 'Tekrar Et',
  LEARNED = 'Öğrenildi'
}

export interface Question {
  id: string;
  imageUrl: string;
  subject: Subject;
  topic: string; // Kazanım/Konu
  questionText: string; // Extracted text
  teacherNote: string; // Öğretmen notu
  studentNote: string; // Kendi notu
  dateAdded: number;
  status: Status;
}

export interface SearchResult {
  title: string;
  uri: string;
}

export interface AIAnalysisResult {
  subject: Subject;
  topic: string;
  extractedText: string;
  explanation?: string;
}

export type ImageResolution = '1K' | '2K' | '4K';

export interface GeneratedQuestion {
  id: string;
  imageUrl: string;
  subject: Subject;
  topic: string;
  createdAt: number;
}

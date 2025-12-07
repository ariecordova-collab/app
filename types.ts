export enum Mapel {
  MATEMATIKA = 'Matematika',
  IPA = 'Ilmu Pengetahuan Alam (IPA)',
  IPS = 'Ilmu Pengetahuan Sosial (IPS)',
  BAHASA_INDONESIA = 'Bahasa Indonesia',
  BAHASA_INGGRIS = 'Bahasa Inggris',
  BAHASA_ARAB = 'Bahasa Arab',
  PPKN = 'PPKn',
  INFORMATIKA = 'Informatika',
  SENI_BUDAYA = 'Seni Budaya',
  PJOK = 'PJOK'
}

export enum SoalType {
  PILIHAN_GANDA = 'Pilihan Ganda',
  URAIAN = 'Uraian / Essay',
  BENAR_SALAH = 'Benar / Salah',
  ISIAN_SINGKAT = 'Isian Singkat'
}

export enum Difficulty {
  MUDAH = 'Mudah (LOTS)',
  SEDANG = 'Sedang (MOTS)',
  SULIT = 'Sulit (HOTS)'
}

export enum FormatSoal {
  TEXT_ONLY = 'Hanya Teks',
  WITH_IMAGE = 'Menggunakan Gambar (Visual)'
}

export type DifficultyDistribution = {
  [key in Difficulty]: number;
};

export interface QuestionConfig {
  mapel: Mapel | string;
  topic: string;
  type: SoalType;
  distribution: DifficultyDistribution;
  format: FormatSoal;
}

export interface GeneratedQuestion {
  id: number;
  questionText: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
  imageDescription?: string; // If format is WITH_IMAGE
  imageUrl?: string; // Base64 or URL of the generated image
  // New fields for Kisi-kisi
  specificTopic: string;
  indicator: string;
  cognitiveLevel: string;
}
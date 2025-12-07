import { Mapel, SoalType, Difficulty, FormatSoal } from './types';

export const MAPEL_OPTIONS = Object.values(Mapel);
export const TYPE_OPTIONS = Object.values(SoalType);
export const DIFFICULTY_OPTIONS = Object.values(Difficulty);
export const FORMAT_OPTIONS = Object.values(FormatSoal);

export const DEFAULT_TOPICS: Record<string, string[]> = {
  [Mapel.MATEMATIKA]: ['Aljabar', 'Geometri', 'Statistik', 'Bilangan Bulat'],
  [Mapel.IPA]: ['Sistem Pencernaan', 'Zat dan Perubahannya', 'Listrik Statis', 'Ekosistem'],
  [Mapel.IPS]: ['Kondisi Geografis Indonesia', 'Interaksi Sosial', 'Ekonomi', 'Sejarah Kemerdekaan'],
  [Mapel.BAHASA_INDONESIA]: ['Teks Deskripsi', 'Teks Berita', 'Puisi', 'Surat Resmi'],
  [Mapel.BAHASA_INGGRIS]: ['Descriptive Text', 'Recount Text', 'Greeting Cards', 'Present Tense'],
  [Mapel.BAHASA_ARAB]: ['At-Ta\'aruf (Perkenalan)', 'Al-Madrasah (Sekolah)', 'Al-Usrah (Keluarga)', 'Al-Hiwayah (Hobi)', 'As-Sa\'ah (Jam)'],
  [Mapel.INFORMATIKA]: ['Algoritma', 'Berpikir Komputasional', 'Dampak Sosial Informatika'],
};
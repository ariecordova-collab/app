import React, { useState, useEffect } from 'react';
import { QuestionConfig, Mapel, SoalType, Difficulty, FormatSoal, DifficultyDistribution } from '../types';
import { MAPEL_OPTIONS, TYPE_OPTIONS, DIFFICULTY_OPTIONS, FORMAT_OPTIONS, DEFAULT_TOPICS } from '../constants';
import { Loader2, BookOpen, Layers, Zap, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ConfigFormProps {
  onGenerate: (config: QuestionConfig) => void;
  isLoading: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onGenerate, isLoading }) => {
  const [mapel, setMapel] = useState<string>(MAPEL_OPTIONS[0]);
  const [topic, setTopic] = useState<string>('');
  const [type, setType] = useState<SoalType>(SoalType.PILIHAN_GANDA);
  const [format, setFormat] = useState<FormatSoal>(FormatSoal.TEXT_ONLY);
  
  // Initialize distribution with some default values
  const [distribution, setDistribution] = useState<DifficultyDistribution>({
    [Difficulty.MUDAH]: 3,
    [Difficulty.SEDANG]: 5,
    [Difficulty.SULIT]: 2
  });

  // Explicitly cast Object.values to number[] to avoid 'unknown' type inference issues
  const totalQuestions = (Object.values(distribution) as number[]).reduce((a, b) => a + b, 0);
  const MAX_QUESTIONS = 50;
  const isOverLimit = totalQuestions > MAX_QUESTIONS;
  const isEmpty = totalQuestions === 0;

  const handleDistributionChange = (difficulty: Difficulty, value: number) => {
    // Prevent negative numbers
    const newValue = Math.max(0, value);
    setDistribution(prev => ({
      ...prev,
      [difficulty]: newValue
    }));
  };

  const handleTopicToggle = (selectedTopic: string) => {
    // Split by comma, trim, and filter empty strings
    const currentTopics = topic.split(',').map(t => t.trim()).filter(Boolean);
    
    if (currentTopics.includes(selectedTopic)) {
      // Remove if exists
      setTopic(currentTopics.filter(t => t !== selectedTopic).join(', '));
    } else {
      // Add if not exists
      setTopic([...currentTopics, selectedTopic].join(', '));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || isEmpty) return;

    onGenerate({
      mapel,
      topic,
      type,
      distribution,
      format
    });
  };

  const suggestedTopics = DEFAULT_TOPICS[mapel] || [];
  
  // Helper to check if a topic is currently selected (for visual feedback)
  const isTopicSelected = (t: string) => {
    const currentTopics = topic.split(',').map(val => val.trim());
    return currentTopics.includes(t);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Konfigurasi Soal
        </h2>
        <p className="text-gray-500 mt-1">Sesuaikan parameter untuk membuat soal SMP (Fase D).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Grid Layout for Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mapel */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
            <select 
              value={mapel} 
              onChange={(e) => { setMapel(e.target.value); setTopic(''); }}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              {MAPEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Topik (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Topik / Materi (Bisa lebih dari satu)</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Aljabar, Geometri (pisahkan dengan koma)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            {suggestedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedTopics.map(t => {
                  const active = isTopicSelected(t);
                  return (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => handleTopicToggle(t)}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${
                        active 
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {active && <span className="mr-1">✓</span>}
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jenis Soal */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Jenis Soal</label>
            <div className="grid grid-cols-2 gap-3">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3 text-sm font-medium rounded-lg border text-left transition-all flex items-center gap-2 ${
                    type === t 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Format Soal */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Format Visual</label>
            <div className="flex gap-3">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`flex-1 p-3 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    format === f 
                      ? 'bg-accent/10 border-accent text-amber-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {f === FormatSoal.WITH_IMAGE ? <ImageIcon className="w-4 h-4"/> : <Zap className="w-4 h-4"/>}
                  {f}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Distribusi Tingkat Kesulitan */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-700">Distribusi Tingkat Kesulitan</label>
              <div className={`text-sm font-semibold px-3 py-1 rounded-full ${isOverLimit ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 border'}`}>
                 Total: {totalQuestions} / {MAX_QUESTIONS} Soal
              </div>
           </div>
           
           <div className="grid grid-cols-3 gap-4">
             {DIFFICULTY_OPTIONS.map((diff) => {
               // Extract "Mudah", "Sedang", "Sulit" for shorter labels
               const label = diff.split(' ')[0]; 
               const subLabel = diff.includes('LOTS') ? 'LOTS' : diff.includes('MOTS') ? 'MOTS' : 'HOTS';
               const colorClass = label === 'Mudah' ? 'text-green-600' : label === 'Sedang' ? 'text-yellow-600' : 'text-red-600';
               
               return (
                <div key={diff} className="flex flex-col gap-2">
                   <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label} <span className="opacity-50">({subLabel})</span></label>
                   <input
                     type="number"
                     min="0"
                     max="50"
                     value={distribution[diff]}
                     onChange={(e) => handleDistributionChange(diff, parseInt(e.target.value) || 0)}
                     className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center font-bold text-lg ${colorClass}`}
                   />
                </div>
               );
             })}
           </div>
           {isOverLimit && (
             <div className="flex items-center gap-2 mt-3 text-red-600 text-sm animate-pulse">
               <AlertCircle className="w-4 h-4" />
               Jumlah total soal tidak boleh melebihi {MAX_QUESTIONS}.
             </div>
           )}
           {isEmpty && (
             <div className="flex items-center gap-2 mt-3 text-amber-600 text-sm">
               <AlertCircle className="w-4 h-4" />
               Masukkan jumlah soal minimal 1.
             </div>
           )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isOverLimit || isEmpty}
          className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${
            isLoading || isOverLimit || isEmpty
              ? 'bg-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-primary to-indigo-700 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sedang Membuat Soal dengan AI...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              Generate Soal Sekarang
            </>
          )}
        </button>
      </form>
    </div>
  );
};
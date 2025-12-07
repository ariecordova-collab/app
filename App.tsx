import React, { useState } from 'react';
import { ConfigForm } from './components/ConfigForm';
import { QuestionList } from './components/QuestionList';
import { GeneratedQuestion, QuestionConfig } from './types';
import { generateQuestions } from './services/geminiService';
import { GraduationCap, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [config, setConfig] = useState<QuestionConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (newConfig: QuestionConfig) => {
    setLoading(true);
    setError(null);
    setConfig(newConfig);
    
    try {
      const result = await generateQuestions(newConfig);
      setQuestions(result);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat membuat soal.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setConfig(null);
    setError(null);
  };

  const handleUpdateQuestion = (id: number, updates: Partial<GeneratedQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">GenSoal</h1>
              <span className="text-xs text-gray-500 font-medium">AI Question Generator for SMP</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini AI
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Content Switcher */}
        {questions.length > 0 && config ? (
          <QuestionList 
            questions={questions} 
            config={config} 
            onReset={handleReset}
            onUpdateQuestion={handleUpdateQuestion}
          />
        ) : (
          <>
            <div className="text-center mb-10 mt-4 no-print">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Buat Soal Ujian dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Hitungan Detik</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Alat bantu guru untuk membuat soal latihan, ulangan harian, atau ujian sekolah tingkat SMP (Fase D) dengan bantuan kecerdasan buatan.
              </p>
            </div>
            <ConfigForm onGenerate={handleGenerate} isLoading={loading} />
          </>
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm no-print">
        &copy; {new Date().getFullYear()} GenSoal. Dibuat untuk Pendidikan Indonesia.
      </footer>
    </div>
  );
};

export default App;
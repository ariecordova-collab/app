import React, { useState } from 'react';
import { Copy, Check, X, ExternalLink, ScrollText, AlertCircle } from 'lucide-react';
import { GeneratedQuestion, QuestionConfig, SoalType } from '../types';

interface GoogleFormScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: GeneratedQuestion[];
  config: QuestionConfig;
}

export const GoogleFormScriptModal: React.FC<GoogleFormScriptModalProps> = ({ isOpen, onClose, questions, config }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateScript = () => {
    const mapel = config.mapel;
    const topic = config.topic || 'Latihan Soal';
    const title = `Soal ${mapel} - ${topic}`;
    
    let script = `function createGenSoalForm() {
  // 1. Setup Form
  var form = FormApp.create('${title}');
  form.setDescription('Soal digenerate otomatis oleh GenSoal AI.\\nMata Pelajaran: ${mapel}\\nTopik: ${topic}\\nTingkat: SMP (Fase D)');
  form.setIsQuiz(true);
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);
  form.setProgressBar(true);

  // 2. Tambahkan Soal
`;

    questions.forEach((q, index) => {
      // Escape characters for JS string
      const safeQuestion = q.questionText.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, "\\n");
      const safeExplanation = q.explanation.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, "\\n");
      
      script += `
  // --- Soal No ${index + 1} ---
`;

      // Handle Image placeholder (Text warning in script)
      if (q.imageDescription) {
        script += `  // Note: Soal ini memiliki gambar (${q.imageDescription.replace(/'/g, "")}). Gambar tidak dapat di-upload otomatis lewat script ini.\n`;
        // Optionally add an image placeholder item if needed, but usually text note is enough or manual upload instructions.
      }

      if (config.type === SoalType.PILIHAN_GANDA && q.options && q.options.length > 0) {
        script += `  var item${index} = form.addMultipleChoiceItem();
  item${index}.setTitle('${index + 1}. ${safeQuestion}');
  item${index}.setPoints(2); // Poin default

  var choices${index} = [];
`;
        q.options.forEach((opt, optIdx) => {
            const safeOpt = opt.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            
            // Logic to determine if this option is correct
            // Check 1: Key is single letter (A, B, C, D)
            const cleanKey = q.correctAnswer.trim().toUpperCase();
            let isCorrect = false;
            
            if (/^[A-D]$/.test(cleanKey)) {
                // Key is a letter, compare with index
                if (optIdx === cleanKey.charCodeAt(0) - 65) isCorrect = true;
            } else {
                // Key is text, compare containment or exact match
                // Remove "A. " prefix from option if exists for comparison
                const cleanOpt = opt.replace(/^[A-D]\.\s*/, '').trim();
                if (cleanOpt.toLowerCase() === q.correctAnswer.toLowerCase() || 
                    q.correctAnswer.toLowerCase().includes(cleanOpt.toLowerCase())) {
                    isCorrect = true;
                }
            }

            script += `  choices${index}.push(item${index}.createChoice('${safeOpt}', ${isCorrect}));\n`;
        });
        
        script += `  item${index}.setChoices(choices${index});
  // Feedback
  var feedback${index} = FormApp.createFeedback().setText('Kunci: ${q.correctAnswer}\\n\\nPembahasan: ${safeExplanation}').build();
  item${index}.setFeedbackForIncorrect(feedback${index});
  item${index}.setFeedbackForCorrect(feedback${index});
`;

      } else {
        // Fallback for Essay / other types
        script += `  var item${index} = form.addParagraphTextItem();
  item${index}.setTitle('${index + 1}. ${safeQuestion}');
  // Set grading info in help text since API doesn't support setting answer key for paragraph text easily
  item${index}.setHelpText('Bobot soal: Uraian');
`;
      }
    });

    script += `
  // 3. Log Output
  Logger.log('Form ID: ' + form.getId());
  Logger.log('Edit URL: ' + form.getEditUrl());
  Logger.log('Published URL: ' + form.getPublishedUrl());
}`;
    return script;
  };

  const scriptCode = generateScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
           <div className="flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-lg">
                <ScrollText className="w-6 h-6 text-green-700" />
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-800">Export ke Google Form</h3>
               <p className="text-xs text-gray-500">via Google Apps Script</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
             <X className="w-5 h-5 text-gray-500" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
           
           {/* Steps */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
               <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-sm">1</div>
                 Buka Google Apps Script
               </h4>
               <p className="text-sm text-indigo-700 mb-3">Klik tombol di bawah untuk membuka editor script Google di tab baru.</p>
               <a 
                 href="https://script.google.com/home/start" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
               >
                 <ExternalLink className="w-3 h-3" />
                 Buka script.google.com
               </a>
             </div>

             <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
               <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-sm">2</div>
                 Paste & Jalankan
               </h4>
               <p className="text-sm text-emerald-700">
                 Buat <strong>New Project</strong>, hapus kode default, paste kode di bawah, simpan (Ctrl+S), lalu klik <strong>Run</strong>.
               </p>
             </div>
           </div>
           
           {/* Warning for Images */}
           {questions.some(q => q.imageDescription) && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Catatan tentang Gambar:</strong> Script ini tidak dapat meng-upload gambar AI secara otomatis. 
                  Anda perlu meng-upload gambar secara manual di Google Form setelah form terbuat.
                </div>
              </div>
           )}

           {/* Code Block */}
           <div className="relative">
             <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md shadow-sm transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Tersalin!' : 'Copy Kode'}
                </button>
             </div>
             <pre className="w-full h-64 md:h-80 p-4 bg-gray-900 text-gray-100 rounded-xl overflow-auto font-mono text-xs md:text-sm leading-relaxed border border-gray-700 shadow-inner">
               <code>{scriptCode}</code>
             </pre>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
           >
             Tutup
           </button>
        </div>
      </div>
    </div>
  );
};
import React, { useRef, useState } from 'react';
import { GeneratedQuestion, QuestionConfig, SoalType } from '../types';
import { CheckCircle2, FileText, Download, RefreshCw, Eye, EyeOff, FileSpreadsheet, File, ImagePlus, Loader2, ScrollText } from 'lucide-react';
import { generateQuestionImage } from '../services/geminiService';
import { GoogleFormScriptModal } from './GoogleFormScriptModal';

interface QuestionListProps {
  questions: GeneratedQuestion[];
  config: QuestionConfig;
  onReset: () => void;
  onUpdateQuestion: (id: number, updates: Partial<GeneratedQuestion>) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, config, onReset, onUpdateQuestion }) => {
  const [showAnswers, setShowAnswers] = React.useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [showGoogleFormModal, setShowGoogleFormModal] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateImage = async (q: GeneratedQuestion) => {
    if (!q.imageDescription) return;
    
    setGeneratingImages(prev => ({ ...prev, [q.id]: true }));
    try {
      const imageUrl = await generateQuestionImage(q.imageDescription);
      onUpdateQuestion(q.id, { imageUrl });
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Gagal membuat gambar. Silakan coba lagi.");
    } finally {
      setGeneratingImages(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const downloadDoc = (content: string, filename: string) => {
     // Basic HTML to Word Doc wrapper
     const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${filename}</title>
      <style>
        body { font-family: 'Times New Roman', serif; }
        table { border-collapse: collapse; width: 100%; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        .center { text-align: center; }
        .img-container { text-align: center; margin: 10px 0; }
        img { max-width: 300px; height: auto; }
      </style>
      </head><body>`;
     const footer = "</body></html>";
     const sourceHTML = header + content + footer;

     const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
     const link = document.createElement("a");
     document.body.appendChild(link);
     link.href = source;
     link.download = filename;
     link.click();
     document.body.removeChild(link);
  };

  const handleDownloadSoal = () => {
    let html = `<h2 class="center">SOAL LATIHAN ${config.mapel.toUpperCase()}</h2>`;
    html += `<p class="center">Topik: ${config.topic || 'Umum'} | Kelas: 8 SMP (Fase D)</p><hr/>`;
    
    questions.forEach((q, i) => {
      html += `<div style="margin-bottom: 20px; page-break-inside: avoid;">`;
      html += `<p><strong>${i + 1}.</strong> ${q.questionText}</p>`;
      
      if (q.imageUrl) {
        html += `<div class="img-container"><img src="${q.imageUrl}" alt="Ilustrasi Soal ${i+1}" /></div>`;
      } else if (q.imageDescription) {
        html += `<p style="border: 1px dashed #666; padding: 10px; background-color: #eee;"><em>[Ilustrasi belum digenerate: ${q.imageDescription}]</em></p>`;
      }

      if (config.type === SoalType.PILIHAN_GANDA && q.options) {
        html += `<ol type="A" style="margin-top: 5px;">`;
        q.options.forEach(opt => {
          html += `<li>${opt}</li>`;
        });
        html += `</ol>`;
      }
      html += `</div>`;
    });

    // Keys
    html += `<br/><br/><hr/><h3 class="center">KUNCI JAWABAN & PEMBAHASAN</h3>`;
    questions.forEach((q, i) => {
      html += `<p><strong>${i+1}. ${q.correctAnswer}</strong><br/>Pembahasan: ${q.explanation}</p>`;
    });

    downloadDoc(html, `Soal-${config.mapel.replace(/\s+/g, '-')}.doc`);
  };

  const handleDownloadKisi = () => {
    let html = `<h2 class="center">KISI-KISI PENULISAN SOAL</h2>`;
    html += `<p><strong>Mata Pelajaran:</strong> ${config.mapel}<br/>`;
    html += `<strong>Jumlah Soal:</strong> ${questions.length}<br/>`;
    html += `<strong>Bentuk Soal:</strong> ${config.type}</p>`;
    
    html += `<table>`;
    html += `<thead><tr>
      <th style="width: 5%">No</th>
      <th style="width: 25%">Materi Pokok</th>
      <th style="width: 35%">Indikator Soal</th>
      <th style="width: 15%">Level Kognitif</th>
      <th style="width: 15%">Bentuk Soal</th>
      <th style="width: 5%">No. Soal</th>
    </tr></thead><tbody>`;

    questions.forEach((q, i) => {
      html += `<tr>
        <td class="center">${i + 1}</td>
        <td>${q.specificTopic || '-'}</td>
        <td>${q.indicator || '-'}</td>
        <td class="center">${q.cognitiveLevel || '-'}</td>
        <td class="center">${config.type}</td>
        <td class="center">${i + 1}</td>
      </tr>`;
    });
    
    html += `</tbody></table>`;

    downloadDoc(html, `Kisi-Kisi-${config.mapel.replace(/\s+/g, '-')}.doc`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <GoogleFormScriptModal 
        isOpen={showGoogleFormModal}
        onClose={() => setShowGoogleFormModal(false)}
        questions={questions}
        config={config}
      />

      {/* Action Bar - No Print */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="flex items-center gap-2 text-gray-700">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-semibold">{questions.length} Soal Berhasil Dibuat</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
           <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Tutup Kunci' : 'Lihat Kunci'}
          </button>
          
          <button 
            onClick={handleDownloadKisi}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Kisi-kisi
          </button>

          <button 
            onClick={handleDownloadSoal}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <File className="w-4 h-4" />
            Word
          </button>

          <button 
            onClick={() => setShowGoogleFormModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
          >
            <ScrollText className="w-4 h-4" />
            G-Form
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Print
          </button>
          
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div ref={componentRef} className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-100 print:shadow-none print:border-none print:p-0">
        
        {/* Header Document */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">Latihan Soal {config.mapel}</h1>
          <div className="flex justify-center gap-6 mt-3 text-sm text-gray-600">
            <span>Kelas: 8 SMP (Fase D)</span>
            <span>Tipe: {config.type}</span>
            <span>Topik: {config.topic || 'Umum'}</span>
          </div>
        </div>

        {/* Questions Loop */}
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id} className="page-break relative pl-1">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-700 text-sm border border-gray-200 print:border-black print:bg-white">
                  {index + 1}
                </span>
                
                <div className="flex-grow space-y-4">
                  {/* Image Generation Section */}
                  {q.imageDescription && (
                    <div className="mb-4">
                      {q.imageUrl ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-md mx-auto">
                          <img 
                             src={q.imageUrl} 
                             alt="Ilustrasi Soal" 
                             className="w-full h-auto object-contain"
                           />
                        </div>
                      ) : (
                        <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center print:hidden">
                           <p className="text-sm text-gray-600 mb-3 italic">
                            "{q.imageDescription}"
                           </p>
                           <button 
                             onClick={() => handleGenerateImage(q)}
                             disabled={generatingImages[q.id]}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-50"
                           >
                             {generatingImages[q.id] ? (
                               <><Loader2 className="w-4 h-4 animate-spin"/> Sedang Membuat Gambar...</>
                             ) : (
                               <><ImagePlus className="w-4 h-4"/> Buat Ilustrasi dengan AI</>
                             )}
                           </button>
                        </div>
                      )}
                      {/* Print Placeholder if image is not generated yet */}
                      {!q.imageUrl && (
                         <div className="hidden print:block p-8 bg-white border border-black text-center italic text-xs">
                           [Area Gambar: {q.imageDescription}]
                         </div>
                      )}
                    </div>
                  )}

                  {/* Question Text */}
                  <p className="text-lg text-gray-900 font-medium leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options for Multiple Choice */}
                  {config.type === SoalType.PILIHAN_GANDA && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {q.options.map((opt, idx) => {
                        const label = String.fromCharCode(65 + idx); // A, B, C, D
                        return (
                          <div key={idx} className="flex items-start gap-3 group">
                            <span className="font-semibold text-gray-600 min-w-[20px]">{label}.</span>
                            <span className="text-gray-800">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay Space */}
                  {config.type === SoalType.URAIAN && (
                    <div className="mt-4 h-32 border border-gray-300 rounded-lg w-full print:block hidden bg-gray-50"></div>
                  )}

                  {/* Answer Key Section (Conditionally Rendered or Print Specific) */}
                  {(showAnswers) && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm print:hidden">
                      <div className="flex items-center gap-2 font-bold text-green-800 mb-1">
                        <CheckCircle2 className="w-4 h-4" /> Kunci Jawaban: {q.correctAnswer}
                      </div>
                      <p className="text-green-700">{q.explanation}</p>
                      <div className="mt-2 pt-2 border-t border-green-200 text-xs text-green-600 flex gap-4">
                        <span>Materi: {q.specificTopic}</span>
                        <span>Level: {q.cognitiveLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Print Footer Answer Key (Always visible on print if desired, or toggleable) */}
        <div className="mt-12 pt-8 border-t border-gray-300 break-before-page hidden print:block">
          <h3 className="text-xl font-bold mb-6">Kunci Jawaban & Pembahasan</h3>
          <div className="grid grid-cols-1 gap-4">
            {questions.map((q, i) => (
              <div key={q.id} className="text-sm">
                <span className="font-bold mr-2">{i + 1}.</span>
                <span className="font-bold mr-2">[{q.correctAnswer}]</span>
                <span className="text-gray-600">{q.explanation}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
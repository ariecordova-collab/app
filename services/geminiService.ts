import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionConfig, GeneratedQuestion, FormatSoal, Mapel } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateQuestions = async (config: QuestionConfig): Promise<GeneratedQuestion[]> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  // Schema definition for structured JSON output
  const questionSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        questionText: { type: Type.STRING, description: "The question stem." },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of options if multiple choice, otherwise empty array."
        },
        correctAnswer: { type: Type.STRING },
        explanation: { type: Type.STRING, description: "Brief explanation of the answer." },
        imageDescription: { 
          type: Type.STRING, 
          description: "A detailed description of the image that should accompany this question. Only if image format is requested." 
        },
        specificTopic: { type: Type.STRING, description: "Materi pokok spesifik untuk soal ini (untuk keperluan kisi-kisi)." },
        indicator: { type: Type.STRING, description: "Indikator soal: 'Disajikan..., siswa dapat...' (untuk keperluan kisi-kisi)." },
        cognitiveLevel: { type: Type.STRING, description: "Level kognitif Bloom: C1/C2/C3/C4/C5/C6 (untuk keperluan kisi-kisi)." }
      },
      required: ["id", "questionText", "correctAnswer", "explanation", "specificTopic", "indicator", "cognitiveLevel"],
    }
  };

  const imageInstruction = config.format === FormatSoal.WITH_IMAGE 
    ? "Setiap soal HARUS memiliki deskripsi visual yang relevan dalam field 'imageDescription' yang menggambarkan diagram, situasi, atau objek yang perlu dilihat siswa untuk menjawab soal." 
    : "Jangan sertakan imageDescription.";

  const totalQuestions = Object.values(config.distribution).reduce((sum, val) => sum + val, 0);
  
  const distributionText = Object.entries(config.distribution)
    .filter(([_, count]) => count > 0)
    .map(([diff, count]) => `- ${count} soal kategori ${diff}`)
    .join('\n    ');

  // Logic to determine language based on subject
  const isArabicSubject = config.mapel === Mapel.BAHASA_ARAB;
  const languageInstruction = isArabicSubject
    ? "PENTING: Karena ini mata pelajaran Bahasa Arab, GUNAKAN TULISAN ARAB (Huruf Hijaiyah) lengkap dengan harakat untuk field 'questionText' dan isi 'options'. Namun, untuk 'explanation', 'indicator', 'specificTopic', dan 'cognitiveLevel' tetap gunakan Bahasa Indonesia agar mudah dipahami guru."
    : "Gunakan Bahasa Indonesia yang baku dan sesuai EYD.";

  const prompt = `
    Bertindaklah sebagai Guru Ahli kurikulum SMP (Fase D) di Indonesia.
    Buatkan total ${totalQuestions} soal latihan untuk mata pelajaran ${config.mapel}.
    
    Spesifikasi:
    - Topik Spesifik: ${config.topic || 'Umum sesuai kurikulum'}
    - Jenis Soal: ${config.type}
    - Format: ${config.format}
    
    Komposisi Tingkat Kesulitan:
    ${distributionText}
    
    Instruksi Tambahan:
    - ${imageInstruction}
    - ${languageInstruction}
    - Untuk Pilihan Ganda, berikan 4 opsi (A, B, C, D) di dalam array 'options'.
    - Untuk Essay/Uraian, kosongkan array 'options'.
    - Berikan kunci jawaban dan pembahasan singkat.
    - PENTING: Lengkapi field 'specificTopic', 'indicator', dan 'cognitiveLevel' untuk setiap soal agar saya bisa membuat dokumen kisi-kisi.
    - Pastikan 'cognitiveLevel' sesuai dengan tingkat kesulitan yang diminta (LOTS untuk Mudah, MOTS untuk Sedang, HOTS untuk Sulit).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as GeneratedQuestion[];
    return data;

  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};

export const generateQuestionImage = async (description: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const prompt = `Educational illustration for a school exam question. 
  Style: Clear, academic, textbook style line art or simple diagram. White background.
  Subject: ${description}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        },
      },
    });

    let imageUrl = '';
    
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break; // Found the image, stop looking
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data returned from Gemini.");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
import React, { useState, useMemo } from 'react';
import { Question, Subject, ImageResolution, GeneratedQuestion } from '../types';
import { generateTestQuestionImage } from '../services/geminiService';
import { Wand2, Loader2, Image as ImageIcon, Download, AlertCircle, Zap, Lock } from 'lucide-react';

interface TestGeneratorProps {
  userQuestions: Question[];
  hasApiKey: boolean;
  onConnect: () => void;
}

export const TestGenerator: React.FC<TestGeneratorProps> = ({ userQuestions, hasApiKey, onConnect }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.MATEMATIK);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  
  // Extract topics from user's added questions for the selected subject
  const availableTopics = useMemo(() => {
    const topics = userQuestions
      .filter(q => q.subject === selectedSubject)
      .map(q => q.topic)
      .filter((value, index, self) => self.indexOf(value) === index); // Unique
    return topics;
  }, [userQuestions, selectedSubject]);

  const handleGenerate = async () => {
    if (!hasApiKey) {
      onConnect();
      return;
    }

    setIsGenerating(true);
    try {
      // Pick a random topic from user's weak points, or a generic one if no data
      let topicToUse = "Genel Tekrar";
      if (availableTopics.length > 0) {
        topicToUse = availableTopics[Math.floor(Math.random() * availableTopics.length)];
      }

      const imageUrl = await generateTestQuestionImage(selectedSubject, topicToUse, resolution);
      
      const newGenQuestion: GeneratedQuestion = {
        id: Date.now().toString(),
        imageUrl,
        subject: selectedSubject,
        topic: topicToUse,
        createdAt: Date.now()
      };

      setGeneratedQuestions(prev => [newGenQuestion, ...prev]);

    } catch (error) {
      console.error(error);
      alert("Soru oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-100 to-violet-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Wand2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Yapay Zeka Servis Sağlayıcısı Seçin</h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Kişiselleştirilmiş testler oluşturmak ve görsel analiz yapmak için bir yapay zeka servisine bağlanın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gemini Card */}
          <div className="border-2 border-indigo-600 bg-indigo-50/50 rounded-xl p-6 relative flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="absolute top-3 right-3">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Önerilen</span>
            </div>
            <div className="w-12 h-12 bg-white border border-indigo-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Zap className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Google Gemini</h3>
            <p className="text-xs text-slate-500 mb-6">Gemini 3.0 Pro & Flash modelleri ile hızlı ve gelişmiş analiz.</p>
            <button 
              onClick={onConnect}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Bağlan
            </button>
          </div>

          {/* ChatGPT Card */}
          <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
               <span className="font-bold text-slate-400">GPT</span>
             </div>
             <h3 className="font-bold text-slate-800 mb-1">ChatGPT</h3>
             <p className="text-xs text-slate-500 mb-6">OpenAI GPT-4o model entegrasyonu.</p>
             <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-not-allowed">
               <Lock size={12} /> Yakında
             </button>
          </div>

          {/* Claude Card */}
          <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
               <span className="font-bold text-slate-400">Cl</span>
             </div>
             <h3 className="font-bold text-slate-800 mb-1">Claude</h3>
             <p className="text-xs text-slate-500 mb-6">Anthropic Claude 3.5 Sonnet.</p>
             <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-not-allowed">
               <Lock size={12} /> Yakında
             </button>
          </div>

          {/* DeepSeek Card */}
           <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
               <span className="font-bold text-slate-400">DS</span>
             </div>
             <h3 className="font-bold text-slate-800 mb-1">DeepSeek</h3>
             <p className="text-xs text-slate-500 mb-6">DeepSeek R1 model desteği.</p>
             <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-not-allowed">
               <Lock size={12} /> Yakında
             </button>
          </div>
          
           {/* Ollama Card */}
           <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col items-center text-center opacity-60 grayscale">
             <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
               <span className="font-bold text-slate-400">Ol</span>
             </div>
             <h3 className="font-bold text-slate-800 mb-1">Ollama</h3>
             <p className="text-xs text-slate-500 mb-6">Lokal LLM (Llama 3, Mistral) entegrasyonu.</p>
             <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-not-allowed">
               <Lock size={12} /> Yakında
             </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-medium text-slate-700">Ders Seçimi</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.values(Subject).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm font-medium text-slate-700">Görsel Kalitesi</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ImageResolution)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="1K">1K (Standart)</option>
              <option value="2K">2K (Yüksek)</option>
              <option value="4K">4K (Ultra)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Test Sorusu Oluştur
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            Yapay zeka, havuzundaki <strong>{availableTopics.length > 0 ? availableTopics.length : '0'}</strong> farklı {selectedSubject} konusundan yola çıkarak benzer bir soru üretecektir.
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {generatedQuestions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="relative aspect-[4/3] bg-slate-100">
              <img src={q.imageUrl} alt="AI Generated Question" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              <a 
                href={q.imageUrl} 
                download={`lgs-soru-${q.id}.png`}
                className="absolute bottom-3 right-3 p-2 bg-white text-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 hover:text-indigo-600"
                title="Görseli İndir"
              >
                <Download size={20} />
              </a>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{q.subject}</span>
                 <p className="text-sm text-slate-600 mt-1 font-medium">{q.topic}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ImageIcon size={14} />
                Generated by Gemini 3.0
              </div>
            </div>
          </div>
        ))}

        {generatedQuestions.length === 0 && !isGenerating && (
          <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Wand2 size={48} className="mx-auto mb-3 opacity-20" />
            <p>Henüz test sorusu oluşturulmadı.</p>
            <p className="text-sm opacity-60">Hatalarını pekiştirmek için yukarıdan yeni soru oluştur.</p>
          </div>
        )}
      </div>
    </div>
  );
};
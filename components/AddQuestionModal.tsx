import React, { useState, useRef } from 'react';
import { Subject, Status, Question } from '../types';
import { analyzeQuestionImage } from '../services/geminiService';
import { Upload, X, Loader2, Wand2, BookOpen, Key } from 'lucide-react';

interface AddQuestionModalProps {
  onClose: () => void;
  onSave: (q: Question) => void;
  hasApiKey: boolean;
  onConnect: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ onClose, onSave, hasApiKey, onConnect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [subject, setSubject] = useState<Subject>(Subject.MATEMATIK);
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [studentNote, setStudentNote] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !file) return;

    if (!hasApiKey) {
      onConnect();
      return;
    }

    setIsAnalyzing(true);
    try {
      // Remove data URL prefix for API
      const base64Data = preview.split(',')[1];
      const result = await analyzeQuestionImage(base64Data, file.type);
      
      setSubject(result.subject);
      setTopic(result.topic);
      setQuestionText(result.extractedText);
      if (result.explanation) {
        setStudentNote(prev => prev ? `${prev}\n\nAI İpucu: ${result.explanation}` : `AI İpucu: ${result.explanation}`);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Görüntü analiz edilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      imageUrl: preview,
      subject,
      topic,
      questionText,
      teacherNote,
      studentNote,
      dateAdded: Date.now(),
      status: Status.NEW
    };

    onSave(newQuestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Soru Ekle</h2>
            <p className="text-sm text-slate-500">Yanlış yaptığın soruyu yükle ve analiz et</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Image Upload Section */}
          <div className="space-y-4">
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                preview ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              {preview ? (
                <div className="relative w-full flex flex-col items-center">
                   <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                   <button 
                     onClick={() => {
                        setFile(null);
                        setPreview(null);
                     }}
                     className="mt-4 text-sm text-red-500 hover:underline"
                   >
                     Görseli Kaldır
                   </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-center"
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Fotoğraf yüklemek için tıkla</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 5MB)</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            {/* AI Analysis Button */}
            {preview && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-3 px-4 rounded-xl font-medium shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 ${
                  hasApiKey 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-indigo-200'
                    : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-300'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gemini Analiz Ediyor...
                  </>
                ) : hasApiKey ? (
                  <>
                    <Wand2 size={18} />
                    Yapay Zeka ile Analiz Et (Gemini)
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    Analiz İçin Yapay Zekayı Bağla
                  </>
                )}
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ders</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {Object.values(Subject).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Konu / Kazanım</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: Üslü Sayılar"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Soru Metni (Otomatik)</label>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Yapay zeka burayı dolduracak..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3">
             <div className="flex items-center gap-2 text-amber-800 font-medium">
                <BookOpen size={18} />
                <h3>Öğretmen Notu / Çözüm Detayı</h3>
             </div>
             <textarea 
               value={teacherNote}
               onChange={(e) => setTeacherNote(e.target.value)}
               placeholder="Öğretmeninin bu soru hakkında söylediği önemli noktaları buraya not et..."
               className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm min-h-[100px]"
             />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            disabled={!preview || !topic}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
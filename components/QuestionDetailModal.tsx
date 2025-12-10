import React, { useState, useEffect } from 'react';
import { Question, Status, Subject } from '../types';
import { X, GraduationCap, RefreshCw, CheckCircle, Pencil, Save, User } from 'lucide-react';

interface QuestionDetailModalProps {
  question: Question;
  onClose: () => void;
  onUpdate: (updatedQ: Question) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ question, onClose, onUpdate }) => {
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Question>(question);

  // Sync state if prop changes
  useEffect(() => {
    setFormData(question);
  }, [question]);

  const toggleStatus = () => {
    const nextStatus = question.status === Status.LEARNED ? Status.NEEDS_REVIEW : Status.LEARNED;
    onUpdate({ ...question, status: nextStatus });
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(question);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
           {isEditing ? (
             <div className="flex items-center gap-3 flex-1 mr-4">
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value as Subject})}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(Subject).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="flex-1 font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="Konu / Kazanım"
                />
             </div>
           ) : (
             <div className="flex items-center gap-3 overflow-hidden">
               <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0">
                 {question.subject}
               </span>
               <h2 className="text-lg font-bold text-slate-800 truncate" title={question.topic}>{question.topic}</h2>
             </div>
           )}

           <div className="flex items-center gap-2 shrink-0">
             {!isEditing ? (
               <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors"
                title="Düzenle"
               >
                 <Pencil size={18} />
               </button>
             ) : (
               <div className="flex items-center gap-2">
                 <button 
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                 >
                   İptal
                 </button>
                 <button 
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
                 >
                   <Save size={16} /> Kaydet
                 </button>
               </div>
             )}
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <X size={20} className="text-slate-500" />
             </button>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Left: Image */}
          <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center p-4 overflow-auto relative group">
             <img src={question.imageUrl} alt="Soru" className="max-w-full h-auto rounded-lg shadow-lg" />
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Status Toggle - Only visible in View Mode */}
              {!isEditing && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Öğrenme Durumu</p>
                    <p className={`font-bold ${question.status === Status.LEARNED ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {question.status}
                    </p>
                  </div>
                  <button 
                    onClick={toggleStatus}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      question.status === Status.LEARNED 
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {question.status === Status.LEARNED ? (
                      <><RefreshCw size={16} /> Tekrara Al</>
                    ) : (
                      <><CheckCircle size={16} /> Öğrenildi İşaretle</>
                    )}
                  </button>
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soru Metni</h3>
                {isEditing ? (
                  <textarea 
                    value={formData.questionText}
                    onChange={e => setFormData({...formData, questionText: e.target.value})}
                    className="w-full p-4 bg-white rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed min-h-[120px] shadow-sm"
                    placeholder="Soru metni..."
                  />
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed shadow-sm">
                    {question.questionText || "Metin çıkarılamadı."}
                  </div>
                )}
              </div>

              {/* Teacher Note */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  Öğretmen Notu
                </h3>
                {isEditing ? (
                   <textarea 
                    value={formData.teacherNote}
                    onChange={e => setFormData({...formData, teacherNote: e.target.value})}
                    className="w-full p-4 bg-amber-50 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm leading-relaxed min-h-[100px]"
                    placeholder="Öğretmen notu ekle..."
                  />
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-sm leading-relaxed">
                    {question.teacherNote || "Henüz öğretmen notu eklenmemiş."}
                  </div>
                )}
              </div>

               {/* Student Note */}
               <div className="space-y-2">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={16} />
                  Kendi Notun
                </h3>
                {isEditing ? (
                   <textarea 
                    value={formData.studentNote}
                    onChange={e => setFormData({...formData, studentNote: e.target.value})}
                    className="w-full p-4 bg-blue-50 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed min-h-[100px]"
                    placeholder="Kendi notlarını ekle..."
                  />
                ) : (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed">
                    {question.studentNote || "Henüz kendi notunu eklememişsin."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
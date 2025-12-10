import React from 'react';
import { Question, Status, Subject } from '../types';
import { Clock, BookOpen, Trash2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onClick: (q: Question) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  [Status.NEW]: 'bg-blue-100 text-blue-700 border-blue-200',
  [Status.NEEDS_REVIEW]: 'bg-orange-100 text-orange-700 border-orange-200',
  [Status.LEARNED]: 'bg-green-100 text-green-700 border-green-200',
};

const subjectColors = {
  [Subject.MATEMATIK]: 'text-indigo-600 bg-indigo-50',
  [Subject.FEN_BILIMLERI]: 'text-emerald-600 bg-emerald-50',
  [Subject.TURKCE]: 'text-red-600 bg-red-50',
  [Subject.INKILAP]: 'text-amber-600 bg-amber-50',
  [Subject.INGILIZCE]: 'text-sky-600 bg-sky-50',
  [Subject.DIN_KULTURU]: 'text-teal-600 bg-teal-50',
  [Subject.DIGER]: 'text-gray-600 bg-gray-50',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, onDelete }) => {
  return (
    <div 
      onClick={() => onClick(question)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
    >
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img 
          src={question.imageUrl} 
          alt="Soru görseli" 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Delete Button - Visible on Group Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question.id);
          }}
          className="absolute top-3 left-3 p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50 transition-all shadow-sm opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 z-10"
          title="Soruyu Sil"
        >
          <Trash2 size={16} />
        </button>

        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[question.status]}`}>
            {question.status}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${subjectColors[question.subject]}`}>
            {question.subject}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-[150px]">
            {question.topic}
          </span>
        </div>

        <p className="text-slate-700 text-sm line-clamp-2 mb-3 flex-1 font-medium">
          {question.questionText || "Soru metni analizi..."}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(question.dateAdded).toLocaleDateString('tr-TR')}
          </div>
          {question.teacherNote && (
            <div className="flex items-center gap-1 text-indigo-500" title="Öğretmen Notu Var">
              <BookOpen size={14} />
              <span>Not Var</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
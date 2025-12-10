import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Filter, LayoutGrid, BarChart3, GraduationCap, Library, Wand2, Download, Printer } from 'lucide-react';
import { Question, Subject, Status } from './types';
import { QuestionCard } from './components/QuestionCard';
import { AddQuestionModal } from './components/AddQuestionModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { TestGenerator } from './components/TestGenerator';

// Mock initial data
const INITIAL_DATA: Question[] = [];

type Tab = 'pool' | 'test';

export default function App() {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('pool');
  const [questions, setQuestions] = useState<Question[]>(INITIAL_DATA);
  const [filterSubject, setFilterSubject] = useState<Subject | 'Tümü'>('Tümü');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
       await (window as any).aistudio.openSelectKey();
       // Race condition mitigation: assume success after flow
       setApiKeySelected(true);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => filterSubject === 'Tümü' || q.subject === filterSubject);
  }, [questions, filterSubject]);

  const stats = useMemo(() => {
    return {
      total: questions.length,
      needsReview: questions.filter(q => q.status === Status.NEEDS_REVIEW || q.status === Status.NEW).length,
      learned: questions.filter(q => q.status === Status.LEARNED).length
    };
  }, [questions]);

  const handleSaveQuestion = (newQuestion: Question) => {
    setQuestions(prev => [newQuestion, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
    setSelectedQuestion(updatedQ);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (selectedQuestion?.id === id) {
        setSelectedQuestion(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 no-print">
        {/* Navbar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                 <GraduationCap className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
                LGS Asistanı
              </h1>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('pool')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'pool' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Library size={16} />
                Soru Havuzu
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'test' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Wand2 size={16} />
                Test Oluştur (AI)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="text-slate-500 hover:text-indigo-600 p-2 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
                title="PDF Olarak Kaydet"
              >
                <Download size={22} />
              </button>

              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Soru Ekle</span>
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'pool' ? (
            <>
              {/* Stats Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Toplam Soru</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Tekrar Edilmeli</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.needsReview}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Öğrenilen</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats.learned}</h3>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-hide">
                  <button
                    onClick={() => setFilterSubject('Tümü')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterSubject === 'Tümü' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    Tümü
                  </button>
                  {Object.values(Subject).map(sub => (
                    <button
                      key={sub}
                      onClick={() => setFilterSubject(sub)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterSubject === sub ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Filter size={16} />
                  <span>{filteredQuestions.length} soru listeleniyor</span>
                </div>
              </div>

              {/* Grid */}
              {filteredQuestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredQuestions.map(q => (
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      onClick={setSelectedQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">Henüz soru eklenmemiş</h3>
                  <p className="text-slate-500 mb-6">Yanlış yaptığın soruları ekleyerek soru havuzunu oluştur.</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    İlk Sorunu Ekle
                  </button>
                </div>
              )}
            </>
          ) : (
            <TestGenerator 
              userQuestions={questions} 
              hasApiKey={apiKeySelected}
              onConnect={handleSelectKey}
            />
          )}
        </main>

        {/* Modals */}
        {isAddModalOpen && (
          <AddQuestionModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveQuestion}
            hasApiKey={apiKeySelected}
            onConnect={handleSelectKey}
          />
        )}

        {selectedQuestion && (
          <QuestionDetailModal 
            question={selectedQuestion} 
            onClose={() => setSelectedQuestion(null)}
            onUpdate={handleUpdateQuestion}
          />
        )}
      </div>

      {/* Printable Layout (Hidden from screen, visible in Print/PDF) */}
      <div className="print-only p-8 bg-white text-black max-w-4xl mx-auto">
        <div className="mb-8 border-b border-gray-300 pb-4 flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">LGS Asistanı - Soru Havuzu</h1>
             <p className="text-sm text-gray-500 mt-1">
               {new Date().toLocaleDateString('tr-TR')} tarihinde oluşturuldu
             </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Toplam Soru: {questions.length}</div>
            <div className="text-xs text-gray-500">
              {questions.filter(q => q.status === Status.NEEDS_REVIEW).length} Tekrar Bekleyen
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="page-break border-b border-gray-200 pb-6 mb-6 last:border-0">
              <div className="flex flex-row gap-6">
                
                {/* Question Image */}
                <div className="w-1/2">
                   <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                     <img 
                       src={question.imageUrl} 
                       alt={`Soru ${index + 1}`} 
                       className="w-full h-auto object-contain max-h-[350px]"
                     />
                   </div>
                </div>

                {/* Details */}
                <div className="w-1/2 flex flex-col gap-3">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase border border-gray-300">
                       {question.subject}
                     </span>
                     <span className="text-sm font-semibold text-gray-700">
                       {question.topic}
                     </span>
                     <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${
                        question.status === Status.LEARNED ? 'border-green-200 text-green-700' : 'border-orange-200 text-orange-700'
                     }`}>
                       {question.status}
                     </span>
                   </div>
                   
                   <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm text-gray-700">
                     <span className="block text-xs font-bold text-gray-400 mb-1 uppercase">Soru Metni</span>
                     {question.questionText || "Metin yok"}
                   </div>

                   {question.teacherNote && (
                     <div className="p-3 bg-amber-50 rounded border border-amber-100 text-sm text-amber-900">
                        <span className="block text-xs font-bold text-amber-600 mb-1 uppercase">Öğretmen Notu</span>
                        {question.teacherNote}
                     </div>
                   )}

                   {question.studentNote && (
                     <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-900">
                        <span className="block text-xs font-bold text-blue-600 mb-1 uppercase">Öğrenci Notu</span>
                        {question.studentNote}
                     </div>
                   )}
                   
                   <div className="mt-auto text-xs text-gray-400">
                     Eklendiği Tarih: {new Date(question.dateAdded).toLocaleDateString('tr-TR')}
                   </div>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              Henüz soru havuzunda soru bulunmamaktadır.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
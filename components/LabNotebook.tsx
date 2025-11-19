
import React, { useState } from 'react';
import { NotebookEntry } from '../types';
import { analyzeNotebookEntry } from '../services/geminiService';
import { BookOpen, Plus, Sparkles, Trash2, Save, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: NotebookEntry[];
  onAddEntry: (entry: NotebookEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: NotebookEntry) => void;
}

const LabNotebook: React.FC<Props> = ({ isOpen, onClose, entries, onAddEntry, onDeleteEntry, onUpdateEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // New Entry State
  const [newTitle, setNewTitle] = useState("");
  const [newObservation, setNewObservation] = useState("");
  const [newConclusion, setNewConclusion] = useState("");

  const handleSave = () => {
    if (!newTitle) return;
    const entry: NotebookEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title: newTitle,
      observation: newObservation,
      conclusion: newConclusion,
      data: "Manual Entry",
      type: 'physics', // Default, user can ideally select
    };
    onAddEntry(entry);
    setIsAdding(false);
    setNewTitle("");
    setNewObservation("");
    setNewConclusion("");
  };

  const handleAnalyze = async (entry: NotebookEntry) => {
    setAnalyzingId(entry.id);
    const feedback = await analyzeNotebookEntry(entry);
    onUpdateEntry({ ...entry, aiFeedback: feedback });
    setAnalyzingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400"/> Lab Notebook
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New Entry
          </button>
        )}

        {isAdding && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 space-y-3">
            <input 
              type="text" 
              placeholder="Experiment Title"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea 
              placeholder="Observations..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-24 text-sm"
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
            />
            <textarea 
              placeholder="Conclusion..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-20 text-sm"
              value={newConclusion}
              onChange={(e) => setNewConclusion(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-slate-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 text-sm flex items-center gap-1">
                <Save size={14} /> Save Entry
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 && !isAdding && (
          <div className="text-center text-slate-500 mt-10">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>Your notebook is empty.</p>
            <p className="text-sm">Record your experiments here.</p>
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
             <div className="p-3 bg-slate-950/30 border-b border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-slate-200">{entry.title}</span>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-slate-500 font-mono">
                     {new Date(entry.timestamp).toLocaleDateString()}
                   </span>
                   <button 
                     onClick={() => onDeleteEntry(entry.id)}
                     className="text-slate-500 hover:text-red-400"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
             </div>
             <div className="p-4 space-y-3">
                <div>
                   <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Observations</h4>
                   <p className="text-sm text-slate-300">{entry.observation}</p>
                </div>
                <div>
                   <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Data</h4>
                   <p className="text-xs font-mono text-emerald-400/80 bg-slate-950 p-2 rounded overflow-x-auto">
                     {entry.data}
                   </p>
                </div>
                <div>
                   <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Conclusion</h4>
                   <p className="text-sm text-slate-300">{entry.conclusion}</p>
                </div>

                {entry.aiFeedback && (
                  <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg">
                     <h4 className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1">
                       <Sparkles size={12} /> Teacher's Feedback
                     </h4>
                     <p className="text-sm text-indigo-200/80 italic">
                       {entry.aiFeedback}
                     </p>
                  </div>
                )}

                {!entry.aiFeedback && (
                  <button 
                    onClick={() => handleAnalyze(entry)}
                    disabled={analyzingId === entry.id}
                    className="w-full mt-2 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-600/50 rounded hover:bg-indigo-600/30 text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    {analyzingId === entry.id ? (
                       <span className="animate-pulse">Analyzing...</span>
                    ) : (
                       <><Sparkles size={12} /> Ask AI Feedback</>
                    )}
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LabNotebook;

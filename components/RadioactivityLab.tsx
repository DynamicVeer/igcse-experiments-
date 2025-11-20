
import React, { useState, useEffect } from 'react';
import { Activity, RotateCcw, Brain, Radiation } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const RadioactivityLab: React.FC = () => {
  const [halfLife, setHalfLife] = useState(2); // seconds
  const [nuclei, setNuclei] = useState<boolean[]>(new Array(100).fill(true));
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState<{t: number, count: number}[]>([]);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const parentCount = nuclei.filter(n => n).length;

  useEffect(() => {
      let interval: any;
      if (isRunning && parentCount > 0) {
          interval = setInterval(() => {
              setTime(t => t + 0.1);
              const lambda = Math.log(2) / halfLife;
              const prob = 1 - Math.exp(-lambda * 0.1);
              setNuclei(prev => prev.map(isParent => {
                  if (!isParent) return false;
                  return Math.random() > prob;
              }));
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isRunning, halfLife, parentCount]);

  useEffect(() => {
      if (isRunning || time === 0) {
          if (Math.floor(time * 10) % 5 === 0) {
            setHistory(h => [...h, { t: time, count: parentCount }]);
          }
      }
  }, [time, parentCount, isRunning]);

  const handleReset = () => {
      setIsRunning(false);
      setNuclei(new Array(100).fill(true));
      setTime(0);
      setHistory([{t: 0, count: 100}]);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        concept: "Radioactive Decay",
        halfLife: `${halfLife} seconds`,
        remainingNuclei: `${parentCount}%`,
        type: "Random Process"
    };
    const text = await explainConcept("Radioactivity", data);
    setExplanation(text || "Error.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Radiation className="text-yellow-400"/> Decay</h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><RotateCcw size={16}/></button>
            </div>
            <div className="space-y-4 flex-1">
                <div>
                    <label className="text-sm text-slate-300">Half-Life: {halfLife}s</label>
                    <input type="range" min="1" max="10" step="0.5" value={halfLife} onChange={e => setHalfLife(Number(e.target.value))} className="w-full accent-yellow-400"/>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-600 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{parentCount}</div>
                    <div className="text-xs text-slate-500">Parent Nuclei Remaining</div>
                </div>
                <button onClick={() => setIsRunning(!isRunning)} className="w-full py-3 bg-slate-700 text-white font-bold rounded">{isRunning ? 'Pause' : 'Start Decay'}</button>
            </div>
            <button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded">{loading ? '...' : 'Explain'}</button>
            {explanation && <div className="text-xs bg-slate-900 p-2 rounded max-h-32 overflow-y-auto">{explanation}</div>}
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 min-h-[200px] flex flex-wrap gap-1 content-start">
                 {nuclei.map((active, i) => (
                     <div key={i} className={`w-3 h-3 rounded-full ${active ? 'bg-yellow-500' : 'bg-slate-700 opacity-30'} transition-colors duration-500`}></div>
                 ))}
             </div>
             <div className="h-48 bg-slate-900 rounded-xl border border-slate-700 p-4 relative">
                 <div className="w-full h-full flex items-end">
                      {history.length > 1 && (
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                 <polyline points={history.map((pt) => `${(pt.t / (halfLife * 5)) * 100},${100 - pt.count}%`).join(' ')} fill="none" stroke="#eab308" strokeWidth="2" />
                            </svg>
                       )}
                 </div>
             </div>
        </div>
    </div>
  );
};

export default RadioactivityLab;

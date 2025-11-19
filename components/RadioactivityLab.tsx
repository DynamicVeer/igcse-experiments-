
import React, { useState, useEffect, useRef } from 'react';
import { Activity, BarChart, RotateCcw, Brain, Radiation } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const RadioactivityLab: React.FC = () => {
  const [halfLife, setHalfLife] = useState(2); // seconds for simulation speed
  const [nuclei, setNuclei] = useState<boolean[]>(new Array(100).fill(true)); // true = parent, false = daughter
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
              
              // Probability of decay per step (0.1s)
              // P = 1 - e^(-lambda * dt)
              // lambda = ln(2) / halfLife
              const lambda = Math.log(2) / halfLife;
              const prob = 1 - Math.exp(-lambda * 0.1);

              setNuclei(prev => prev.map(isParent => {
                  if (!isParent) return false; // Already decayed
                  return Math.random() > prob; // Stay parent if random > prob
              }));
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isRunning, halfLife, parentCount]);

  // Graph update
  useEffect(() => {
      if (isRunning || time === 0) {
          // Throttle history updates visually
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
        parentIsotope: "Unstable Nuclei (Yellow)",
        daughterIsotope: "Stable Nuclei (Gray)",
        halfLife: `${halfLife} simulation seconds`,
        remaining: `${parentCount}%`,
        concept: "Radioactive decay is random. Half-life is time for count to halve."
    };
    const text = await explainConcept("Radioactive Decay & Half-Life", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Radiation className="text-yellow-400" /> Decay Sim
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="flex justify-between text-sm text-slate-300 mb-1">
                        <span>Half-Life ($t_{1/2}$)</span>
                        <span>{halfLife} s</span>
                    </label>
                    <input 
                        type="range" min="1" max="10" step="0.5"
                        value={halfLife} onChange={e => setHalfLife(Number(e.target.value))} 
                        disabled={isRunning && time > 0}
                        className="w-full accent-yellow-400 h-2 bg-slate-700 rounded-lg"
                    />
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-xs uppercase font-bold">Parent Nuclei</span>
                        <span className="text-yellow-400 font-mono text-xl font-bold">{parentCount}</span>
                    </div>
                     <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${parentCount}%` }}></div>
                     </div>
                </div>

                <button 
                   onClick={() => setIsRunning(!isRunning)}
                   className={`w-full py-3 rounded-lg font-bold transition-all ${
                       isRunning ? 'bg-slate-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                   }`}
                >
                    {isRunning ? 'Pause Decay' : 'Start Decay'}
                </button>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Randomness"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
             {/* Nuclei Grid */}
             <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 relative overflow-hidden min-h-[300px] flex flex-col items-center">
                 <h4 className="text-xs text-slate-500 uppercase font-bold mb-4 w-full text-left">Sample Cross-Section</h4>
                 <div className="grid grid-cols-10 gap-2 w-full max-w-[400px] aspect-square">
                     {nuclei.map((active, i) => (
                         <div 
                            key={i} 
                            className={`rounded-full transition-all duration-500 ease-out shadow-sm ${active ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'bg-slate-700 scale-75 opacity-50'}`}
                         ></div>
                     ))}
                 </div>
                 {/* Geiger Click Effect */}
                 {isRunning && parentCount < 95 && parentCount > 5 && (
                     <div className="absolute top-4 right-4 flex items-center gap-2 text-yellow-500 animate-pulse">
                         <Activity size={18} /> <span className="font-mono text-xs">Geiger Counter</span>
                     </div>
                 )}
             </div>

             {/* Graph */}
             <div className="h-48 bg-slate-900 rounded-xl border border-slate-700 p-4 relative">
                 <div className="text-xs text-slate-500 uppercase font-bold absolute top-2 left-2 bg-slate-900 px-2">Decay Curve</div>
                 <div className="w-full h-full flex items-end border-l border-b border-slate-600 relative pt-6 pl-6">
                      {history.length > 1 && (
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                 <polyline 
                                    points={history.map((pt, i) => {
                                        const x = (pt.t / (halfLife * 5)) * 100; // Scale x to 5 half lives
                                        const y = 100 - pt.count; 
                                        return `${x}%,${y}%`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#eab308"
                                    strokeWidth="2"
                                 />
                                 {/* Theoretical Line */}
                                 <polyline 
                                    points={[...Array(50)].map((_, i) => {
                                        const t = i * (halfLife * 5) / 50;
                                        const count = 100 * Math.pow(0.5, t / halfLife);
                                        const x = (t / (halfLife * 5)) * 100;
                                        const y = 100 - count;
                                        return `${x}%,${y}%`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    opacity="0.3"
                                 />
                            </svg>
                       )}
                 </div>
                 <div className="absolute bottom-2 right-2 text-[10px] text-slate-500">Time</div>
                 <div className="absolute top-1/2 left-2 text-[10px] text-slate-500 -rotate-90 origin-center">Count</div>
             </div>
        </div>
    </div>
  );
};

export default RadioactivityLab;

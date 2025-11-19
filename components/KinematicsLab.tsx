
import React, { useState, useEffect } from 'react';
import { LineChart, Brain, RotateCcw } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const KinematicsLab: React.FC = () => {
  const [velocity, setVelocity] = useState(0);
  const [accel, setAccel] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<{t:number, v:number, d:number}[]>([]);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      let interval: any;
      if(running) {
          interval = setInterval(() => {
              setTime(t => {
                  const newT = t + 0.1;
                  const newV = velocity + (accel * 0.1);
                  setVelocity(newV); 
                  const lastD = history.length > 0 ? history[history.length-1].d : 0;
                  const newD = lastD + (newV * 0.1);
                  
                  setHistory(h => [...h, { t: newT, v: newV, d: newD }]);
                  return newT;
              });
          }, 100);
      }
      return () => clearInterval(interval);
  }, [running, accel, history, velocity]); 

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setHistory([]);
    setVelocity(0);
    setAccel(0);
    setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        initialVelocity: `${history.length > 0 ? history[0].v.toFixed(1) : 0} m/s`,
        acceleration: `${accel} m/s²`,
        timeElapsed: `${time.toFixed(1)} s`,
        finalVelocity: `${velocity.toFixed(1)} m/s`,
        displacement: `${history.length > 0 ? history[history.length-1].d.toFixed(1) : 0} m`,
        equation: "v = u + at, s = ut + ½at²"
    };
    const text = await explainConcept("Kinematics Equations", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChart className="text-pink-400"/> Motion Graphs
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="space-y-4 flex-1">
                <div>
                    <label className="text-sm text-slate-300">Velocity (u): {velocity.toFixed(1)} m/s</label>
                    <input type="range" min="0" max="10" value={velocity} disabled={running} onChange={e => setVelocity(Number(e.target.value))} className="w-full accent-pink-500"/>
                </div>
                <div>
                    <label className="text-sm text-slate-300">Acceleration (a): {accel} m/s²</label>
                    <input type="range" min="-5" max="5" step="0.5" value={accel} onChange={e => setAccel(Number(e.target.value))} className="w-full accent-pink-500"/>
                </div>
                <button 
                    onClick={() => setRunning(!running)} 
                    className={`w-full py-2 rounded font-bold transition-colors ${running ? 'bg-slate-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                >
                    {running ? 'Pause Simulation' : 'Start Simulation'}
                </button>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Analyze Motion"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2 grid grid-rows-2 gap-4 h-full">
             {/* Velocity Time Graph */}
             <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 relative overflow-hidden">
                 <div className="absolute top-2 left-2 text-xs font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                    Velocity (m/s) vs Time (s)
                 </div>
                 <div className="w-full h-full flex items-end border-l border-b border-slate-600 relative pt-8 pl-8">
                      {history.map((h, i) => (
                          <div key={i} className="w-1 bg-pink-500 absolute bottom-0" style={{ 
                              left: `${(i / 200) * 100}%`, // Scale horiz
                              height: `${Math.min(h.v * 8, 100)}%`, // Scale vert
                              width: '2px'
                          }}></div>
                      ))}
                 </div>
             </div>
             {/* Displacement Time Graph */}
             <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 relative overflow-hidden">
                 <div className="absolute top-2 left-2 text-xs font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                    Displacement (m) vs Time (s)
                 </div>
                 <div className="w-full h-full flex items-end border-l border-b border-slate-600 relative pt-8 pl-8">
                      {history.map((h, i) => (
                          <div key={i} className="w-1 bg-blue-500 absolute bottom-0" style={{ 
                              left: `${(i / 200) * 100}%`, 
                              height: `${Math.min(h.d * 2, 100)}%`, 
                              width: '2px'
                          }}></div>
                      ))}
                 </div>
             </div>
        </div>
    </div>
  );
};

export default KinematicsLab;

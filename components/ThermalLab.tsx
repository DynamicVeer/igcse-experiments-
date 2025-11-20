
import React, { useState, useEffect } from 'react';
import { Thermometer, Flame, Brain, RotateCcw, Snowflake, Wind, Droplets } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

const ThermalLab: React.FC = () => {
  const [temp, setTemp] = useState(-20);
  const [isHeating, setIsHeating] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [state, setState] = useState<'solid'|'melting'|'liquid'|'boiling'|'gas'>('solid');
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{e: number, t: number}[]>([]);

  useEffect(() => {
      let interval: any;
      if (isHeating) {
          interval = setInterval(() => {
              setEnergy(e => e + 1);
              setTemp(currentT => {
                  let newT = currentT;
                  if (currentT < 0) newT += 1; 
                  else if (currentT === 0) { if (Math.random() > 0.8) newT = 0.1; }
                  else if (currentT < 100) newT += 1;
                  else if (currentT === 100) { if (Math.random() > 0.8) newT = 100.1; }
                  else newT += 1;
                  return newT;
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isHeating]);

  useEffect(() => {
      let s: any = 'solid';
      if (temp < 0) s = 'solid';
      else if (temp < 0.1) s = 'melting';
      else if (temp < 100) s = 'liquid';
      else if (temp < 100.1) s = 'boiling';
      else s = 'gas';
      setState(s);
      setHistory(h => [...h, {e: energy, t: temp}]);
  }, [temp, energy]);

  const handleReset = () => { setEnergy(0); setTemp(-20); setHistory([]); setIsHeating(false); setExplanation(""); };
  
  const handleExplain = async () => {
    setLoading(true);
    const text = await explainConcept("Heating Curve", { temp: `${Math.round(temp)}C`, state });
    setExplanation(text || "Error.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Thermometer className="text-red-400" /> Thermal</h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><RotateCcw size={16}/></button>
            </div>
            <div className="space-y-6 flex-1">
                <div className="text-center text-4xl font-mono font-bold text-white">{temp.toFixed(0)}°C</div>
                <div className="text-center uppercase text-emerald-400 font-bold">{state}</div>
                <button onClick={() => setIsHeating(!isHeating)} className={`w-full py-3 rounded font-bold ${isHeating ? 'bg-red-600 animate-pulse' : 'bg-slate-600'}`}>{isHeating ? 'Heating' : 'Heat'}</button>
            </div>
            <button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded">{loading ? '...' : 'Explain'}</button>
            {explanation && <div className="text-xs bg-slate-900 p-2 rounded max-h-32 overflow-y-auto">{explanation}</div>}
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex justify-center items-center relative overflow-hidden h-64">
                 <RotatableView className="w-full h-full flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-slate-500 flex flex-wrap content-end p-2 gap-1 transform-style-3d">
                        {[...Array(25)].map((_, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full ${state === 'solid' ? 'bg-blue-300' : state === 'liquid' ? 'bg-blue-500' : 'bg-slate-200'} transition-all duration-300`} 
                                 style={{ animation: state === 'gas' ? `float 1s infinite` : 'none', margin: state==='solid'?'1px':'4px' }}></div>
                        ))}
                    </div>
                 </RotatableView>
             </div>
             <div className="bg-slate-900 h-48 rounded-xl border border-slate-700 p-4 relative">
                 <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     <polyline points={history.map(pt => `${(pt.e/300)*100},${100 - ((pt.t+20)/150)*100}%`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="2"/>
                 </svg>
             </div>
        </div>
    </div>
  );
};

export default ThermalLab;


import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Zap, Activity, Settings, Brain, RotateCcw, Play, Pause } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

type MachineType = 'dc_motor' | 'ac_gen' | 'dc_gen';

const MotorGenLab: React.FC = () => {
  const [type, setType] = useState<MachineType>('ac_gen');
  const [speed, setSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [angle, setAngle] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  
  const angleRef = useRef(0);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
      const animate = () => {
          if (isRunning && speed > 0) {
              angleRef.current = (angleRef.current + speed * 2) % 360;
              setAngle(angleRef.current);
              
              const rad = (angleRef.current * Math.PI) / 180;
              let val = 0;
              if (type === 'ac_gen') val = Math.sin(rad);
              else if (type === 'dc_gen') val = Math.abs(Math.sin(rad));
              else val = 1;

              // Throttle graph updates to prevent React freeze
              if (Math.random() > 0.8) {
                  setHistory(prev => {
                      const next = [...prev, val];
                      if (next.length > 60) next.shift();
                      return next;
                  });
              }
          }
          reqRef.current = requestAnimationFrame(animate);
      };
      reqRef.current = requestAnimationFrame(animate);
      return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [isRunning, speed, type]);

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        machine: type.replace('_', ' ').toUpperCase(),
        component: type === 'ac_gen' ? "Slip Rings" : "Split-Ring Commutator",
        output: type === 'ac_gen' ? "Alternating Current" : "Direct Current",
        physics: type === 'dc_motor' ? "Motor Effect (Left Hand Rule)" : "Generator Effect (Right Hand Rule)"
    };
    const text = await explainConcept("Electric Machine Physics", data);
    setExplanation(text || "Error.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="text-orange-400"/> Controls</h3>
                <button onClick={() => { setAngle(0); setHistory([]); setIsRunning(true); }} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><RotateCcw size={16}/></button>
            </div>
            <div className="flex flex-col gap-2">
                <button onClick={() => setType('dc_motor')} className={`p-3 rounded border text-left ${type === 'dc_motor' ? 'bg-orange-900/30 border-orange-500 text-white' : 'border-slate-700 text-slate-400'}`}><div className="font-bold text-sm">DC Motor</div><div className="text-xs opacity-70">Split-Ring • Torque</div></button>
                <button onClick={() => setType('ac_gen')} className={`p-3 rounded border text-left ${type === 'ac_gen' ? 'bg-blue-900/30 border-blue-500 text-white' : 'border-slate-700 text-slate-400'}`}><div className="font-bold text-sm">AC Generator</div><div className="text-xs opacity-70">Slip Rings • Alternating</div></button>
                <button onClick={() => setType('dc_gen')} className={`p-3 rounded border text-left ${type === 'dc_gen' ? 'bg-green-900/30 border-green-500 text-white' : 'border-slate-700 text-slate-400'}`}><div className="font-bold text-sm">DC Generator</div><div className="text-xs opacity-70">Split-Ring • Direct</div></button>
            </div>
            <div><label className="text-sm text-slate-400 mb-1 block">Speed</label><input type="range" min="0" max="5" step="0.5" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full accent-orange-500"/></div>
            <button onClick={() => setIsRunning(!isRunning)} className="w-full py-3 bg-slate-700 rounded font-bold text-white flex justify-center gap-2 hover:bg-slate-600">{isRunning ? <Pause size={18}/> : <Play size={18}/>} {isRunning ? 'Pause' : 'Resume'}</button>
            <div className="h-24 bg-black rounded border border-slate-600 relative overflow-hidden flex items-center"><div className="absolute top-1 left-1 text-[10px] text-green-500 font-mono">OSCILLOSCOPE</div><svg className="w-full h-full" preserveAspectRatio="none"><line x1="0" y1="50%" x2="100%" y2="50%" stroke="#333" strokeWidth="1"/><polyline points={history.map((v, i) => `${(i/60)*100},${50 - v*40}`).join(' ')} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg></div>
            <button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"><Brain size={16}/> {loading ? 'Thinking...' : 'Explain Physics'}</button>
            {explanation && <div className="text-xs bg-slate-900 p-3 rounded border border-slate-700 text-slate-300 max-h-32 overflow-y-auto custom-scrollbar">{explanation}</div>}
        </div>
        <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
            <RotatableView className="w-full h-full flex items-center justify-center" initialRotation={{x: -15, y: 45}}>
                 <div className="relative transform-style-3d w-full h-full flex items-center justify-center">
                     <div className="absolute flex justify-between w-[400px] pointer-events-none transform-style-3d">
                         <div className="w-16 h-40 bg-red-600 border-4 border-red-800 flex items-center justify-center text-4xl font-bold text-white shadow-2xl transform translate-z-[-20px]">N</div>
                         <div className="w-16 h-40 bg-blue-600 border-4 border-blue-800 flex items-center justify-center text-4xl font-bold text-white shadow-2xl transform translate-z-[-20px]">S</div>
                     </div>
                     <div className="absolute w-[300px] flex flex-col gap-8 opacity-20 pointer-events-none transform translate-z-[-10px]">{[...Array(3)].map((_, i) => <div key={i} className="w-full h-0.5 bg-cyan-400"></div>)}</div>
                     <div className="absolute transform-style-3d" style={{ transform: `rotateZ(${angle}deg)` }}>
                         <div className="w-48 h-32 border-[6px] border-orange-500 relative transform-style-3d">
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-xl">↑ I</div>
                             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-xl">↓ I</div>
                         </div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-gray-400"></div>
                     </div>
                     {/* COMMUTATOR */}
                     <div className="absolute transform-style-3d" style={{ transform: `rotateZ(${angle}deg) translateZ(60px)` }}>
                         {type === 'ac_gen' ? (
                             <div className="w-12 h-12 rounded-full border-4 border-yellow-500 relative"><div className="absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-yellow-500 m-1.5"></div></div>
                         ) : (
                             <div className="w-12 h-12 rounded-full border-4 border-yellow-500 border-t-transparent border-b-transparent rotate-90"></div>
                         )}
                     </div>
                     {/* BRUSHES */}
                     <div className="absolute transform translate-z-[60px] pointer-events-none"><div className="absolute -left-8 -top-2 w-4 h-4 bg-gray-700"></div><div className="absolute 4 -top-2 w-4 h-4 bg-gray-700"></div></div>
                 </div>
            </RotatableView>
        </div>
    </div>
  );
};

export default MotorGenLab;

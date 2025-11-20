
import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, Gauge, Box, RotateCcw, LineChart } from 'lucide-react';
import MathLabel from './ui/MathLabel';
import RotatableView from './ui/RotatableView';

const EnergyPhysicsLab: React.FC = () => {
  const [tab, setTab] = useState<'energy' | 'momentum' | 'banking'>('energy');

  return (
    <div className="flex flex-col h-full">
        <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2">
            <button onClick={() => setTab('energy')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'energy' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:bg-slate-800'}`}>Work & Energy</button>
            <button onClick={() => setTab('momentum')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'momentum' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}>Momentum</button>
            <button onClick={() => setTab('banking')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'banking' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800'}`}>Banking</button>
        </div>
        <div className="flex-1 h-full">
            {tab === 'energy' && <EnergySection />}
            {tab === 'momentum' && <MomentumSection />}
            {tab === 'banking' && <BankingSection />}
        </div>
    </div>
  );
};

const EnergySection: React.FC = () => {
    const [height, setHeight] = useState(10);
    const [mass, setMass] = useState(50);
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [history, setHistory] = useState<{t: number, pe: number, ke: number}[]>([]);

    useEffect(() => {
        let frame = 0;
        const animate = () => {
            if(isRunning) {
                setTime(t => t + 0.05);
                const h_t = (height/2) * (1 + Math.cos(time * 2));
                const v_t = Math.sqrt(2 * 9.8 * (height - h_t));
                
                const pe = mass * 9.8 * h_t;
                const ke = 0.5 * mass * v_t * v_t;
                
                setHistory(prev => {
                    const next = [...prev, {t: time, pe, ke}];
                    if(next.length > 100) next.shift();
                    return next;
                });
            }
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [isRunning, height, mass, time]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
             <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
                 <h3 className="text-white font-bold text-lg">Conservation of Energy</h3>
                 <div className="space-y-4">
                     <div><label className="text-sm text-slate-400">Max Height (m)</label><input type="range" min="5" max="20" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-rose-500"/></div>
                     <div><label className="text-sm text-slate-400">Mass (kg)</label><input type="range" min="10" max="100" value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full accent-blue-500"/></div>
                     <button onClick={() => setIsRunning(!isRunning)} className="w-full py-2 bg-slate-700 text-white rounded">{isRunning ? 'Pause' : 'Resume'}</button>
                 </div>
                 <div className="bg-slate-900 p-2 rounded border border-slate-600 h-40 relative overflow-hidden">
                      <div className="w-full h-full flex items-end">
                          <svg className="w-full h-full" preserveAspectRatio="none">
                              <polyline points={history.map((pt, i) => `${(i/100)*100},${100 - (pt.pe / (mass*9.8*20))*100}`).join(' ')} fill="none" stroke="#f43f5e" strokeWidth="2"/>
                              <polyline points={history.map((pt, i) => `${(i/100)*100},${100 - (pt.ke / (mass*9.8*20))*100}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2"/>
                          </svg>
                      </div>
                 </div>
             </div>
             <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-700 relative flex items-end justify-center p-10 overflow-hidden">
                  <svg className="w-full h-full overflow-visible">
                      <path d="M 0 0 Q 300 600 600 0" fill="none" stroke="#475569" strokeWidth="8" />
                      {history.length > 0 && (() => {
                          const progress = (Math.cos(time*2) + 1) / 2;
                          const x = progress * 600;
                          const y = (progress - 0.5)*(progress - 0.5) * 4 * 300;
                          return <circle cx={x} cy={y} r="10" fill="#fbbf24" />;
                      })()}
                  </svg>
             </div>
        </div>
    )
};

const MomentumSection: React.FC = () => <div className="text-white p-10">Momentum Sim Placeholder</div>;
const BankingSection: React.FC = () => <div className="text-white p-10">Banking Sim Placeholder</div>;

export default EnergyPhysicsLab;


import React, { useState, useMemo } from 'react';
import { Zap, Plus, Trash2, Lightbulb, Battery, Activity, Brain, RotateCcw, Cpu, Info, ToggleLeft, Triangle, Sun, Thermometer, Magnet, Eye, Box } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

type ComponentType = 'battery' | 'resistor' | 'bulb' | 'switch' | 'diode' | 'ldr' | 'thermistor' | 'relay';
type ViewMode = 'schematic' | 'realistic';

interface CircuitComponent { id: string; type: ComponentType; value: number; name: string; }

const CircuitBuilder: React.FC = () => {
  const [components, setComponents] = useState<CircuitComponent[]>([
    { id: '1', type: 'battery', value: 9, name: 'Battery 9V' },
    { id: '2', type: 'bulb', value: 10, name: 'Bulb 10Ω' },
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>('realistic');
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const analysis = useMemo(() => {
    const openSwitch = components.find(c => c.type === 'switch' && c.value === 0);
    if (openSwitch) return { totalVoltage: 0, totalResistance: Infinity, current: 0, error: 'Open Circuit' };

    const totalVoltage = components.filter(c => c.type === 'battery').reduce((acc, c) => acc + c.value, 0);
    const totalResistance = components.reduce((acc, c) => {
        if (['resistor','bulb'].includes(c.type)) return acc + c.value;
        if (c.type === 'ldr') return acc + (20000 / (c.value + 1));
        if (c.type === 'thermistor') return acc + (10000 / (c.value + 1));
        return acc;
    }, 0);
    
    const current = totalResistance > 0 ? totalVoltage / totalResistance : 0;
    return { totalVoltage, totalResistance, current, error: null };
  }, [components]);

  const addComponent = (type: ComponentType) => {
      setComponents([...components, { id: Date.now().toString(), type, value: 10, name: type }]);
  };
  
  const removeComponent = (id: string) => {
      setRemovingId(id);
      setTimeout(() => { setComponents(p => p.filter(c => c.id !== id)); setRemovingId(null); }, 200);
  };

  const toggleState = (id: string) => setComponents(c => c.map(x => x.id === id ? { ...x, value: x.value ? 0 : 1 } : x));
  const updateValue = (id: string, v: number) => setComponents(c => c.map(x => x.id === id ? { ...x, value: v } : x));

  // Visual Helpers
  const width = 600; const height = 350; const padding = 50;
  const getPos = (i: number, total: number) => {
      const perimeter = (width + height) * 2;
      const dist = (perimeter / total) * i;
      if (dist < width) return { x: dist, y: 0, rot: 0 };
      if (dist < width + height) return { x: width, y: dist - width, rot: 90 };
      if (dist < width * 2 + height) return { x: width - (dist - width - height), y: height, rot: 180 };
      return { x: 0, y: height - (dist - width * 2 - height), rot: 270 };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-6">
             <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2"><Cpu className="text-emerald-400"/> Circuit Builder</h3>
                 <div className="flex bg-slate-900 rounded border border-slate-600 p-1">
                     <button onClick={() => setViewMode('schematic')} className={`p-1 rounded ${viewMode==='schematic'?'bg-slate-700 text-white':'text-slate-400'}`}><Eye size={16}/></button>
                     <button onClick={() => setViewMode('realistic')} className={`p-1 rounded ${viewMode==='realistic'?'bg-emerald-700 text-white':'text-slate-400'}`}><Box size={16}/></button>
                 </div>
             </div>
             
             <div className="grid grid-cols-4 gap-2">
                 {['battery', 'bulb', 'resistor', 'switch', 'diode', 'ldr', 'thermistor', 'relay'].map(t => (
                     <button key={t} onClick={() => addComponent(t as any)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-[10px] uppercase text-center text-slate-300 border border-slate-600">{t}</button>
                 ))}
             </div>

             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                 {components.map(c => (
                     <div key={c.id} className={`bg-slate-900 p-2 rounded border border-slate-700 ${removingId===c.id?'opacity-0':''}`}>
                         <div className="flex justify-between"><span className="text-xs font-bold text-white capitalize">{c.type}</span> <button onClick={()=>removeComponent(c.id)} className="text-red-400"><Trash2 size={12}/></button></div>
                         {(c.type === 'switch' || c.type === 'diode') ? (
                             <button onClick={() => toggleState(c.id)} className="w-full text-xs py-1 bg-slate-800 mt-1 border border-slate-600">{c.value ? 'ON / Closed' : 'OFF / Open'}</button>
                         ) : (
                             <input type="range" min="0" max="100" value={c.value} onChange={e=>updateValue(c.id, Number(e.target.value))} className="w-full h-1 mt-2 bg-slate-700 rounded-lg"/>
                         )}
                     </div>
                 ))}
             </div>
             
             <div className="bg-slate-900 p-3 rounded border border-slate-700">
                 <div className="text-xs text-slate-400">Current</div>
                 <div className="text-2xl font-mono font-bold text-blue-400">{(analysis.current * 1000).toFixed(0)} mA</div>
             </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
            {viewMode === 'realistic' ? (
                <RotatableView className="w-full h-full flex items-center justify-center" initialRotation={{x:0,y:0}}>
                    <div className="relative w-[500px] h-[300px] bg-slate-900/50 border-2 border-slate-700 rounded-lg transform-style-3d">
                        {components.map((c, i) => {
                            const pos = getPos(i, components.length);
                            return (
                                <div key={c.id} className="absolute w-12 h-12 bg-slate-800 border border-slate-500 rounded flex items-center justify-center shadow-xl" 
                                     style={{ left: pos.x + 50, top: pos.y + 50, transform: `translate(-50%, -50%) rotate(${pos.rot}deg) translateZ(20px)` }}>
                                    <span className="text-[10px] text-white font-bold capitalize">{c.type}</span>
                                </div>
                            )
                        })}
                    </div>
                </RotatableView>
            ) : (
                <div className="w-full h-full bg-white flex items-center justify-center">
                    <svg width="500" height="300" className="overflow-visible">
                        <rect x="50" y="50" width="400" height="200" fill="none" stroke="black" strokeWidth="2"/>
                        {components.map((c, i) => {
                            const pos = getPos(i, components.length);
                            return (
                                <g key={c.id} transform={`translate(${pos.x + 50}, ${pos.y + 50}) rotate(${pos.rot})`}>
                                    <circle r="15" fill="white" stroke="black" strokeWidth="1"/>
                                    <text textAnchor="middle" dy="4" fontSize="10">{c.type.slice(0,3)}</text>
                                </g>
                            )
                        })}
                    </svg>
                </div>
            )}
        </div>
    </div>
  );
};

export default CircuitBuilder;

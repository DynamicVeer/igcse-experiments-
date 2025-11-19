
import React, { useState, useMemo } from 'react';
import { Brain, RotateCcw, Zap, TrendingUp, Plus, Trash2, Activity, Lightbulb, Settings2 } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

type ComponentType = 'resistor' | 'lamp';

interface DataPoint {
  id: number;
  v: number;
  i: number;
}

const CircuitLab: React.FC = () => {
  const [voltage, setVoltage] = useState(0); // Supply Voltage
  const [resistance, setResistance] = useState(10); // Fixed Resistor Value
  const [component, setComponent] = useState<ComponentType>('resistor');
  const [readings, setReadings] = useState<DataPoint[]>([]);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Physics Calculations ---
  const current = useMemo(() => {
      if (voltage === 0) return 0;
      
      if (component === 'resistor') {
          // Ohmic: I = V / R
          return voltage / resistance;
      } else {
          // Filament Lamp: Non-Ohmic (Resistance increases with Temp/Voltage)
          // Approx model: I = k * V^0.6
          // Calibrated: 12V -> ~2A
          // 2 = k * 12^0.6 => k approx 0.45
          return 0.45 * Math.pow(voltage, 0.6);
      }
  }, [voltage, resistance, component]);

  const resistanceActual = current > 0 ? voltage / current : (component === 'resistor' ? resistance : 0);
  const power = voltage * current;

  // --- Handlers ---
  const handleRecord = () => {
      const newPoint = { id: Date.now(), v: voltage, i: current };
      // Avoid duplicates for exact same voltage to keep graph clean
      if (!readings.find(r => Math.abs(r.v - voltage) < 0.1)) {
          setReadings([...readings, newPoint].sort((a, b) => a.v - b.v));
      }
  };

  const handleClear = () => {
      setReadings([]);
      setExplanation("");
  };

  const handleReset = () => {
      setVoltage(0);
      setReadings([]);
      setComponent('resistor');
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        component: component === 'resistor' ? "Fixed Resistor" : "Filament Lamp",
        dataPoints: readings.map(r => `(${r.v.toFixed(1)}V, ${r.i.toFixed(2)}A)`).join(', '),
        behavior: component === 'resistor' ? "Linear (Ohmic)" : "Curved (Non-Ohmic)",
        concept: "IV Characteristics"
    };
    const text = await explainConcept("IV Characteristic Graph Analysis", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  // --- Graph Scales ---
  const maxV = 12;
  const maxI = 2.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       {/* Left Panel: Controls & Data */}
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Zap className="text-yellow-400"/> Ohm's Law Lab
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Experiment">
                   <RotateCcw size={16} />
               </button>
           </div>

           <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* Component Selector */}
               <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
                   <button 
                      onClick={() => { setComponent('resistor'); setReadings([]); }}
                      className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all ${component === 'resistor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   >
                       <Activity size={14}/> Resistor
                   </button>
                   <button 
                      onClick={() => { setComponent('lamp'); setReadings([]); }}
                      className={`flex-1 py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all ${component === 'lamp' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                   >
                       <Lightbulb size={14}/> Lamp
                   </button>
               </div>

               {/* Controls */}
               <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-4">
                   <div>
                       <label className="flex justify-between text-sm font-bold text-emerald-400 mb-1">
                           <span>Supply Voltage</span>
                           <span>{voltage.toFixed(1)} V</span>
                       </label>
                       <input 
                           type="range" min="0" max="12" step="0.5"
                           value={voltage} onChange={e => setVoltage(Number(e.target.value))} 
                           className="w-full accent-emerald-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                       />
                   </div>
                   
                   {component === 'resistor' && (
                       <div>
                           <label className="flex justify-between text-sm font-bold text-rose-400 mb-1">
                               <span>Resistance</span>
                               <span>{resistance} Ω</span>
                           </label>
                           <input 
                               type="range" min="5" max="50" step="5"
                               value={resistance} onChange={e => { setResistance(Number(e.target.value)); setReadings([]); }} 
                               className="w-full accent-rose-500 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                           />
                       </div>
                   )}
               </div>
               
               {/* Readings Action */}
               <div className="grid grid-cols-2 gap-2">
                   <button 
                      onClick={handleRecord}
                      className="py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                   >
                       <Plus size={16}/> Record Point
                   </button>
                   <button 
                      onClick={handleClear}
                      disabled={readings.length === 0}
                      className="py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                       <Trash2 size={16}/> Clear Data
                   </button>
               </div>

               {/* Data Table */}
               {readings.length > 0 && (
                   <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                       <table className="w-full text-xs text-left">
                           <thead className="bg-slate-800 text-slate-400">
                               <tr>
                                   <th className="p-2 pl-4">Voltage (V)</th>
                                   <th className="p-2">Current (A)</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-800">
                               {readings.map((r) => (
                                   <tr key={r.id} className="hover:bg-slate-800/50">
                                       <td className="p-2 pl-4 font-mono text-emerald-400">{r.v.toFixed(1)}</td>
                                       <td className="p-2 font-mono text-blue-400">{r.i.toFixed(2)}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
           </div>
       </div>

       {/* Middle Panel: Circuit Visualization */}
       <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 h-full">
           {/* Visual Circuit */}
           <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden p-8 flex items-center justify-center min-h-[300px]">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#475569_1px,transparent_1px)] bg-[length:20px_20px]"></div>
               
               {/* SVG Circuit */}
               <div className="relative w-[500px] h-[300px]">
                   {/* Wires */}
                   <svg className="absolute inset-0 w-full h-full overflow-visible">
                       {/* Main Loop */}
                       <rect x="50" y="50" width="400" height="200" fill="none" stroke="#64748b" strokeWidth="4" rx="10" />
                       
                       {/* Component Gap */}
                       <line x1="200" y1="50" x2="300" y2="50" stroke="#0f172a" strokeWidth="6" />

                       {/* Electron Flow */}
                       {current > 0 && (
                           <rect 
                              x="50" y="50" width="400" height="200" 
                              fill="none" stroke="#fbbf24" strokeWidth="2" rx="10" strokeDasharray="10 10"
                              className="animate-circuit-flow"
                              style={{ animationDuration: `${Math.max(0.2, 3 - current)}s` }}
                           />
                       )}

                       {/* Parallel Voltmeter Wires */}
                       <path d="M 220 50 L 220 10 L 280 10 L 280 50" fill="none" stroke="#64748b" strokeWidth="2" />
                   </svg>

                   {/* Power Supply (Bottom) */}
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[25px] bg-slate-800 px-4 py-2 border border-slate-600 rounded shadow-lg flex flex-col items-center z-10">
                       <div className="flex items-center gap-2 mb-1">
                           <div className="w-8 h-4 border-2 border-slate-500 rounded bg-slate-900 relative">
                               <div className="absolute left-1 top-1 bottom-1 w-1 bg-red-500"></div>
                               <div className="absolute right-1 top-1 bottom-1 w-1 bg-blue-500"></div>
                           </div>
                           <span className="text-xs font-bold text-slate-300">DC Supply</span>
                       </div>
                       <span className="font-mono text-emerald-400 font-bold text-lg">{voltage.toFixed(1)} V</span>
                   </div>

                   {/* Ammeter (Left) */}
                   <div className="absolute left-0 top-1/2 -translate-x-[25px] -translate-y-1/2 w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-500 flex items-center justify-center shadow-lg z-10">
                       <span className="font-bold text-blue-400 font-mono text-xs">{current.toFixed(2)}A</span>
                       <div className="absolute -bottom-4 text-[10px] font-bold text-slate-500">AMMETER</div>
                   </div>

                   {/* Voltmeter (Top Parallel) */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20px] w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-500 flex items-center justify-center shadow-lg z-10">
                       <span className="font-bold text-emerald-400 font-mono text-xs">{voltage.toFixed(1)}V</span>
                       <div className="absolute -top-4 text-[10px] font-bold text-slate-500">VOLTMETER</div>
                   </div>

                   {/* Test Component (Top Center) */}
                   <div className="absolute top-[50px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                       {component === 'resistor' ? (
                           <div className="w-24 h-10 bg-slate-200 border-4 border-rose-400 rounded flex items-center justify-center shadow-md relative">
                               <div className="w-full h-1 bg-slate-300 absolute"></div>
                               {/* Color Bands (Fake) */}
                               <div className="w-2 h-full bg-yellow-500 absolute left-4 opacity-80"></div>
                               <div className="w-2 h-full bg-purple-500 absolute left-8 opacity-80"></div>
                               <div className="w-2 h-full bg-black absolute left-12 opacity-80"></div>
                               <span className="z-10 font-bold text-slate-800 text-xs bg-white/80 px-1 rounded">{resistance}Ω</span>
                               
                               {/* Heat Visual */}
                               {power > 1 && (
                                   <div className="absolute inset-0 bg-red-500 blur-xl animate-pulse" style={{ opacity: Math.min(power/50, 0.6) }}></div>
                               )}
                           </div>
                       ) : (
                           <div className="relative flex items-center justify-center">
                               {/* Bulb Glow */}
                               <div 
                                  className="absolute w-32 h-32 bg-yellow-400 rounded-full blur-xl transition-opacity duration-200 pointer-events-none"
                                  style={{ opacity: Math.min(power / 20, 1) }}
                               ></div>
                               <Lightbulb 
                                  size={64} 
                                  className="relative z-10 transition-colors duration-200"
                                  color={power > 0.5 ? '#fef08a' : '#94a3b8'}
                                  fill={power > 0.5 ? '#facc15' : '#1e293b'}
                                  style={{ filter: power > 20 ? 'drop-shadow(0 0 10px #eab308)' : 'none' }}
                               />
                               {/* Filament Hotness */}
                               {power > 0 && (
                                 <div className="absolute font-bold text-[10px] bg-black/50 px-1 rounded text-yellow-200 -bottom-4">
                                     {power.toFixed(1)} W
                                 </div>
                               )}
                           </div>
                       )}
                   </div>
               </div>
           </div>

           {/* Graph & Analysis Panel */}
           <div className="h-64 bg-slate-900 rounded-xl border border-slate-700 p-4 flex gap-6">
               {/* SVG Graph */}
               <div className="flex-1 relative border-l border-b border-slate-600">
                   <div className="absolute -left-8 top-1/2 -rotate-90 text-xs text-slate-500 font-bold">Current (A)</div>
                   <div className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 text-xs text-slate-500 font-bold">Voltage (V)</div>

                   <svg className="w-full h-full overflow-visible" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                       {/* Grid Lines */}
                       {[0, 25, 50, 75, 100].map(p => (
                           <React.Fragment key={p}>
                               <line x1={p} y1="0" x2={p} y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2"/>
                               <line x1="0" y1={p} x2="100" y2={p} stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2"/>
                           </React.Fragment>
                       ))}

                       {/* Data Line */}
                       {readings.length > 1 && (
                           <polyline 
                               points={readings.map(r => `${(r.v/maxV)*100},${100 - (r.i/maxI)*100}`).join(' ')}
                               fill="none"
                               stroke={component === 'resistor' ? '#818cf8' : '#facc15'}
                               strokeWidth="2"
                           />
                       )}

                       {/* Data Points */}
                       {readings.map(r => (
                           <circle 
                              key={r.id}
                              cx={(r.v/maxV)*100} 
                              cy={100 - (r.i/maxI)*100} 
                              r="1.5" 
                              fill="#fff"
                              stroke={component === 'resistor' ? '#4f46e5' : '#ca8a04'}
                              strokeWidth="1"
                           />
                       ))}
                       
                       {/* Current Live Point */}
                       <circle 
                          cx={(voltage/maxV)*100} 
                          cy={100 - (current/maxI)*100} 
                          r="2.5" 
                          fill="#ef4444"
                          className="animate-pulse"
                       />
                   </svg>
               </div>

               {/* AI Explanation */}
               <div className="w-1/3 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-sm border-b border-slate-700 pb-2">
                        <TrendingUp size={16} className="text-emerald-400"/> Analysis
                    </div>
                    
                    {explanation ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar text-xs text-slate-300 leading-relaxed">
                            {explanation}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-600 italic p-4">
                            Record at least 3 data points to enable AI analysis.
                        </div>
                    )}

                    <button 
                        onClick={handleExplain}
                        disabled={readings.length < 3 || loading}
                        className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Brain size={14} /> {loading ? "Analyzing..." : "Explain Graph"}
                    </button>
               </div>
           </div>
       </div>
       
       <style>{`
         @keyframes circuit-flow {
             to { stroke-dashoffset: -20; }
         }
         .animate-circuit-flow {
             animation: circuit-flow linear infinite;
         }
       `}</style>
    </div>
  );
};

export default CircuitLab;

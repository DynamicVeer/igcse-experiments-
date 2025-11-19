
import React, { useState, useMemo } from 'react';
import { Zap, Plus, Trash2, Lightbulb, Battery, Activity, Brain, RotateCcw, Cpu, Info } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import Tooltip from './ui/Tooltip';

type ComponentType = 'battery' | 'resistor' | 'bulb';

interface CircuitComponent {
  id: string;
  type: ComponentType;
  value: number; // Voltage for battery, Resistance for others
  name: string;
}

const CircuitBuilder: React.FC = () => {
  const [components, setComponents] = useState<CircuitComponent[]>([
    { id: '1', type: 'battery', value: 9, name: 'Battery 9V' },
    { id: '2', type: 'bulb', value: 10, name: 'Bulb 10Ω' }
  ]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Circuit Analysis (Series Circuit)
  const analysis = useMemo(() => {
    const totalVoltage = components
      .filter(c => c.type === 'battery')
      .reduce((acc, c) => acc + c.value, 0);
      
    const totalResistance = components
      .filter(c => c.type !== 'battery')
      .reduce((acc, c) => acc + c.value, 0);
    
    // Avoid division by zero
    const current = totalResistance > 0 ? totalVoltage / totalResistance : (totalVoltage > 0 ? 999 : 0); // Short circuit or 0
    
    const powerTotal = current * totalVoltage;

    return { totalVoltage, totalResistance, current, powerTotal };
  }, [components]);

  const addComponent = (type: ComponentType) => {
    if (components.length >= 8) return; // Limit for visual clarity
    const id = Date.now().toString();
    let newVal = 0;
    let newName = '';
    
    if (type === 'battery') { newVal = 9; newName = 'Cell 9V'; }
    else if (type === 'resistor') { newVal = 100; newName = 'Resistor 100Ω'; }
    else if (type === 'bulb') { newVal = 20; newName = 'Lamp 20Ω'; }

    setComponents([...components, { id, type, value: newVal, name: newName }]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const updateValue = (id: string, val: number) => {
    setComponents(components.map(c => c.id === id ? { ...c, value: val } : c));
  };

  const handleExplain = async () => {
    setLoading(true);
    const config = components.map(c => `${c.type} (${c.value} ${c.type === 'battery' ? 'V' : 'Ω'})`).join(', ');
    const data = {
      circuitType: "Series",
      components: config,
      totalVoltage: `${analysis.totalVoltage} V`,
      totalResistance: `${analysis.totalResistance} Ω`,
      current: `${analysis.current.toFixed(2)} A`,
      powerDissipated: `${analysis.powerTotal.toFixed(2)} W`,
      physicsPrinciple: "Ohm's Law (V=IR)"
    };
    const text = await explainConcept("Series Circuit Analysis", data);
    setExplanation(text || "Analysis unavailable.");
    setLoading(false);
  };

  const handleReset = () => {
      setComponents([
        { id: '1', type: 'battery', value: 9, name: 'Battery 9V' },
        { id: '2', type: 'bulb', value: 10, name: 'Bulb 10Ω' }
      ]);
      setExplanation("");
  };

  // --- Visual Rendering Logic ---
  // Map components to positions along a rectangular path
  const width = 600;
  const height = 350;
  const padding = 50;
  const perimeter = 2 * (width - 2*padding + height - 2*padding);
  
  // Path definition for electron flow
  const pathD = `M ${padding} ${height/2} L ${padding} ${padding} L ${width-padding} ${padding} L ${width-padding} ${height-padding} L ${padding} ${height-padding} Z`;

  // Helper to get coordinates on the rectangle perimeter based on progress (0 to 1)
  const getPosOnRect = (progress: number) => {
      const w = width - 2 * padding;
      const h = height - 2 * padding;
      const p = progress * (2*w + 2*h);
      
      // Start from bottom-left (padding, height-padding) going up?
      // Let's standard loop: Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left -> Close
      // Simpler: We distribute them evenly.
      // Let's define the path segments.
      // Seg 1: Left side (Up)
      // Seg 2: Top side (Right)
      // Seg 3: Right side (Down)
      // Seg 4: Bottom side (Left)
      
      // Actually, components usually sit on Top/Bottom/Sides.
      // Let's distribute points simply by angle or distance.
      // For a builder, visualizing them in a circle or simplified rectangle is fine.
      // Let's stick to the rectangular path defined in pathD visually, but place components
      // in a row layout below or use a fixed grid?
      // No, let's place them ON the wire.
      
      // Simplified visual: Components are spaced evenly on the loop.
      // 0 is Top Left.
      
      if (p < w) return { x: padding + p, y: padding, rotation: 0 }; // Top edge
      if (p < w + h) return { x: width - padding, y: padding + (p - w), rotation: 90 }; // Right edge
      if (p < 2*w + h) return { x: width - padding - (p - (w + h)), y: height - padding, rotation: 180 }; // Bottom edge
      return { x: padding, y: height - padding - (p - (2*w + h)), rotation: 270 }; // Left edge
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       {/* Sidebar Controls */}
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Cpu className="text-yellow-400"/> Circuit Builder
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Circuit">
                   <RotateCcw size={16} />
               </button>
           </div>

           {/* Component Palette */}
           <div className="grid grid-cols-3 gap-2">
               <button onClick={() => addComponent('battery')} className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
                   <Battery className="text-green-400 mb-1" size={20} />
                   <span className="text-[10px] font-bold text-slate-300">Battery</span>
               </button>
               <button onClick={() => addComponent('resistor')} className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
                   <Activity className="text-rose-400 mb-1" size={20} />
                   <span className="text-[10px] font-bold text-slate-300">Resistor</span>
               </button>
               <button onClick={() => addComponent('bulb')} className="flex flex-col items-center justify-center p-3 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
                   <Lightbulb className="text-yellow-400 mb-1" size={20} />
                   <span className="text-[10px] font-bold text-slate-300">Bulb</span>
               </button>
           </div>

           {/* Component List & Config */}
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 max-h-[300px]">
               {components.map((comp, idx) => (
                   <div key={comp.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 relative group">
                       <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                                {comp.type === 'battery' && <Battery size={14} className="text-green-500"/>}
                                {comp.type === 'resistor' && <Activity size={14} className="text-rose-500"/>}
                                {comp.type === 'bulb' && <Lightbulb size={14} className="text-yellow-500"/>}
                                <span className="text-sm font-bold text-slate-200">{comp.type.charAt(0).toUpperCase() + comp.type.slice(1)}</span>
                           </div>
                           <button onClick={() => removeComponent(comp.id)} className="text-slate-500 hover:text-red-400">
                               <Trash2 size={14} />
                           </button>
                       </div>
                       
                       <div className="flex items-center gap-2">
                           <input 
                              type="range" 
                              min="1" 
                              max={comp.type === 'battery' ? 24 : 200} 
                              step={comp.type === 'battery' ? 1 : 10}
                              value={comp.value} 
                              onChange={(e) => updateValue(comp.id, Number(e.target.value))}
                              className={`w-full h-1 rounded appearance-none cursor-pointer ${
                                  comp.type === 'battery' ? 'accent-green-500' : comp.type === 'bulb' ? 'accent-yellow-500' : 'accent-rose-500'
                              }`}
                           />
                           <span className="text-xs font-mono w-12 text-right text-slate-400">
                               {comp.value}{comp.type === 'battery' ? 'V' : 'Ω'}
                           </span>
                       </div>
                   </div>
               ))}
           </div>
           
           {/* Stats Panel */}
           <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2">
               <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Total Voltage</span>
                   <span className="text-green-400 font-mono">{analysis.totalVoltage} V</span>
               </div>
               <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Total Resistance</span>
                   <span className="text-rose-400 font-mono">{analysis.totalResistance} Ω</span>
               </div>
               <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2 mt-2">
                   <span className="text-slate-300">Current (I)</span>
                   <span className="text-blue-400 font-mono">{analysis.current.toFixed(2)} A</span>
               </div>
           </div>

           <button 
                onClick={handleExplain}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20"
           >
                <Brain size={18} /> {loading ? "Analyzing..." : "Explain Circuit"}
           </button>
           {explanation && (
               <div className="bg-slate-900 p-3 rounded text-xs text-slate-300 animate-fade-in border-l-2 border-indigo-500">
                   {explanation}
               </div>
           )}
       </div>

       {/* Visual Area */}
       <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 grid-bg opacity-10"></div>

           <svg width={width} height={height} className="z-10 overflow-visible">
               {/* Wire Path */}
               <path 
                   d={pathD} 
                   fill="none" 
                   stroke="#334155" 
                   strokeWidth="6" 
                   strokeLinejoin="round"
               />
               
               {/* Electron Flow Animation */}
               {analysis.current > 0 && (
                   <path 
                       d={pathD} 
                       fill="none" 
                       stroke="#3b82f6" 
                       strokeWidth="2" 
                       strokeDasharray="8 12"
                       className="animate-flow"
                       style={{ 
                           animationDuration: `${Math.max(0.5, 5 - analysis.current)}s`,
                           opacity: 0.8 
                       }}
                   />
               )}

               {/* Components */}
               {components.map((comp, idx) => {
                   const pos = getPosOnRect(idx / Math.max(components.length, 1));
                   // Shift components to distribute starting from top center?
                   // Let's just use the simple distribution logic.
                   const spacing = (2 * (width + height - 4*padding)) / components.length;
                   // We need a better mapping for visual stability, but idx/length works for "loop".
                   
                   const ComponentVisual = () => {
                       if (comp.type === 'battery') {
                           return (
                               <g transform={`rotate(${pos.rotation})`}>
                                   <rect x="-15" y="-10" width="30" height="20" fill="#1e293b" stroke="#22c55e" strokeWidth="2" rx="2"/>
                                   <line x1="-8" y1="-10" x2="-8" y2="10" stroke="#fff" strokeWidth="2"/>
                                   <line x1="8" y1="-5" x2="8" y2="5" stroke="#fff" strokeWidth="2"/>
                                   <text x="0" y="-15" textAnchor="middle" fill="#22c55e" fontSize="10" transform={`rotate(${-pos.rotation})`}>{comp.value}V</text>
                               </g>
                           );
                       }
                       if (comp.type === 'resistor') {
                           const heatOpacity = Math.min((analysis.current ** 2 * comp.value) / 50, 0.8); // Heat simulation
                           return (
                               <g transform={`rotate(${pos.rotation})`}>
                                   {/* Heat Glow */}
                                   {heatOpacity > 0.1 && <circle r="15" fill={`rgba(244, 63, 94, ${heatOpacity})`} filter="blur(8px)"/>}
                                   <rect x="-20" y="-8" width="40" height="16" fill="#1e293b" stroke="#fb7185" strokeWidth="2" rx="2"/>
                                   <path d="M -15 0 L -10 -5 L -5 5 L 0 -5 L 5 5 L 10 -5 L 15 0" fill="none" stroke="#fb7185" strokeWidth="1.5"/>
                                   <text x="0" y="-15" textAnchor="middle" fill="#fb7185" fontSize="10" transform={`rotate(${-pos.rotation})`}>{comp.value}Ω</text>
                               </g>
                           );
                       }
                       if (comp.type === 'bulb') {
                           const power = analysis.current ** 2 * comp.value;
                           const brightness = Math.min(power / 20, 1);
                           return (
                               <g transform={`rotate(${pos.rotation})`}>
                                   {/* Light Glow */}
                                   <circle r={15 + brightness * 20} fill={`rgba(250, 204, 21, ${brightness * 0.6})`} filter="blur(10px)"/>
                                   <circle r="12" fill={brightness > 0.1 ? '#fef08a' : '#1e293b'} stroke="#eab308" strokeWidth="2"/>
                                   <path d="M -5 5 L 0 -5 L 5 5" fill="none" stroke="#713f12" strokeWidth="1"/>
                                   <text x="0" y="-18" textAnchor="middle" fill="#eab308" fontSize="10" transform={`rotate(${-pos.rotation})`}>{comp.value}Ω</text>
                               </g>
                           );
                       }
                       return null;
                   };

                   return (
                       <g key={comp.id} transform={`translate(${pos.x}, ${pos.y})`}>
                           <ComponentVisual />
                       </g>
                   );
               })}
           </svg>
           
           {/* Legend/Status */}
           <div className="absolute bottom-4 right-4 flex gap-3">
                {analysis.current > 2 ? (
                    <div className="bg-red-900/50 text-red-200 px-3 py-1 rounded-full text-xs border border-red-500/30 flex items-center gap-1 animate-pulse">
                        <Activity size={12}/> High Current Warning
                    </div>
                ) : (
                    <div className="bg-slate-900/50 text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-700">
                        Standard Operation
                    </div>
                )}
           </div>
       </div>
       <style>{`
         .grid-bg {
             background-image: linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px);
             background-size: 20px 20px;
         }
         @keyframes flow {
             to { stroke-dashoffset: -20; }
         }
         .animate-flow {
             animation: flow linear infinite;
         }
       `}</style>
    </div>
  );
};

export default CircuitBuilder;

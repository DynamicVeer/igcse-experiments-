
import React, { useState } from 'react';
import { Scale, RotateCcw, Brain, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const MomentsLab: React.FC = () => {
  const [mass1, setMass1] = useState(10);
  const [dist1, setDist1] = useState(2);
  const [mass2, setMass2] = useState(10);
  const [dist2, setDist2] = useState(2);
  const [showForces, setShowForces] = useState(true);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Physics Calculation: Moment = Force x Distance (M = mgd)
  // g cancels out for balance, so we can just compare mass x distance
  const moment1 = mass1 * dist1; // Anticlockwise
  const moment2 = mass2 * dist2; // Clockwise
  const netMoment = moment2 - moment1;
  
  // Visual rotation clamping (max 20 degrees)
  const rotation = Math.max(Math.min(netMoment * 1.5, 20), -20);
  const isBalanced = Math.abs(netMoment) < 0.5; // Tolerance

  const handleReset = () => {
    setMass1(10);
    setDist1(2);
    setMass2(10);
    setDist2(2);
    setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        leftSide: { mass: `${mass1}kg`, distance: `${dist1}m`, moment: `${moment1.toFixed(1)} unit` },
        rightSide: { mass: `${mass2}kg`, distance: `${dist2}m`, moment: `${moment2.toFixed(1)} unit` },
        netMoment: netMoment.toFixed(1),
        state: isBalanced ? "Balanced (Equilibrium)" : (netMoment > 0 ? "Tilting Clockwise (Right)" : "Tilting Anticlockwise (Left)"),
        principle: "Sum of clockwise moments = Sum of anticlockwise moments"
    };
    const text = await explainConcept("Principle of Moments (Levers)", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Scale className="text-orange-400"/> Principle of Moments
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Simulation">
                   <RotateCcw size={16} />
               </button>
           </div>
           <p className="text-slate-400 text-sm">
               Balance the beam by adjusting masses and distances. 
               <br/>$\tau = F \times d$
           </p>
           
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* Left Control */}
               <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                   <h4 className="text-blue-400 font-bold text-sm mb-3 flex justify-between">
                       <span>Left Side (Anticlockwise)</span>
                       <span>$\tau_1 = {moment1.toFixed(0)}$</span>
                   </h4>
                   <div className="space-y-3">
                       <div>
                           <label className="flex justify-between text-xs text-slate-300 mb-1">
                               <span>Mass ($m_1$)</span>
                               <span>{mass1} kg</span>
                           </label>
                           <input 
                               type="range" min="1" max="20" step="1" 
                               value={mass1} onChange={e => setMass1(Number(e.target.value))} 
                               className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                           />
                       </div>
                       <div>
                           <label className="flex justify-between text-xs text-slate-300 mb-1">
                               <span>Distance ($d_1$)</span>
                               <span>{dist1} m</span>
                           </label>
                           <input 
                               type="range" min="0.5" max="4" step="0.5" 
                               value={dist1} onChange={e => setDist1(Number(e.target.value))} 
                               className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                           />
                       </div>
                   </div>
               </div>

               {/* Right Control */}
               <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
                   <h4 className="text-red-400 font-bold text-sm mb-3 flex justify-between">
                       <span>Right Side (Clockwise)</span>
                       <span>$\tau_2 = {moment2.toFixed(0)}$</span>
                   </h4>
                   <div className="space-y-3">
                       <div>
                           <label className="flex justify-between text-xs text-slate-300 mb-1">
                               <span>Mass ($m_2$)</span>
                               <span>{mass2} kg</span>
                           </label>
                           <input 
                               type="range" min="1" max="20" step="1" 
                               value={mass2} onChange={e => setMass2(Number(e.target.value))} 
                               className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                           />
                       </div>
                       <div>
                           <label className="flex justify-between text-xs text-slate-300 mb-1">
                               <span>Distance ($d_2$)</span>
                               <span>{dist2} m</span>
                           </label>
                           <input 
                               type="range" min="0.5" max="4" step="0.5" 
                               value={dist2} onChange={e => setDist2(Number(e.target.value))} 
                               className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                           />
                       </div>
                   </div>
               </div>

               <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="showForces"
                        checked={showForces}
                        onChange={(e) => setShowForces(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-emerald-500"
                    />
                    <label htmlFor="showForces" className="text-sm text-slate-300">Show Force Vectors</label>
               </div>
           </div>

           <div className="pt-4 border-t border-slate-700">
               <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${isBalanced ? 'bg-emerald-900/30 border border-emerald-600/30 text-emerald-300' : 'bg-slate-900 border border-slate-700 text-slate-400'}`}>
                   {isBalanced ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                   <span className="font-bold">{isBalanced ? "System Balanced!" : "Unbalanced"}</span>
               </div>

               <button 
                  onClick={handleExplain}
                  disabled={loading}
                  className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50 transition-colors"
               >
                  <Brain size={16} /> {loading ? "Thinking..." : "Explain Physics"}
               </button>
               {explanation && (
                   <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in border-l-2 border-cyan-500">
                       {explanation}
                   </div>
               )}
           </div>
       </div>

       <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-end pb-20 relative overflow-hidden">
           {/* Sky/Ground Background */}
           <div className="absolute inset-0 z-0">
               <div className="h-2/3 bg-slate-900"></div>
               <div className="h-1/3 bg-slate-800/50 border-t border-slate-700"></div>
           </div>
           
           {/* Center Line Grid */}
           <div className="absolute inset-0 flex justify-center z-0 opacity-20 pointer-events-none">
               <div className="w-px h-full bg-white border-r border-dashed border-slate-500"></div>
           </div>

           {/* MOMENTS VISUALIZER SVG */}
           <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
               <svg width="300" height="200" viewBox="-150 -150 300 200" className="overflow-visible">
                   <defs>
                       <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5"
                           markerWidth="6" markerHeight="6"
                           orient="auto-start-reverse">
                         <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
                       </marker>
                       <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5"
                           markerWidth="6" markerHeight="6"
                           orient="auto-start-reverse">
                         <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                       </marker>
                   </defs>
                   
                   {/* Anticlockwise Moment (Blue) */}
                   <path 
                       d="M 0 -80 A 80 80 0 0 0 -70 -30"
                       fill="none" 
                       stroke="#3b82f6" // Blue-400
                       strokeWidth={Math.max(2, Math.min(moment1 / 4, 14))} 
                       markerEnd="url(#arrow-blue)"
                       strokeLinecap="round"
                       className="transition-all duration-300"
                       style={{ opacity: moment1 > 0.5 ? 0.8 : 0 }}
                   />
                   
                   {/* Clockwise Moment (Red) */}
                   <path 
                       d="M 0 -80 A 80 80 0 0 1 70 -30"
                       fill="none" 
                       stroke="#ef4444" // Red-400
                       strokeWidth={Math.max(2, Math.min(moment2 / 4, 14))} 
                       markerEnd="url(#arrow-red)"
                       strokeLinecap="round"
                       className="transition-all duration-300"
                       style={{ opacity: moment2 > 0.5 ? 0.8 : 0 }}
                   />
               </svg>
           </div>

           {/* Rotating Assembly */}
           <div className="relative z-20 transition-transform duration-700 ease-out origin-bottom" style={{ transform: `rotate(${rotation}deg)` }}>
               
               {/* Beam */}
               <div className="w-[600px] h-4 bg-slate-400 rounded-sm relative flex items-center shadow-lg overflow-visible">
                   
                   {/* Center Marker (Pivot Axis) */}
                   <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-600 z-10"></div>
                   <div className="absolute left-1/2 -translate-x-1/2 -top-4 text-[10px] font-bold text-slate-500">0</div>

                   {/* Ruler Markings */}
                   <div className="absolute w-full h-full opacity-50">
                       {[...Array(9)].map((_, i) => {
                           if (i === 4) return null; // Skip center
                           return (
                               <div key={i} className="absolute h-2 w-px bg-slate-800 top-1" style={{ left: `${(i+1)*10}%` }}></div>
                           )
                       })}
                   </div>

                   {/* Left Mass */}
                   <div 
                        className="absolute bottom-full transition-all duration-300" 
                        style={{ right: `${50 + (dist1 * 12.5)}%` }} // 4m max = 50% width. 1m = 12.5%
                   >
                       <div 
                            className="bg-blue-500 border-2 border-blue-400 rounded shadow-lg flex items-center justify-center text-white font-bold text-xs transition-all"
                            style={{ width: `${30 + mass1 * 2}px`, height: `${30 + mass1 * 2}px` }}
                       >
                           {mass1}
                       </div>
                       {showForces && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 bg-blue-400/50 flex flex-col items-center animate-fade-in" style={{ height: `${mass1 * 10 + 40}px` }}>
                               <div className="absolute bottom-0 border-x-[4px] border-x-transparent border-t-[8px] border-t-blue-400/50"></div>
                               <span className="mt-2 text-[10px] text-blue-300 font-mono bg-slate-900/80 px-1 rounded">F={mass1}g</span>
                           </div>
                       )}
                   </div>

                   {/* Right Mass */}
                   <div 
                        className="absolute bottom-full transition-all duration-300" 
                        style={{ left: `${50 + (dist2 * 12.5)}%` }}
                   >
                       <div 
                            className="bg-red-500 border-2 border-red-400 rounded shadow-lg flex items-center justify-center text-white font-bold text-xs transition-all"
                            style={{ width: `${30 + mass2 * 2}px`, height: `${30 + mass2 * 2}px` }}
                       >
                           {mass2}
                       </div>
                       {showForces && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 bg-red-400/50 flex flex-col items-center animate-fade-in" style={{ height: `${mass2 * 10 + 40}px` }}>
                               <div className="absolute bottom-0 border-x-[4px] border-x-transparent border-t-[8px] border-t-red-400/50"></div>
                               <span className="mt-2 text-[10px] text-red-300 font-mono bg-slate-900/80 px-1 rounded">F={mass2}g</span>
                           </div>
                       )}
                   </div>
               </div>
           </div>

           {/* Pivot Stand (Static) */}
           <div className="relative z-20 -mt-1 flex flex-col items-center group cursor-help">
               {/* Interactive Hint */}
               <div className="absolute -top-16 bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-600 opacity-0 group-hover:opacity-100 transition-all shadow-xl z-30 flex flex-col items-center pointer-events-none">
                   <span className="font-bold text-orange-400">Fulcrum / Pivot</span>
                   <span className="text-[10px] opacity-80">Center of Rotation ($d=0$)</span>
                   <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-600 absolute -bottom-1 rotate-45"></div>
               </div>

               {/* Pin/Joint */}
               <div className="w-6 h-6 bg-slate-300 rounded-full border-4 border-slate-500 z-20 relative shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
               </div>
               
               {/* Triangle Base */}
               <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[70px] border-b-slate-600 -mt-3"></div>
               
               {/* Base Plate */}
               <div className="w-32 h-2 bg-slate-700 rounded-full -mt-1 shadow-lg"></div>
           </div>

           {/* Stats Overlay */}
           <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur p-3 rounded border border-slate-600 text-xs font-mono z-30">
               <div className="flex justify-between gap-4 text-blue-400">
                   <span>Left Moment:</span>
                   <span>{moment1.toFixed(1)} Nm</span>
               </div>
               <div className="flex justify-between gap-4 text-red-400">
                   <span>Right Moment:</span>
                   <span>{moment2.toFixed(1)} Nm</span>
               </div>
               <div className="w-full h-px bg-slate-600 my-1"></div>
               <div className={`flex justify-between gap-4 font-bold ${isBalanced ? 'text-emerald-400' : 'text-white'}`}>
                   <span>Net Moment:</span>
                   <span>{Math.abs(netMoment).toFixed(1)} Nm</span>
               </div>
           </div>
       </div>
    </div>
  );
};

export default MomentsLab;

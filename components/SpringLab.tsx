
import React, { useState, useEffect } from 'react';
import { Brain, MoveDown, RotateCcw } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import Tooltip from './ui/Tooltip';

const SpringLab: React.FC = () => {
  const [mass, setMass] = useState(0); // kg
  const [springConstant, setSpringConstant] = useState(50); // N/m
  const [gravity] = useState(9.8);
  
  const [extension, setExtension] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Physics Calc: F = kx => x = F/k = mg/k
  useEffect(() => {
      const force = mass * gravity;
      const x = force / springConstant;
      setExtension(x);
  }, [mass, springConstant, gravity]);

  const handleExplain = async () => {
      setLoading(true);
      const result = await explainConcept("Hooke's Law", {
          mass: `${mass}kg`,
          springConstant: `${springConstant}N/m`,
          calculatedExtension: `${extension.toFixed(3)}m`,
          force: `${(mass * gravity).toFixed(1)}N`
      });
      setExplanation(result || "Error getting explanation.");
      setLoading(false);
  };

  const handleReset = () => {
      setMass(0);
      setSpringConstant(50);
  };

  // Drawing the Spring
  const springHeight = 100 + (extension * 200); // Visual scale
  const numCoils = 12;
  
  const generateSpringPath = () => {
      let path = `M 50 0 `;
      const coilHeight = springHeight / numCoils;
      for(let i=0; i < numCoils; i++) {
          path += `L ${i % 2 === 0 ? 80 : 20} ${(i+0.5) * coilHeight} `;
      }
      path += `L 50 ${springHeight}`;
      return path;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
           <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                    <MoveDown className="text-lime-400" /> 
                    <h3 className="text-xl font-bold text-white">Hooke's Law</h3>
               </div>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Defaults">
                    <RotateCcw size={16} />
               </button>
           </div>
           <p className="text-slate-400 text-sm">
               Explore the relationship between Force and Extension. $F = kx$
           </p>

           <div className="space-y-6">
               <Tooltip content="Adjust the mass attached to the spring (Force = Mass × Gravity)">
                   <div className="w-full">
                       <label className="flex justify-between text-sm font-bold text-slate-300 mb-1">
                           <span>Mass (kg)</span>
                           <span>{mass} kg</span>
                       </label>
                       <input 
                           type="range" min="0" max="10" step="0.5"
                           value={mass} 
                           onChange={(e) => setMass(Number(e.target.value))} 
                           className="w-full accent-lime-400 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                       />
                   </div>
               </Tooltip>

               <Tooltip content="Adjust the stiffness of the spring. Higher k means a stiffer spring.">
                   <div className="w-full">
                       <label className="flex justify-between text-sm font-bold text-slate-300 mb-1">
                           <span>Spring Constant (k)</span>
                           <span>{springConstant} N/m</span>
                       </label>
                       <input 
                           type="range" min="10" max="200" step="10"
                           value={springConstant} 
                           onChange={(e) => setSpringConstant(Number(e.target.value))} 
                           className="w-full accent-sky-400 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                       />
                   </div>
               </Tooltip>

               <div className="bg-slate-900 p-4 rounded border border-slate-600">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-slate-400 text-sm">Force (Weight):</span>
                       <span className="text-lime-400 font-mono">{(mass * gravity).toFixed(1)} N</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-sm">Extension (x):</span>
                       <span className="text-white font-mono font-bold">{extension.toFixed(2)} m</span>
                   </div>
               </div>
           </div>

           <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Ask AI Tutor"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                        {explanation}
                    </div>
                )}
            </div>
       </div>

       <div className="col-span-1 lg:col-span-2 flex gap-6">
           {/* Visualizer */}
           <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative p-8 flex justify-center overflow-hidden">
               {/* Ruler */}
               <div className="absolute left-10 top-10 bottom-10 w-12 border-r border-slate-600 flex flex-col justify-between py-2 text-xs text-slate-500 font-mono">
                   {[...Array(11)].map((_,i) => (
                       <div key={i} className="w-full text-right pr-2 relative">
                           <span className="absolute -top-2 right-2">{i}m</span>
                           <div className="absolute top-0 right-0 w-2 h-px bg-slate-600"></div>
                       </div>
                   ))}
               </div>

               {/* Spring System */}
               <div className="relative mt-0">
                    <div className="w-32 h-4 bg-slate-700 rounded absolute -top-4 -left-16"></div> {/* Ceiling */}
                    <svg width="100" height={600} className="overflow-visible">
                        <path 
                            d={generateSpringPath()} 
                            fill="none" 
                            stroke="#cbd5e1" 
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    {/* Weight Box */}
                    <div 
                        className="w-20 h-20 bg-lime-600/80 border-2 border-lime-400 rounded-lg absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm transition-all duration-300"
                        style={{ top: springHeight }}
                    >
                        {mass > 0 ? `${mass}kg` : '0kg'}
                    </div>
                    {/* Force Arrow */}
                    {mass > 0 && (
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-1 bg-red-500/80 transition-all duration-300 flex flex-col items-center"
                            style={{ top: springHeight + 85, height: Math.min(mass * 20, 150) }}
                        >
                            <div className="absolute bottom-[-8px] border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500/80"></div>
                            <span className="text-red-400 text-xs font-bold absolute top-1/2 -translate-y-1/2 ml-8 whitespace-nowrap">
                                W = {Math.round(mass * 9.8)}N
                            </span>
                        </div>
                    )}
               </div>
           </div>
           
           {/* Live Graph */}
           <div className="w-1/3 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col">
               <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase">Force vs Extension</h4>
               <div className="flex-1 relative border-l border-b border-slate-600">
                    {/* Graph Plot Dot */}
                    <div 
                        className="absolute w-3 h-3 bg-lime-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-[0_0_10px_rgba(163,230,53,1)]"
                        style={{ 
                            left: `${(extension / 2) * 100}%`, // Max 2m extension maps to 100% width roughly
                            bottom: `${(mass / 10) * 100}%` // Max 10kg maps to 100% height
                        }}
                    ></div>
                    
                    {/* Line of Best Fit (Ideal) */}
                    <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-20">
                         <svg className="w-full h-full" preserveAspectRatio="none">
                             <line x1="0" y1="100%" x2="100%" y2="0%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                         </svg>
                    </div>
               </div>
               <div className="flex justify-between text-xs text-slate-500 mt-2">
                   <span>0</span>
                   <span>Ext (m)</span>
               </div>
               <div className="absolute left-2 top-1/2 -rotate-90 text-xs text-slate-500 origin-left">
                   Force (N)
               </div>
           </div>
       </div>
    </div>
  );
};

export default SpringLab;

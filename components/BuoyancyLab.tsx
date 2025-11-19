
import React, { useState } from 'react';
import { Ship, ArrowUp, ArrowDown, Brain, RotateCcw, Anchor } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const BuoyancyLab: React.FC = () => {
  const [fluidDensity, setFluidDensity] = useState(1000); // kg/m^3
  const [objectVol, setObjectVol] = useState(0.01); // m^3
  const [objectDensity, setObjectDensity] = useState(800); // kg/m^3
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Constants
  const g = 9.8;

  // Calculations
  const mass = objectDensity * objectVol; // kg
  const weight = mass * g; // N (Downwards)
  
  // Buoyant Force = weight of fluid displaced
  // If fully submerged: V_displaced = V_object
  // Max buoyant force possible:
  const maxBuoyantForce = fluidDensity * objectVol * g;

  // Actual state
  const isFloating = maxBuoyantForce >= weight;
  
  // Actual Buoyant Force acting on it
  // If floating, Fb = Weight (equilibrium). If sinking, Fb = Max possible (fully submerged).
  const actualFb = isFloating ? weight : maxBuoyantForce;
  const netForce = isFloating ? 0 : weight - maxBuoyantForce;

  const handleReset = () => {
    setFluidDensity(1000);
    setObjectVol(0.01);
    setObjectDensity(800);
    setExplanation("");
  };

  const getFluidName = (d: number) => {
      if (d === 1000) return "Fresh Water";
      if (d === 1025) return "Salt Water";
      if (d === 920) return "Oil";
      if (d === 13600) return "Mercury";
      if (d === 1.2) return "Air";
      return "Unknown Fluid";
  };

  const handleExplain = async () => {
    setLoading(true);
    const currentFluidName = getFluidName(fluidDensity);
    const data = {
        archimedesPrinciple: "Upthrust = Weight of fluid displaced",
        fluid: currentFluidName,
        fluidDensity: `${fluidDensity} kg/m³`,
        weight: `${weight.toFixed(2)} N`,
        maxUpthrust: `${maxBuoyantForce.toFixed(2)} N`,
        outcome: isFloating ? "Floats" : "Sinks",
        netForce: `${netForce.toFixed(2)} N ${isFloating ? "" : "Downwards"}`
    };
    const text = await explainConcept("Buoyancy & Archimedes Principle", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Ship className="text-sky-400"/> Buoyancy
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RotateCcw size={16} />
               </button>
           </div>
           
           <p className="text-slate-400 text-sm">
               Explore Archimedes' Principle. <br/>
               {'$F_b = \\rho_{fluid} V g$'}
           </p>

           <div className="space-y-6 flex-1">
               <div>
                   <label className="text-xs font-bold text-slate-300 uppercase">Fluid</label>
                   <select 
                      value={fluidDensity}
                      onChange={(e) => setFluidDensity(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white mt-1 text-sm"
                   >
                       <option value="1000">Fresh Water (1000 kg/m³)</option>
                       <option value="1025">Salt Water (1025 kg/m³)</option>
                       <option value="920">Oil (920 kg/m³)</option>
                       <option value="13600">Mercury (13600 kg/m³)</option>
                       <option value="1.2">Air (1.2 kg/m³)</option>
                   </select>
               </div>

               <div>
                   <label className="text-xs font-bold text-slate-300 uppercase mb-1 block">Object Density (kg/m³)</label>
                   <input 
                     type="range" min="100" max="2000" step="50" 
                     value={objectDensity} onChange={e => setObjectDensity(Number(e.target.value))} 
                     className="w-full accent-sky-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="text-right text-xs text-sky-400 font-mono">{objectDensity} kg/m³</div>
               </div>

               <div>
                   <label className="text-xs font-bold text-slate-300 uppercase mb-1 block">Object Volume (m³)</label>
                   <input 
                     type="range" min="0.001" max="0.05" step="0.001" 
                     value={objectVol} onChange={e => setObjectVol(Number(e.target.value))} 
                     className="w-full accent-sky-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="text-right text-xs text-sky-400 font-mono">{objectVol} m³</div>
               </div>

               <div className="bg-slate-900 p-3 rounded border border-slate-600 space-y-2">
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-400">Weight ($mg$):</span>
                       <span className="text-red-400 font-mono">{weight.toFixed(1)} N</span>
                   </div>
                   <div className="flex justify-between text-sm">
                       <span className="text-slate-400">Buoyancy ($F_b$):</span>
                       <span className="text-emerald-400 font-mono">{actualFb.toFixed(1)} N</span>
                   </div>
               </div>
           </div>

           <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Analysis"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                        {explanation}
                    </div>
                )}
            </div>
       </div>

       <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-10 relative overflow-hidden">
            {/* Water Background */}
            <div className="absolute bottom-0 w-full h-3/4 bg-sky-500/20 border-t border-sky-500/30"></div>
            
            {/* Object */}
            <div 
                className="relative w-32 h-32 bg-slate-300 border-2 border-slate-500 rounded flex items-center justify-center transition-all duration-700 ease-in-out shadow-xl"
                style={{
                    // Simulate vertical position
                    transform: `translateY(${isFloating ? '-40px' : '80px'})` 
                }}
            >
                <span className="text-slate-600 font-bold text-xs">{objectDensity} kg/m³</span>

                {/* Force Vectors */}
                
                {/* Gravity (Down) */}
                <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 bg-red-500 w-1 flex flex-col items-center transition-all duration-300"
                    style={{ height: `${Math.min(weight * 2, 120)}px` }}
                >
                     <div className="absolute bottom-[-6px] border-x-[4px] border-x-transparent border-t-[6px] border-t-red-500"></div>
                     <span className="absolute bottom-[-20px] text-[10px] text-red-400 font-bold">mg</span>
                </div>

                {/* Buoyancy (Up) */}
                <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 bg-emerald-500 w-1 flex flex-col items-center transition-all duration-300"
                    style={{ height: `${Math.min(actualFb * 2, 120)}px` }}
                >
                     <div className="absolute top-[-6px] border-x-[4px] border-x-transparent border-b-[6px] border-b-emerald-500"></div>
                     <span className="absolute top-[-20px] text-[10px] text-emerald-400 font-bold">Fb</span>
                </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-slate-800/80 p-2 rounded border border-slate-600 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDown size={12} className="text-red-500"/> Weight: {weight.toFixed(1)}N
                    </div>
                    <div className="flex items-center gap-2">
                         <ArrowUp size={12} className="text-emerald-500"/> Upthrust: {actualFb.toFixed(1)}N
                    </div>
                </div>
                <div className={`px-3 py-1 rounded text-center font-bold text-sm ${isFloating ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                    {isFloating ? 'FLOATING' : 'SINKING'}
                </div>
            </div>
       </div>
    </div>
  );
};

export default BuoyancyLab;


import React, { useState, useMemo } from 'react';
import { Box, Droplets, Brain, RotateCcw, Scale } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const DensityLab: React.FC = () => {
  const [mass, setMass] = useState(5); // kg
  const [volume, setVolume] = useState(5); // Liters (dm^3)
  const [fluidDensity] = useState(1.0); // kg/L (Water)
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const density = mass / volume; // kg/L
  const isSinking = density > fluidDensity;
  
  // Calculate submerged percentage for floating objects
  // If density object < density fluid, ratio = rho_obj / rho_fluid
  const submergedRatio = Math.min(density / fluidDensity, 1);

  const handleReset = () => {
    setMass(5);
    setVolume(5);
    setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        mass: `${mass} kg`,
        volume: `${volume} L`,
        density: `${density.toFixed(2)} kg/L`,
        fluidDensity: "1.0 kg/L (Water)",
        outcome: isSinking ? "Sinks" : "Floats",
        submergedPercent: `${(submergedRatio * 100).toFixed(0)}%`
    };
    const text = await explainConcept("Density and Flotation", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  // Visual mapping
  // Volume controls size (scale). Mass controls visual "weight" (opacity/color intensity maybe, but mostly the physics).
  // Base size = 100px for 5L.
  const sizePx = Math.sqrt(volume) * 45; 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Box className="text-amber-400"/> Density Lab
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RotateCcw size={16} />
               </button>
           </div>
           
           <p className="text-slate-400 text-sm">
               Adjust mass and volume to determine density. <br/>
               $\rho = m / V$
           </p>

           <div className="space-y-6 flex-1">
               <div>
                   <label className="flex justify-between text-sm text-slate-300 mb-1">
                       <span>Mass (kg)</span>
                       <span>{mass} kg</span>
                   </label>
                   <input 
                     type="range" min="1" max="20" step="0.5" 
                     value={mass} onChange={e => setMass(Number(e.target.value))} 
                     className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
               </div>
               <div>
                   <label className="flex justify-between text-sm text-slate-300 mb-1">
                       <span>Volume (L)</span>
                       <span>{volume} L</span>
                   </label>
                   <input 
                     type="range" min="1" max="10" step="0.5" 
                     value={volume} onChange={e => setVolume(Number(e.target.value))} 
                     className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
               </div>

               <div className="bg-slate-900 p-4 rounded border border-slate-600">
                   <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Density:</span>
                        <span className={`text-2xl font-mono font-bold ${isSinking ? 'text-red-400' : 'text-emerald-400'}`}>
                            {density.toFixed(2)} <span className="text-xs text-slate-500">kg/L</span>
                        </span>
                   </div>
                   <div className="mt-2 text-xs text-center uppercase tracking-wider font-bold text-slate-500">
                       {isSinking ? "Object Sinks" : "Object Floats"}
                   </div>
               </div>
           </div>

           <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Density"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                        {explanation}
                    </div>
                )}
            </div>
       </div>

       <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-10 relative overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
           </div>

           {/* Tank */}
           <div className="relative w-80 h-96 border-x-4 border-b-4 border-slate-500 rounded-b-lg bg-slate-800/50 backdrop-blur-sm overflow-hidden z-10">
               {/* Water Level */}
               <div className="absolute bottom-0 w-full h-3/4 bg-blue-500/30 border-t border-blue-400/50 transition-all duration-1000">
                    {/* Surface waves */}
                    <div className="absolute top-0 w-full h-2 bg-blue-400/20 animate-pulse"></div>
               </div>
               
               {/* Object */}
               <div 
                 className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out flex items-center justify-center font-bold text-slate-800 shadow-xl border border-amber-600"
                 style={{
                     width: `${sizePx}px`,
                     height: `${sizePx}px`,
                     backgroundColor: '#fbbf24', // Amber-400
                     // Physics Positioning
                     // Tank height is 384px (h-96). Water is 75% (288px).
                     // Bottom is 0. Surface is 288px.
                     // If sinking: bottom (0). 
                     // If floating: Surface - submerged_amount.
                     bottom: isSinking ? '4px' : `${(0.75 * 384) - (sizePx * submergedRatio)}px`,
                     // Slight tilt if floating for realism
                     transform: `translateX(-50%) ${!isSinking ? 'rotate(3deg)' : 'rotate(0deg)'}`
                 }}
               >
                   {mass}kg
               </div>

               {/* Water Displacement Visual (Simplified) */}
               <div className="absolute bottom-0 right-0 p-2 text-[10px] text-blue-300 font-mono opacity-70">
                   Fluid: Water (1 kg/L)
               </div>
           </div>
           
           <div className="mt-4 flex gap-4">
               <div className="flex items-center gap-2 text-xs text-slate-400">
                   <div className="w-3 h-3 bg-amber-400 rounded-sm"></div> Object
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400">
                   <div className="w-3 h-3 bg-blue-500/30 border border-blue-400/50 rounded-sm"></div> Water
               </div>
           </div>

       </div>
    </div>
  );
};

export default DensityLab;

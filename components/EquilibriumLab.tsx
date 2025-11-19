
import React, { useState, useEffect } from 'react';
import { Scale, Thermometer, Gauge, RotateCcw, Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const EquilibriumLab: React.FC = () => {
  const [temp, setTemp] = useState(25); // Celsius
  const [pressure, setPressure] = useState(1); // Atm
  const [equilibriumPos, setEquilibriumPos] = useState(0.5); // 0 (Reactants) to 1 (Products)
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // System: 2NO2 (Brown, Gas) <=> N2O4 (Colorless, Gas) + Heat
  // Delta H < 0 (Exothermic forward)
  // Moles: Left = 2, Right = 1.

  useEffect(() => {
      // Le Chatelier Logic
      
      // 1. Temperature Effect (Exothermic)
      // Increase T -> Shifts Left (Endothermic direction) -> More NO2 (Brown)
      // Decrease T -> Shifts Right (Exothermic direction) -> More N2O4 (Colorless)
      // Normalizing T: 0C to 100C.
      const tempFactor = (temp - 25) / 100; 
      // Higher temp = Lower eq position (Left shift)
      
      // 2. Pressure Effect
      // Increase P -> Shifts to side with fewer moles (Right) -> More N2O4 (Colorless)
      // Decrease P -> Shifts to side with more moles (Left) -> More NO2 (Brown)
      // Normalizing P: 0.5 to 5 atm.
      const pressureFactor = Math.log(pressure); 

      // Combine factors
      // Base eq at 25C, 1atm is roughly mixed.
      // EqPos: 0 = All NO2, 1 = All N2O4
      let newPos = 0.5 - (tempFactor * 0.8) + (pressureFactor * 0.3);
      newPos = Math.max(0.05, Math.min(0.95, newPos));
      
      setEquilibriumPos(newPos);
  }, [temp, pressure]);

  // Visual color: 
  // High NO2 (Pos -> 0) = Dark Brown
  // High N2O4 (Pos -> 1) = Pale/Colorless
  const getColor = () => {
      // Brown is roughly rgb(139, 69, 19)
      // Colorless/Pale Yellow roughly rgb(255, 255, 240) or transparent
      
      // We interpolate opacity of a brown layer.
      // Pos 0 = 1.0 Opacity
      // Pos 1 = 0.1 Opacity
      const opacity = 1 - (equilibriumPos * 0.9);
      return `rgba(139, 69, 19, ${opacity})`;
  };

  const handleReset = () => {
      setTemp(25);
      setPressure(1);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        reaction: "2NO2 (Brown) <=> N2O4 (Colorless) + Heat",
        conditions: { temperature: `${temp}°C`, pressure: `${pressure} atm` },
        equilibriumShift: equilibriumPos > 0.6 ? "Right (Towards N2O4)" : equilibriumPos < 0.4 ? "Left (Towards NO2)" : "Balanced",
        colorObserved: equilibriumPos > 0.6 ? "Pale/Colorless" : "Dark Brown",
        principle: "Le Chatelier's Principle"
    };
    const text = await explainConcept("Chemical Equilibrium Shift", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Scale className="text-teal-400"/> Equilibrium
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="bg-slate-900/50 p-3 rounded border border-slate-600 text-sm font-mono text-center">
                <span className="text-amber-600 font-bold">2NO₂</span> 
                <span className="mx-2 text-slate-400">⇌</span> 
                <span className="text-slate-200">N₂O₄</span> 
                <span className="text-red-400 text-xs ml-2">+ Heat</span>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="flex justify-between text-sm text-slate-300 mb-1">
                        <span>Temperature</span>
                        <span className={temp > 50 ? 'text-red-400' : 'text-blue-400'}>{temp}°C</span>
                    </label>
                    <input 
                        type="range" min="0" max="100" step="5"
                        value={temp} onChange={e => setTemp(Number(e.target.value))} 
                        className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-sm text-slate-300 mb-1">
                        <span>Pressure</span>
                        <span className="text-emerald-400">{pressure} atm</span>
                    </label>
                    <input 
                        type="range" min="0.5" max="5" step="0.5"
                        value={pressure} onChange={e => setPressure(Number(e.target.value))} 
                        className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg"
                    />
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-600">
                    <div className="flex justify-between items-center mb-2 text-xs uppercase font-bold text-slate-500">
                        <span>Reactants (Brown)</span>
                        <span>Products (Clear)</span>
                    </div>
                    <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-amber-600 transition-all duration-500" style={{ width: `${(1-equilibriumPos)*100}%` }}></div>
                        <div className="absolute top-0 right-0 h-full bg-slate-200 transition-all duration-500" style={{ width: `${equilibriumPos*100}%` }}></div>
                    </div>
                    <div className="text-center mt-2 font-bold text-white">
                        {equilibriumPos < 0.4 ? "Favors Left (NO₂)" : equilibriumPos > 0.6 ? "Favors Right (N₂O₄)" : "Balanced Mix"}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Predict Shift"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-10 relative overflow-hidden">
            {/* Gas Container */}
            <div className="relative w-64 h-80 border-4 border-slate-500 bg-white/5 rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-500 shadow-2xl">
                 
                 {/* Gas Content Layer */}
                 <div className="absolute inset-0 transition-colors duration-700 ease-in-out z-0" style={{ backgroundColor: getColor() }}></div>

                 {/* Pressure Piston Visual */}
                 <div className="absolute top-0 left-0 w-full bg-slate-600 border-b-4 border-slate-400 transition-all duration-500 z-10 shadow-lg" style={{ height: `${Math.min(60, (pressure/5)*100)}px` }}>
                      <div className="absolute bottom-2 w-full text-center text-[10px] font-bold text-slate-300">PISTON</div>
                 </div>

                 {/* Particles */}
                 <div className="absolute inset-0 z-0 overflow-hidden">
                     {[...Array(30)].map((_, i) => {
                         // NO2 particles (Brown, single) vs N2O4 (Paired/Larger, clear-ish)
                         // We visualize mostly NO2 particles to show concentration
                         const isNO2 = Math.random() > equilibriumPos;
                         return (
                             <div 
                                key={i} 
                                className={`absolute rounded-full animate-float transition-all duration-500 ${isNO2 ? 'w-3 h-3 bg-amber-700 opacity-80' : 'w-5 h-5 bg-slate-200 opacity-20 border border-slate-400'}`}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDuration: `${3 + Math.random() * 5}s`
                                }}
                             ></div>
                         )
                     })}
                 </div>

                 {/* Temperature Indicator */}
                 <div className="absolute bottom-4 right-4 z-20">
                     <div className="flex items-end gap-1">
                         <div className={`w-2 rounded-t transition-all duration-300 ${temp > 50 ? 'bg-red-500' : 'bg-blue-400'}`} style={{ height: `${Math.max(10, temp)}px` }}></div>
                         <Thermometer size={24} className="text-slate-400"/>
                     </div>
                 </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-700"></div>
                    <span className="text-sm text-slate-300">NO₂ (Brown)</span>
                </div>
                <div className="flex items-center gap-2">
                     <div className="flex items-center">
                         <ArrowRight size={16} className="text-slate-500"/>
                         <ArrowLeft size={16} className="text-slate-500 -ml-2"/>
                     </div>
                     <span className="text-xs text-slate-500 italic">Dynamic Equilibrium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-400"></div>
                    <span className="text-sm text-slate-300">N₂O₄ (Colorless)</span>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes float {
                0% { transform: translate(0,0); }
                25% { transform: translate(10px, -10px); }
                50% { transform: translate(-5px, 15px); }
                75% { transform: translate(-15px, -5px); }
                100% { transform: translate(0,0); }
            }
            .animate-float { animation: float infinite linear alternate; }
        `}</style>
    </div>
  );
};

export default EquilibriumLab;

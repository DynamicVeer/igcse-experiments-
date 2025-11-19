
import React, { useState } from 'react';
import { FlaskConical, Brain, Droplets, RotateCcw } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const TitrationLab: React.FC = () => {
  const [volumeAdded, setVolumeAdded] = useState(0);
  const [analyteVolume, setAnalyteVolume] = useState(25); // mL of Acid
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'methyl_orange'>('phenolphthalein');
  
  // Simulation Logic: Strong Acid (HCl) vs Strong Base (NaOH)
  // Equivalence point at 25mL if concentrations are equal (1M)
  const equivalencePoint = 25; 
  
  // Simplified pH calculation for visual
  const calculatePH = (v: number) => {
      if (v < equivalencePoint) {
          // Acidic region
          return 1 + (v / equivalencePoint) * 3; // Slowly rises to 4
      } else if (Math.abs(v - equivalencePoint) < 0.5) {
          return 7; // Neutral
      } else {
          // Basic region
          return 10 + ((v - equivalencePoint) / 25) * 3; // Rises to 13
      }
  };

  const ph = calculatePH(volumeAdded);

  const getColor = () => {
      if (indicator === 'phenolphthalein') {
          if (ph < 8.2) return 'bg-slate-100/90'; // Clear
          return 'bg-pink-500/80'; // Pink
      } else {
          // Methyl Orange
          if (ph < 3.1) return 'bg-red-500/80';
          if (ph > 4.4) return 'bg-yellow-400/80';
          return 'bg-orange-400/80';
      }
  };

  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
      setLoading(true);
      const result = await explainConcept("Acid-Base Titration", {
          volumeAdded: `${volumeAdded}mL`,
          phLevel: ph.toFixed(1),
          indicator: indicator,
          colorObserved: ph < 7 ? "Acid Color" : "Base Color"
      });
      setExplanation(result || "Error getting explanation.");
      setLoading(false);
  };

  const handleReset = () => {
      setVolumeAdded(0);
      setIndicator('phenolphthalein');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <FlaskConical className="text-purple-400" /> Titration Lab
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Lab">
                   <RotateCcw size={16} />
               </button>
           </div>
           <p className="text-slate-400 text-sm">Neutralize 25mL of 1.0M HCl with 1.0M NaOH.</p>

           <div className="space-y-4">
               <div>
                   <label className="text-xs font-bold text-slate-300">Indicator</label>
                   <select 
                      value={indicator} 
                      onChange={(e) => setIndicator(e.target.value as any)}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white mt-1"
                   >
                       <option value="phenolphthalein">Phenolphthalein</option>
                       <option value="methyl_orange">Methyl Orange</option>
                   </select>
               </div>

               <div>
                   <label className="text-xs font-bold text-slate-300">Volume NaOH Added (mL)</label>
                   <input 
                     type="range" min="0" max="50" step="0.1" 
                     value={volumeAdded} 
                     onChange={(e) => setVolumeAdded(Number(e.target.value))} 
                     className="w-full accent-purple-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"
                   />
                   <div className="flex justify-between text-xs text-slate-500 mt-1">
                       <span>0 mL</span>
                       <span className="font-bold text-white text-lg">{volumeAdded.toFixed(1)} mL</span>
                       <span>50 mL</span>
                   </div>
               </div>
               
               <div className="bg-slate-900 p-4 rounded border border-slate-600 text-center">
                   <div className="text-sm text-slate-400">Estimated pH</div>
                   <div className="text-3xl font-mono font-bold text-emerald-400">{ph.toFixed(2)}</div>
               </div>
           </div>

           <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Reaction"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                        {explanation}
                    </div>
                )}
            </div>
       </div>

       <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative p-8">
           <div className="relative w-64 h-96 flex flex-col items-center">
               {/* Burette */}
               <div className="w-4 h-48 bg-slate-700/30 border border-slate-500 rounded-b-sm relative overflow-hidden mb-1">
                   <div 
                      className="absolute top-0 left-0 w-full bg-slate-200/80 transition-all duration-300"
                      style={{ height: `${100 - (volumeAdded/50)*100}%` }}
                   ></div>
                   {/* Graduations */}
                   <div className="absolute inset-0 flex flex-col justify-between py-2 opacity-50 pointer-events-none">
                        {[...Array(10)].map((_, i) => <div key={i} className="w-2 h-px bg-slate-400 self-end"></div>)}
                   </div>
               </div>
               
               {/* Tap */}
               <div className="w-1 h-4 bg-slate-500 mb-1"></div>
               
               {/* Drops */}
               {volumeAdded > 0 && volumeAdded < 50 && (
                   <div className="absolute top-[200px] animate-drip text-slate-200">
                       <Droplets size={12} fill="currentColor"/>
                   </div>
               )}

               {/* Flask */}
               <div className="relative mt-2">
                   <div className={`w-32 h-32 rounded-full border-4 border-slate-200/20 ${getColor()} transition-colors duration-1000 flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>
                       <div className="absolute -top-8 w-8 h-12 border-l-4 border-r-4 border-slate-200/20 bg-transparent"></div>
                       <span className="text-slate-900/50 font-bold">{ph < 7 ? 'Acid' : ph > 7 ? 'Base' : 'Neutral'}</span>
                   </div>
                   {/* Reaction Bubbles/Motion */}
                   <div className="absolute inset-0 overflow-hidden rounded-full opacity-30">
                        <div className="w-full h-full animate-swirl bg-gradient-to-tr from-transparent to-white/20"></div>
                   </div>
               </div>
           </div>
       </div>
       <style>{`
          @keyframes drip {
              0% { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(40px); opacity: 0; }
          }
          .animate-drip { animation: drip 0.8s infinite linear; }
          @keyframes swirl {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          .animate-swirl { animation: swirl 5s infinite linear; }
       `}</style>
    </div>
  );
};

export default TitrationLab;

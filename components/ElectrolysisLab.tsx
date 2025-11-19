
import React, { useState, useEffect } from 'react';
import { Zap, Battery, ArrowRight, Brain, RotateCcw, Beaker } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

type ElectrolyteType = 'molten_pbbr2' | 'aq_nacl' | 'aq_cuso4';

const ElectrolysisLab: React.FC = () => {
  const [type, setType] = useState<ElectrolyteType>('molten_pbbr2');
  const [powerOn, setPowerOn] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const config = {
      molten_pbbr2: {
          name: 'Molten Lead(II) Bromide',
          ions: [
              { symbol: 'Pb²⁺', charge: 2, color: 'bg-slate-300 text-slate-900', type: 'cation' },
              { symbol: 'Br⁻', charge: -1, color: 'bg-amber-700 text-white', type: 'anion' }
          ],
          products: { anode: 'Bromine Gas (Brown)', cathode: 'Lead Metal (Grey)' },
          liquidColor: 'bg-amber-600/30',
          electrodes: 'Carbon (Inert)'
      },
      aq_nacl: {
          name: 'Conc. Aqueous NaCl',
          ions: [
              { symbol: 'Na⁺', charge: 1, color: 'bg-white text-slate-900', type: 'cation' },
              { symbol: 'Cl⁻', charge: -1, color: 'bg-green-100 text-slate-900', type: 'anion' },
              { symbol: 'H⁺', charge: 1, color: 'bg-rose-100 text-rose-900', type: 'cation' },
              { symbol: 'OH⁻', charge: -1, color: 'bg-blue-100 text-blue-900', type: 'anion' }
          ],
          products: { anode: 'Chlorine Gas (Green)', cathode: 'Hydrogen Gas (Colorless)' },
          liquidColor: 'bg-blue-200/20',
          electrodes: 'Carbon (Inert)'
      },
      aq_cuso4: {
          name: 'Aqueous Copper(II) Sulfate',
          ions: [
              { symbol: 'Cu²⁺', charge: 2, color: 'bg-blue-500 text-white', type: 'cation' },
              { symbol: 'SO₄²⁻', charge: -2, color: 'bg-yellow-100 text-slate-900', type: 'anion' },
              { symbol: 'H⁺', charge: 1, color: 'bg-rose-100 text-rose-900', type: 'cation' },
              { symbol: 'OH⁻', charge: -1, color: 'bg-blue-100 text-blue-900', type: 'anion' }
          ],
          products: { anode: 'Oxygen Gas', cathode: 'Copper Metal (Pink)' },
          liquidColor: 'bg-blue-500/30',
          electrodes: 'Carbon (Inert)'
      }
  };

  const currentConfig = config[type];

  const handleExplain = async () => {
      setLoading(true);
      const data = {
          electrolyte: currentConfig.name,
          ionsPresent: currentConfig.ions.map(i => i.symbol).join(', '),
          cathodeReaction: `Reduction (Gain e-): ${currentConfig.products.cathode}`,
          anodeReaction: `Oxidation (Loss e-): ${currentConfig.products.anode}`,
          rule: "Less reactive cation discharges. Halide > OH- > Others at anode (usually)."
      };
      const text = await explainConcept("Electrolysis Product Prediction", data);
      setExplanation(text || "Error connecting to AI.");
      setLoading(false);
  };

  const handleReset = () => {
      setPowerOn(false);
      setExplanation("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Zap className="text-yellow-400"/> Electrolysis
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RotateCcw size={16} />
               </button>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="text-xs font-bold text-slate-300 uppercase">Electrolyte</label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                        <button onClick={() => {setType('molten_pbbr2'); setPowerOn(false);}} className={`p-3 rounded text-left border text-sm transition-all ${type === 'molten_pbbr2' ? 'bg-slate-700 border-yellow-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                            Molten Lead(II) Bromide (PbBr₂)
                        </button>
                        <button onClick={() => {setType('aq_nacl'); setPowerOn(false);}} className={`p-3 rounded text-left border text-sm transition-all ${type === 'aq_nacl' ? 'bg-slate-700 border-yellow-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                            Conc. Aqueous NaCl (Brine)
                        </button>
                        <button onClick={() => {setType('aq_cuso4'); setPowerOn(false);}} className={`p-3 rounded text-left border text-sm transition-all ${type === 'aq_cuso4' ? 'bg-slate-700 border-yellow-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                            Aqueous Copper(II) Sulfate
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-600">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">Predicted Products</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-red-400 font-bold mb-1">Anode (+)</div>
                            <div className="text-sm text-slate-200">{currentConfig.products.anode}</div>
                        </div>
                        <div>
                            <div className="text-xs text-blue-400 font-bold mb-1">Cathode (-)</div>
                            <div className="text-sm text-slate-200">{currentConfig.products.cathode}</div>
                        </div>
                    </div>
                </div>

                <button 
                   onClick={() => setPowerOn(!powerOn)}
                   className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                       powerOn ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                   } text-white`}
               >
                   <Battery size={18}/> {powerOn ? 'Turn Power OFF' : 'Turn Power ON'}
               </button>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Discharge"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden p-8">
             {/* Electrolytic Cell Visual */}
             <div className="relative w-80 h-96 flex flex-col items-center">
                 
                 {/* Power Supply */}
                 <div className="w-32 h-12 bg-slate-800 rounded-lg border border-slate-600 flex justify-between items-center px-4 mb-2 relative z-20 shadow-lg">
                     <div className="text-red-500 font-bold text-xl">+</div>
                     <div className={`w-2 h-2 rounded-full ${powerOn ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-900'}`}></div>
                     <div className="text-blue-500 font-bold text-xl">-</div>
                 </div>

                 {/* Wires */}
                 <div className="w-48 h-8 flex justify-between relative -mt-2 z-10">
                     <div className="w-1 h-full bg-red-500"></div>
                     <div className="w-1 h-full bg-blue-500"></div>
                 </div>

                 {/* Beaker */}
                 <div className="w-64 h-72 border-x-4 border-b-4 border-slate-500/50 bg-slate-900/30 rounded-b-3xl backdrop-blur-sm relative overflow-hidden">
                     
                     {/* Electrodes */}
                     <div className="absolute top-0 left-8 w-6 h-48 bg-neutral-700 border border-neutral-600 rounded-b-md flex flex-col items-center justify-end pb-2">
                         <span className="text-[10px] font-bold text-white rotate-90 whitespace-nowrap">Anode (+)</span>
                         {powerOn && (
                             <div className="absolute inset-0 flex justify-center items-end pb-4 opacity-50">
                                 <div className="w-full h-full bg-red-500/10 animate-pulse"></div>
                             </div>
                         )}
                     </div>
                     <div className="absolute top-0 right-8 w-6 h-48 bg-neutral-700 border border-neutral-600 rounded-b-md flex flex-col items-center justify-end pb-2">
                         <span className="text-[10px] font-bold text-white -rotate-90 whitespace-nowrap">Cathode (-)</span>
                         {powerOn && (
                             <div className="absolute inset-0 flex justify-center items-end pb-4 opacity-50">
                                 <div className="w-full h-full bg-blue-500/10 animate-pulse"></div>
                             </div>
                         )}
                     </div>

                     {/* Electrolyte */}
                     <div className={`absolute bottom-0 w-full h-56 ${currentConfig.liquidColor} transition-colors duration-500 flex items-center justify-center overflow-hidden`}>
                         
                         {/* Ions Animation */}
                         {powerOn && [...Array(12)].map((_, i) => {
                             // Randomly pick a cation or anion
                             const ionType = i % 2 === 0 ? 'cation' : 'anion';
                             const ionData = currentConfig.ions.find(ion => ion.type === ionType) || currentConfig.ions[0];
                             
                             // Target X: Anode (Left ~30px) or Cathode (Right ~220px)
                             // Anions (-) go to Anode (+)
                             // Cations (+) go to Cathode (-)
                             const targetX = ionType === 'anion' ? '10%' : '90%';

                             return (
                                 <div 
                                    key={i}
                                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${ionData.color} animate-migrate`}
                                    style={{
                                        top: `${Math.random() * 80 + 10}%`,
                                        left: '50%', // Start center
                                        '--target-x': targetX,
                                        animationDuration: `${2 + Math.random() * 2}s`,
                                        animationDelay: `${Math.random()}s`
                                    } as React.CSSProperties}
                                 >
                                     {ionData.symbol}
                                 </div>
                             );
                         })}
                         
                         {/* Static Ions (When power off) */}
                         {!powerOn && [...Array(8)].map((_, i) => {
                             const ionData = currentConfig.ions[i % currentConfig.ions.length];
                             return (
                                 <div 
                                    key={i}
                                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm opacity-70 ${ionData.color}`}
                                    style={{
                                        top: `${Math.random() * 80 + 10}%`,
                                        left: `${Math.random() * 80 + 10}%`,
                                    }}
                                 >
                                     {ionData.symbol}
                                 </div>
                             );
                         })}

                     </div>

                     {/* Bubbles / Product Visuals */}
                     {powerOn && (
                         <>
                            {/* Anode Bubbles */}
                            <div className="absolute top-20 left-8 w-6 h-full overflow-hidden">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`absolute left-1 w-3 h-3 rounded-full animate-bubble-up ${type === 'molten_pbbr2' ? 'bg-amber-700' : type === 'aq_nacl' ? 'bg-green-400' : 'bg-white'}`} style={{ animationDelay: `${i*0.5}s` }}></div>
                                ))}
                            </div>
                             {/* Cathode Bubbles or Plating */}
                             {type === 'molten_pbbr2' || type === 'aq_cuso4' ? (
                                 // Plating Effect (Layer grows on cathode)
                                 <div className={`absolute top-32 right-8 w-7 h-16 rounded border-l-2 border-white/20 ${type === 'aq_cuso4' ? 'bg-pink-400' : 'bg-gray-400'} opacity-80 animate-pulse`}></div>
                             ) : (
                                 // Bubbles (H2)
                                <div className="absolute top-20 right-8 w-6 h-full overflow-hidden">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="absolute left-1 w-3 h-3 rounded-full bg-white animate-bubble-up" style={{ animationDelay: `${i*0.5}s` }}></div>
                                    ))}
                                </div>
                             )}
                         </>
                     )}
                 </div>
             </div>
        </div>
        <style>{`
            @keyframes migrate {
                0% { left: 50%; opacity: 0; transform: scale(0.5); }
                20% { opacity: 1; transform: scale(1); }
                90% { left: var(--target-x); opacity: 1; transform: scale(1); }
                100% { left: var(--target-x); opacity: 0; transform: scale(0); }
            }
            .animate-migrate {
                animation: migrate infinite linear;
                animation-fill-mode: forwards;
            }
             @keyframes bubble-up {
                0% { bottom: 0; opacity: 0; }
                50% { opacity: 1; }
                100% { bottom: 80%; opacity: 0; }
            }
            .animate-bubble-up { animation: bubble-up 2s infinite linear; }
        `}</style>
    </div>
  );
};

export default ElectrolysisLab;

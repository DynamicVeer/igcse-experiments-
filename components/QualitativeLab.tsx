
import React, { useState } from 'react';
import { TestTube, Beaker, Droplets, Brain, Check, RefreshCw } from 'lucide-react';
import { ION_TESTS } from '../constants';
import { explainConcept } from '../services/geminiService';

const IONS = ['Cu2+', 'Fe2+', 'Fe3+', 'Cl-', 'Br-', 'I-', 'SO42-', 'CO32-'];
const REAGENTS = ['NaOH', 'NH3', 'AgNO3', 'BaCl2', 'Acid'];

const QualitativeLab: React.FC = () => {
  const [selectedIon, setSelectedIon] = useState<string | null>(null);
  const [selectedReagent, setSelectedReagent] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'pouring' | 'reacting' | 'done'>('idle');
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setSelectedIon(null);
    setSelectedReagent(null);
    setResult(null);
    setAnimationState('idle');
    setExplanation("");
  };

  const handleTest = () => {
    if (!selectedIon || !selectedReagent) return;
    
    setAnimationState('pouring');
    
    setTimeout(() => {
        setAnimationState('reacting');
        const possibleResults = ION_TESTS[selectedIon];
        const match = possibleResults?.find(r => r.reagent === selectedReagent);
        
        setTimeout(() => {
             setResult(match || { observation: "No visible reaction.", precipitateColor: "bg-transparent" });
             setAnimationState('done');
        }, 1000);
    }, 1000);
  };

  const handleExplain = async () => {
      if (!result) return;
      setLoading(true);
      const resultData = {
          ion: selectedIon,
          reagent: selectedReagent,
          observation: result.observation
      };
      const text = await explainConcept("Qualitative Analysis Test", resultData);
      setExplanation(text || "No explanation.");
      setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col h-full">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TestTube className="text-emerald-400" /> Ion Tests
            </h3>
            <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Lab">
                <RefreshCw size={16} />
            </button>
         </div>

         <div className="space-y-6 flex-1">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">1. Select Unknown Ion</label>
                <div className="grid grid-cols-4 gap-2">
                    {IONS.map(ion => (
                        <button 
                            key={ion}
                            onClick={() => { setSelectedIon(ion); setResult(null); setAnimationState('idle'); }}
                            disabled={animationState !== 'idle'}
                            className={`p-2 rounded border text-sm font-mono transition-colors ${
                                selectedIon === ion 
                                ? 'bg-emerald-600 text-white border-emerald-500' 
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {convertFormula(ion)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">2. Select Reagent</label>
                <div className="grid grid-cols-3 gap-2">
                    {REAGENTS.map(r => (
                        <button 
                            key={r}
                            onClick={() => { setSelectedReagent(r); setResult(null); setAnimationState('idle'); }}
                            disabled={!selectedIon || animationState !== 'idle'}
                            className={`p-2 rounded border text-sm transition-colors ${
                                selectedReagent === r 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleTest}
                disabled={!selectedIon || !selectedReagent || animationState !== 'idle'}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 transition-all"
            >
                Perform Test
            </button>

            {result && (
                <div className="animate-fade-in space-y-4 pt-4 border-t border-slate-700">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
                        <h4 className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-2">
                            <Check size={14} /> Result
                        </h4>
                        <p className="text-slate-200">{result.observation}</p>
                    </div>
                    
                    <button 
                        onClick={handleExplain}
                        disabled={loading}
                        className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                    >
                        <Brain size={16} /> {loading ? "Thinking..." : "Explain Reaction"}
                    </button>
                     {explanation && (
                        <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                            {explanation}
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
          {/* Lab Visuals */}
          <div className="relative w-full h-full flex items-end justify-center pb-20">
              
              {/* Pipette (Animated) */}
              <div className={`absolute top-20 left-1/2 -translate-x-1/2 transition-all duration-1000 z-20 ${
                  animationState === 'pouring' ? 'translate-y-10 rotate-[-10deg]' : '-translate-y-40'
              }`}>
                  <div className="w-4 h-32 bg-slate-200/20 border border-slate-400 rounded-full relative backdrop-blur-sm">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 bg-slate-300"></div>
                  </div>
                  {animationState === 'pouring' && (
                      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-drop"></div>
                  )}
              </div>

              {/* Beaker / Test Tube */}
              <div className="relative">
                   <div className="w-24 h-40 border-b-4 border-l-4 border-r-4 border-slate-500/30 bg-slate-800/30 rounded-b-xl backdrop-blur-sm relative overflow-hidden">
                        {/* Liquid Content */}
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-blue-100/10 transition-all duration-1000"></div>
                        
                        {/* Reaction Precipitate Layer */}
                        {result && result.precipitateColor && (
                            <div className={`absolute bottom-0 left-0 w-full h-full transition-all duration-2000 ease-out ${
                                animationState === 'done' ? 'opacity-100' : 'opacity-0'
                            } flex items-end justify-center`}>
                                {/* Cloud/Precipitate Effect */}
                                <div className={`w-full h-20 ${result.precipitateColor} blur-md opacity-80 mix-blend-screen animate-swirl-slow`}></div>
                                {result.gasEvolved && (
                                    <div className="absolute bottom-0 w-full h-full flex justify-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bubble-up delay-100"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bubble-up delay-300"></div>
                                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-bubble-up delay-500"></div>
                                    </div>
                                )}
                            </div>
                        )}
                   </div>
                   {/* Reflection */}
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 to-transparent pointer-events-none rounded-b-xl"></div>
              </div>

              {/* Reagent Bottle (Side) */}
              {selectedReagent && (
                  <div className="absolute bottom-20 right-20 transition-all duration-500 animate-fade-in">
                      <div className="w-16 h-24 bg-amber-900/40 border border-amber-800 rounded-lg relative flex items-center justify-center">
                          <div className="bg-white px-2 py-1 text-xs font-bold text-black shadow-sm rotate-[-5deg]">
                              {selectedReagent}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      
      <style>{`
         @keyframes drop {
             0% { transform: translateY(0); opacity: 1; }
             100% { transform: translateY(100px); opacity: 0; }
         }
         .animate-drop { animation: drop 0.5s infinite linear; }
         
         @keyframes bubble-up {
             0% { transform: translateY(0); opacity: 0; }
             50% { opacity: 1; }
             100% { transform: translateY(-100px); opacity: 0; }
         }
         .animate-bubble-up { animation: bubble-up 2s infinite ease-in; }

         @keyframes swirl-slow {
             0% { transform: scale(1); }
             50% { transform: scale(1.05) skewX(2deg); }
             100% { transform: scale(1); }
         }
         .animate-swirl-slow { animation: swirl-slow 4s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

// Helper to render subscript numbers
const convertFormula = (f: string) => {
    return f.split(/(\d+)/).map((part, i) => 
        !isNaN(parseInt(part)) ? <sub key={i} className="text-[10px]">{part}</sub> : part
    );
};

export default QualitativeLab;

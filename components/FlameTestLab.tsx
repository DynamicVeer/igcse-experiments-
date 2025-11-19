
import React, { useState, useEffect } from 'react';
import { Flame, Brain, Info, Droplets, RefreshCcw, AlertTriangle } from 'lucide-react';
import { FLAME_TEST_IONS } from '../constants';
import { explainConcept } from '../services/geminiService';

const FlameTestLab: React.FC = () => {
  const [selectedIon, setSelectedIon] = useState<string | null>(null);
  const [step, setStep] = useState<'start' | 'cleaning' | 'cleaned' | 'dipped' | 'burning'>('start');
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const activeIon = FLAME_TEST_IONS.find(i => i.id === selectedIon);

  const handleCleanWire = () => {
    setStep('cleaning');
    setTimeout(() => {
        setStep('cleaned');
    }, 1500);
  };

  const handleDipWire = (ionId: string) => {
      if (step !== 'cleaned') return; // Must clean first
      setSelectedIon(ionId);
      setStep('dipped');
  };

  const handleBurn = () => {
      if (step !== 'dipped') return;
      setStep('burning');
  };

  const handleReset = () => {
      setStep('start');
      setSelectedIon(null);
      setExplanation("");
  };

  const handleExplain = async () => {
    if (!activeIon) return;
    setLoading(true);
    const result = await explainConcept("Flame Test Physics", {
      ion: activeIon.name,
      electronConfiguration: "Excited State -> Ground State",
      observedColor: activeIon.colorName,
      energyTransition: "Emission of photons in visible spectrum"
    });
    setExplanation(result || "Error getting explanation.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="text-orange-500" /> Flame Tests
            </h3>
            <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Procedure">
                <RefreshCcw size={16} />
            </button>
        </div>
        
        <p className="text-slate-400 text-sm">
          Identify metal ions by the color they emit when heated. Follow the correct laboratory procedure.
        </p>

        <div className="space-y-4 flex-1">
            {/* Step 1: Clean Wire */}
            <div className={`p-4 rounded-lg border transition-all ${step === 'start' || step === 'cleaning' ? 'bg-slate-700 border-emerald-500 shadow-md' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span> 
                    Clean Nichrome Wire
                </h4>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-10 border-b-2 border-l-2 border-r-2 border-slate-400 rounded-b bg-yellow-100/10 flex items-end justify-center relative">
                         <span className="text-[8px] text-slate-400 absolute bottom-1">HCl</span>
                    </div>
                    <button 
                        onClick={handleCleanWire}
                        disabled={step !== 'start'}
                        className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded text-white disabled:opacity-50"
                    >
                        {step === 'cleaning' ? 'Cleaning...' : step === 'start' ? 'Dip in Conc. HCl' : 'Cleaned'}
                    </button>
                </div>
            </div>

            {/* Step 2: Select Ion */}
            <div className={`p-4 rounded-lg border transition-all ${step === 'cleaned' || step === 'dipped' ? 'bg-slate-700 border-emerald-500 shadow-md' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span> 
                    Select Metal Salt
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {FLAME_TEST_IONS.map(ion => (
                        <button
                            key={ion.id}
                            onClick={() => handleDipWire(ion.id)}
                            disabled={step !== 'cleaned'}
                            className={`p-2 rounded text-xs font-mono transition-colors ${
                                selectedIon === ion.id 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-900 border border-slate-600 hover:bg-slate-600 disabled:opacity-50'
                            }`}
                        >
                            {ion.formula}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 3: Burn */}
            <div className={`p-4 rounded-lg border transition-all ${step === 'dipped' || step === 'burning' ? 'bg-slate-700 border-emerald-500 shadow-md' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span> 
                    Place in Flame
                </h4>
                <button 
                    onClick={handleBurn}
                    disabled={step !== 'dipped'}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2"
                >
                    <Flame size={14} /> {step === 'burning' ? 'Observing...' : 'Insert into Flame'}
                </button>
            </div>
        </div>

        {step === 'burning' && activeIon && (
          <div className="animate-fade-in pt-4 border-t border-slate-700">
             <div className="bg-slate-900 p-3 rounded mb-3 border border-slate-700 flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${activeIon.colorClass.split(' ')[0]}`}></div>
                <div>
                  <div className="text-slate-200 font-bold text-sm">{activeIon.name} ({activeIon.formula})</div>
                  <div className="text-slate-400 text-xs">{activeIon.colorName} Flame</div>
                </div>
             </div>

             <button 
                onClick={handleExplain}
                disabled={loading}
                className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
             >
                <Brain size={16} /> {loading ? "Thinking..." : "Why this color?"}
             </button>
             {explanation && (
                 <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                     {explanation}
                 </div>
             )}
          </div>
        )}
      </div>

      <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative p-8 overflow-hidden">
          {/* Lab Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950"></div>

          {/* Wire Animation Container */}
          <div className="absolute inset-0 pointer-events-none z-30">
               {/* Wire */}
               <div className={`absolute top-1/2 left-1/2 w-64 h-1 bg-gray-400 origin-left transition-all duration-1000 ease-in-out ${
                   step === 'cleaning' ? 'rotate-[45deg] translate-x-[-200px] translate-y-[100px]' :
                   step === 'cleaned' ? 'rotate-0 translate-x-[-250px]' :
                   step === 'dipped' ? 'rotate-0 translate-x-[-200px]' :
                   step === 'burning' ? 'rotate-0 translate-x-[-100px]' : 'rotate-[-45deg] translate-x-[-300px] translate-y-[200px]'
               }`}>
                   <div className="absolute right-0 top-[-2px] w-4 h-4 rounded-full bg-gray-300 border border-gray-500"></div> {/* Loop */}
                   {/* Sample on Loop */}
                   {(step === 'dipped' || step === 'burning') && (
                       <div className="absolute right-0 top-[-1px] w-3 h-3 rounded-full bg-white opacity-80"></div>
                   )}
               </div>
          </div>

          {/* Bunsen Burner */}
          <div className="relative flex flex-col items-center mt-40">
             {/* Flame */}
             <div className="relative w-24 h-56 flex justify-center items-end mb-2">
                 {/* Roaring Blue Flame Base */}
                 <div className="w-6 h-20 bg-blue-600/80 rounded-full blur-sm absolute bottom-0 z-10 animate-pulse"></div>
                 <div className="w-4 h-12 bg-blue-300/50 rounded-full blur-md absolute bottom-2 z-20"></div>
                 
                 {/* Colored Flame Overlay */}
                 {step === 'burning' && activeIon && (
                   <div className={`w-20 h-48 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] blur-md transition-all duration-300 animate-flicker ${activeIon.colorClass} opacity-90 relative z-30`}></div>
                 )}
             </div>

             {/* Burner Body */}
             <div className="w-10 h-28 bg-gradient-to-r from-slate-600 to-slate-500 rounded-t-sm relative z-20 border-x border-slate-700">
                 {/* Air hole open for roaring flame */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600"></div>
             </div>
             {/* Base */}
             <div className="w-32 h-6 bg-slate-700 rounded-lg shadow-xl z-20 border-t border-slate-600"></div>
          </div>

          {/* Acid Bath (Visual for Step 1) */}
          <div className={`absolute bottom-10 left-10 transition-all duration-500 ${step === 'cleaning' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}>
               <div className="w-20 h-24 border-b-4 border-l-4 border-r-4 border-slate-500/50 bg-slate-800/40 backdrop-blur rounded-b-lg relative overflow-hidden">
                   <div className="absolute bottom-0 w-full h-16 bg-yellow-100/10"></div>
                   <span className="absolute bottom-2 w-full text-center text-[10px] text-slate-400">Conc. HCl</span>
               </div>
          </div>
          
          {/* Safety Note */}
          <div className="absolute top-4 left-4 bg-amber-900/20 border border-amber-700/50 p-2 rounded flex items-start gap-2 max-w-xs">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5"/>
              <p className="text-[10px] text-amber-200/80">
                  Safety: Use concentrated HCl in a fume cupboard. Wear eye protection. Platinum or Nichrome wire is used because it is unreactive and has a high melting point.
              </p>
          </div>

      </div>
      <style>{`
        @keyframes flicker {
          0% { transform: scale(1) skewX(0deg); opacity: 0.9; }
          25% { transform: scale(1.05) skewX(2deg); opacity: 0.8; }
          50% { transform: scale(0.95) skewX(-2deg); opacity: 1; }
          75% { transform: scale(1.02) skewX(1deg); opacity: 0.85; }
          100% { transform: scale(1) skewX(0deg); opacity: 0.9; }
        }
        .animate-flicker { animation: flicker 0.1s infinite alternate; }
      `}</style>
    </div>
  );
};

export default FlameTestLab;

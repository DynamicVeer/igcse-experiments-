
import React, { useState } from 'react';
import { CHEMICALS, KNOWN_REACTIONS } from '../constants';
import { Leaf, RefreshCcw, Check, Info, Brain, TestTube, Wind, FileText, Network } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';
import MoleculeStructure from './MoleculeStructure';

const OrganicLab: React.FC = () => {
  const [selectedOrganic, setSelectedOrganic] = useState<string | null>(null);
  const [selectedReagent, setSelectedReagent] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'reacting' | 'complete'>('idle');
  const [showMechanism, setShowMechanism] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const organicChems = CHEMICALS.filter(c => c.type === 'organic');
  
  const reagentIds = ['bromine_water', 'kmno4', 'nahco3', 'mg', 'ethanol', 'ethanoic_acid', 'sodium', 'naoh'];
  const reagents = CHEMICALS.filter(c => reagentIds.includes(c.id));

  const compound = CHEMICALS.find(c => c.id === selectedOrganic);
  const reagent = CHEMICALS.find(c => c.id === selectedReagent);

  const getReaction = () => {
    if (!selectedOrganic || !selectedReagent) return null;
    return KNOWN_REACTIONS.find(r => 
        r.reactants.length === 2 &&
        r.reactants.includes(selectedOrganic) && 
        r.reactants.includes(selectedReagent)
    );
  };

  const reaction = getReaction();
  const isGas = compound?.state === 'gas';

  const handleTest = () => {
      if (!selectedOrganic || !selectedReagent) return;
      setStatus('reacting');
      setExplanation("");
      setShowMechanism(false);
      setTimeout(() => {
          setStatus('complete');
      }, 2000);
  };

  const handleReset = () => {
      setSelectedOrganic(null);
      setSelectedReagent(null);
      setStatus('idle');
      setExplanation("");
      setShowMechanism(false);
  };

  const handleExplain = async () => {
      setLoading(true);
      const promptData = {
          organicCompound: compound?.name,
          reagent: reagent?.name,
          observation: reaction ? reaction.observation : "No observable reaction.",
          outcome: reaction ? "Reaction Occurred" : "No Reaction",
          structure: compound?.formula
      };
      
      const text = await explainConcept("Organic Chemistry Reaction Mechanism", promptData);
      setExplanation(text || "No explanation available.");
      setLoading(false);
  };

  const getFluidColor = () => {
      if (status === 'idle') return 'bg-transparent';
      if (status === 'reacting') return reagent?.color || 'bg-gray-200'; 
      if (reaction && reaction.visual.solutionColor) return reaction.visual.solutionColor;
      return reagent?.color || 'bg-transparent';
  };

  const hasSmell = reaction && reaction.observation.toLowerCase().includes('smell');

  const renderMechanism = () => {
       return <div className="text-slate-400 text-sm italic">Select mechanism to view details.</div>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       {/* Control Panel */}
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between shrink-0">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Leaf className="text-green-400"/> Organic Lab
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RefreshCcw size={16} />
               </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
               {/* Selection Controls */}
               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-300 uppercase">1. Select Organic Compound</label>
                   <div className="grid grid-cols-1 gap-2">
                       {organicChems.map(c => (
                           <button 
                              key={c.id}
                              onClick={() => { setSelectedOrganic(c.id); setStatus('idle'); }}
                              disabled={status !== 'idle'}
                              className={`w-full p-2 rounded-lg border text-left flex justify-between items-center transition-all ${
                                  selectedOrganic === c.id 
                                  ? 'bg-green-900/30 border-green-500 text-white' 
                                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                              }`}
                           >
                               <span className="font-bold text-sm">{c.name}</span>
                               <span className="text-xs font-mono opacity-70">{c.formula}</span>
                           </button>
                       ))}
                   </div>
               </div>

               <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-300 uppercase">2. Select Reagent</label>
                   <div className="grid grid-cols-1 gap-2">
                       {reagents
                        .filter(r => r.id !== selectedOrganic)
                        .map(r => (
                           <button 
                              key={r.id}
                              onClick={() => { setSelectedReagent(r.id); setStatus('idle'); }}
                              disabled={!selectedOrganic || status !== 'idle'}
                              className={`w-full p-2 rounded-lg border text-left flex justify-between items-center transition-all ${
                                  selectedReagent === r.id 
                                  ? 'bg-orange-900/30 border-orange-500 text-white' 
                                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                              }`}
                           >
                               <span className="font-bold text-sm">{r.name}</span>
                               <div className={`w-3 h-3 rounded-full ${r.color}`}></div>
                           </button>
                       ))}
                   </div>
               </div>
           </div>

           <button 
              onClick={handleTest}
              disabled={!selectedOrganic || !selectedReagent || status !== 'idle'}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-emerald-500 shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
           >
               <TestTube size={18} /> Perform Test
           </button>

           {status === 'complete' && (
               <div className="animate-fade-in space-y-4 border-t border-slate-700 pt-4 shrink-0">
                   <div className="bg-slate-900 p-4 rounded border border-slate-600">
                       <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                           <Check size={14} className="text-emerald-400"/> Observation
                       </h4>
                       <p className="text-slate-300 text-sm">
                           {reaction ? reaction.observation : `No observable reaction.`}
                       </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setShowMechanism(!showMechanism)}
                            disabled={!reaction}
                            className="w-full py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-600 disabled:opacity-50"
                        >
                            <Network size={16} /> Mechanism
                        </button>

                        <button 
                            onClick={handleExplain}
                            disabled={loading}
                            className="w-full py-2 bg-indigo-900/30 text-indigo-300 border border-indigo-600/50 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-900/50"
                        >
                            <Brain size={16} /> AI Explain
                        </button>
                   </div>
               </div>
           )}
       </div>

       {/* Visualization Area */}
       <div className="col-span-1 lg:col-span-2 grid grid-rows-1 gap-6">
           <div className="bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                
                {/* 3D Rotatable Wrapper */}
                <RotatableView className="w-full h-full flex flex-col items-center justify-center">
                    
                    {!showMechanism ? (
                        <>
                            {/* Molecule Structure View */}
                            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                    <FileText size={12}/> Structural Formula
                                </div>
                                {selectedOrganic ? (
                                    <div className="w-48 h-48 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center relative backdrop-blur-sm">
                                        <MoleculeStructure id={selectedOrganic} formula={compound?.formula} className="w-full h-full" />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-600">
                                        Select Compound
                                    </div>
                                )}
                            </div>

                            {/* Main Test Tube Visual */}
                            <div className="relative w-32 h-64 flex flex-col items-center justify-end mt-12 transform translate-z-[20px]">
                                <div className="w-full h-full border-b-4 border-l-4 border-r-4 border-slate-500/30 bg-slate-800/20 backdrop-blur-sm rounded-b-full relative overflow-hidden z-10 shadow-xl">
                                    <div 
                                        className={`absolute bottom-0 w-full transition-all duration-[2000ms] ease-in-out ${getFluidColor()}`}
                                        style={{ height: status === 'idle' ? '0%' : '60%' }}
                                    >
                                        {/* Bubbles */}
                                        {(isGas || (reaction && reaction.visual.bubbles)) && status === 'complete' && (
                                            <div className="w-full h-full absolute inset-0">
                                                {[...Array(8)].map((_, i) => (
                                                    <div key={i} className="absolute bg-white/30 rounded-full animate-bubble-up" style={{
                                                        width: Math.random() * 6 + 4 + 'px',
                                                        height: Math.random() * 6 + 4 + 'px',
                                                        left: Math.random() * 80 + 10 + '%',
                                                        animationDuration: Math.random() * 1 + 1 + 's',
                                                        animationDelay: Math.random() + 's'
                                                    }}></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-0 left-2 w-2 h-full bg-white/5 rounded-full blur-sm"></div>
                                </div>

                                {status === 'complete' && hasSmell && (
                                    <div className="absolute -top-10 animate-waft text-pink-300 opacity-70 flex flex-col items-center">
                                        <Wind size={32} />
                                        <span className="text-xs font-bold mt-1">Fruity Smell</span>
                                    </div>
                                )}

                                <div className={`absolute top-[-80px] left-1/2 -translate-x-1/2 transition-all duration-1000 z-20 ${status === 'reacting' ? 'translate-y-[100px]' : ''}`}>
                                    <div className="w-4 h-24 bg-slate-300/20 border border-slate-400 rounded-full relative backdrop-blur-md">
                                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 ${reagent?.color || 'bg-gray-400'}`}></div>
                                    </div>
                                    {status === 'reacting' && (
                                        <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${reagent?.color} animate-drop`}></div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-900 p-4">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Reaction Mechanism</h3>
                            {renderMechanism()}
                        </div>
                    )}
                </RotatableView>

                {explanation && !showMechanism && (
                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/90 backdrop-blur rounded text-sm text-slate-300 animate-fade-in border border-slate-700 max-h-32 overflow-y-auto custom-scrollbar z-30">
                        {explanation}
                    </div>
                )}
           </div>
       </div>
       
       <style>{`
            @keyframes bubble-up {
                0% { bottom: 0; opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; }
                100% { bottom: 100%; opacity: 0; transform: scale(1.2); }
            }
            .animate-bubble-up { animation: bubble-up infinite linear; }
            
            @keyframes drop {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(50px); opacity: 0; }
            }
            .animate-drop { animation: drop 0.6s infinite linear; }

            @keyframes waft {
                0% { transform: translateY(0) scale(0.8); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
            }
            .animate-waft { animation: waft 2s infinite ease-out; }
       `}</style>
    </div>
  );
};

export default OrganicLab;

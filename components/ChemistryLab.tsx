
import React, { useState } from 'react';
import { CHEMICALS, ORBITAL_TYPES } from '../constants';
import { Chemical, ReactionResult, ReactionRule } from '../types';
import { simulateReaction, getOrbitalDescription } from '../services/geminiService';
import { FlaskConical, Atom, Sparkles, Info, AlertTriangle, Droplets, Flame, TestTube, Settings2, RotateCcw, Leaf, Timer, Zap, Scale, Activity, X, Layers } from 'lucide-react';
import OrbitalVisualizer from './OrbitalVisualizer';
import TitrationLab from './TitrationLab';
import FlameTestLab from './FlameTestLab';
import QualitativeLab from './QualitativeLab';
import OrganicLab from './OrganicLab';
import BeakerSimulation from './BeakerSimulation';
import RatesLab from './RatesLab';
import ElectrolysisLab from './ElectrolysisLab';
import EquilibriumLab from './EquilibriumLab';
import EnergyProfileLab from './EnergyProfileLab';
import ChromatographyLab from './ChromatographyLab';
import ChemicalDetails from './ChemicalDetails';

interface Props {
    initialTab?: 'mix' | 'orbitals' | 'titration' | 'flame' | 'qualitative' | 'organic' | 'rates' | 'electrolysis' | 'equilibrium' | 'energy' | 'chromatography';
}

const ChemistryLab: React.FC<Props> = ({ initialTab }) => {
  const [selectedChemicals, setSelectedChemicals] = useState<Chemical[]>([]);
  const [aiResult, setAiResult] = useState<ReactionResult | null>(null);
  const [localRule, setLocalRule] = useState<ReactionRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'mix' | 'orbitals' | 'titration' | 'flame' | 'qualitative' | 'organic' | 'rates' | 'electrolysis' | 'equilibrium' | 'energy' | 'chromatography'>(initialTab || 'mix');
  
  const [viewingChemical, setViewingChemical] = useState<Chemical | null>(null);

  // Orbital State
  const [selectedOrbital, setSelectedOrbital] = useState(ORBITAL_TYPES[0]);
  const [orbitalDesc, setOrbitalDesc] = useState("");
  const [orbitalSpeed, setOrbitalSpeed] = useState(1);

  const handleChemicalSelect = (chem: Chemical) => {
    if (selectedChemicals.length < 5 && !selectedChemicals.find(c => c.id === chem.id)) {
      setSelectedChemicals([...selectedChemicals, chem]);
      setAiResult(null);
    }
  };

  const handleClear = () => {
    setSelectedChemicals([]);
    setAiResult(null);
    setLocalRule(null);
  };

  const handleOrbitalChange = async (orb: typeof ORBITAL_TYPES[0]) => {
      setSelectedOrbital(orb);
      const desc = await getOrbitalDescription(orb.n, orb.l);
      setOrbitalDesc(desc);
  }

  const handleAnalyzeAi = async () => {
    if (selectedChemicals.length < 2) return;
    setLoading(true);
    const result = await simulateReaction(selectedChemicals);
    setAiResult(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
        {/* Sub-nav for Chemistry tools */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4 overflow-x-auto custom-scrollbar">
            <button 
                onClick={() => setActiveTab('mix')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'mix' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <FlaskConical size={16} /> Reactions
            </button>
            <button 
                onClick={() => setActiveTab('chromatography')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'chromatography' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Layers size={16} /> Separation
            </button>
            <button 
                onClick={() => setActiveTab('rates')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'rates' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Timer size={16} /> Rates
            </button>
            <button 
                onClick={() => setActiveTab('equilibrium')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'equilibrium' ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Scale size={16} /> Equilibrium
            </button>
            <button 
                onClick={() => setActiveTab('energy')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'energy' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Activity size={16} /> Energy
            </button>
            <button 
                onClick={() => setActiveTab('electrolysis')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'electrolysis' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Zap size={16} /> Electrolysis
            </button>
            <button 
                onClick={() => setActiveTab('organic')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'organic' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Leaf size={16} /> Organic
            </button>
            <button 
                onClick={() => setActiveTab('titration')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'titration' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Droplets size={16} /> Titration
            </button>
             <button 
                onClick={() => setActiveTab('qualitative')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'qualitative' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <TestTube size={16} /> Ion Tests
            </button>
            <button 
                onClick={() => setActiveTab('flame')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'flame' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Flame size={16} /> Flame Tests
            </button>
            <button 
                onClick={() => setActiveTab('orbitals')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'orbitals' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Atom size={16} /> Orbitals
            </button>
        </div>

      {activeTab === 'mix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Chemical Shelf */}
          <div className="lg:col-span-4 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <FlaskConical size={20} className="text-emerald-500"/> Reagent Shelf
                </h3>
                <button onClick={handleClear} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Selection">
                    <RotateCcw size={16} />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-2 flex-1 custom-scrollbar">
              {CHEMICALS.filter(c => c.type !== 'organic').map(chem => (
                <div key={chem.id} className="flex gap-1">
                    <button
                        onClick={() => handleChemicalSelect(chem)}
                        disabled={selectedChemicals.some(c => c.id === chem.id) || selectedChemicals.length >= 5}
                        className={`flex-1 p-3 rounded-lg flex items-center justify-between group transition-all ${
                            selectedChemicals.some(c => c.id === chem.id) 
                            ? 'bg-emerald-900/30 border border-emerald-800 opacity-50 cursor-not-allowed'
                            : 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${chem.color} border shadow-sm flex items-center justify-center text-[10px] text-slate-900 font-bold`}>
                            {chem.state === 'solid' ? 'S' : 'L'}
                            </div>
                            <div className="text-left">
                            <div className="font-medium text-slate-200">{chem.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{chem.formula}</div>
                            </div>
                        </div>
                        {selectedChemicals.some(c => c.id === chem.id) && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setViewingChemical(chem)}
                        className="px-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                        <Info size={16} />
                    </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mixing Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Beaker Simulation */}
            <BeakerSimulation 
                chemicals={selectedChemicals} 
                onReactionFound={setLocalRule}
            />

            {/* Selected Chemicals Properties */}
            {selectedChemicals.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
                    {selectedChemicals.map(c => (
                        <div key={c.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg relative group hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setViewingChemical(c)}>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedChemicals(selectedChemicals.filter(x => x.id !== c.id)); }}
                                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Remove Chemical"
                            >
                                <X size={14}/>
                            </button>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`w-4 h-4 rounded-full ${c.color} border border-white/10 shadow-sm shrink-0`}></div>
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-200 text-sm truncate" title={c.name}>{c.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{c.formula}</div>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                                <div className="flex justify-between items-center border-b border-slate-700/50 pb-1">
                                    <span>State</span>
                                    <span className="text-slate-300 font-normal capitalize">{c.state}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-700/50 pb-1">
                                    <span>Type</span>
                                    <span className="text-slate-300 font-normal capitalize">{c.type}</span>
                                </div>
                                {c.ph !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span>pH</span>
                                        <span className={`font-mono text-xs ${c.ph < 7 ? 'text-red-400' : c.ph > 7 ? 'text-blue-400' : 'text-emerald-400'}`}>
                                            {c.ph}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                                <Info size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls & Analysis */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 min-h-[150px]">
                 {selectedChemicals.length < 2 ? (
                     <div className="text-center text-slate-500 italic">
                         Select at least two chemicals to observe their reaction in the beaker.
                     </div>
                 ) : (
                     <div className="space-y-4 animate-fade-in">
                        {/* Local Observation */}
                        {localRule ? (
                            <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                                <h4 className="font-bold text-emerald-400 mb-1">Observation</h4>
                                <p className="text-slate-300">{localRule.observation}</p>
                            </div>
                        ) : (
                            <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-slate-600">
                                <h4 className="font-bold text-slate-400 mb-1">Visual Check</h4>
                                <p className="text-slate-400 text-sm">
                                    No standard reaction detected visually from the predefined rules. 
                                    {selectedChemicals.length > 2 ? " Mixture is complex." : ""}
                                </p>
                            </div>
                        )}

                        {/* AI Button */}
                        {!aiResult && (
                            <button 
                                onClick={handleAnalyzeAi}
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} /> 
                                {loading ? "Analyzing Mixture..." : "Perform Deep AI Analysis"}
                            </button>
                        )}
                     </div>
                 )}

                 {/* AI Results Panel */}
                 {aiResult && (
                    <div className="mt-6 bg-slate-800 rounded-xl border border-emerald-500/30 overflow-hidden animate-fade-in">
                        <div className="bg-emerald-900/20 p-4 border-b border-emerald-500/20 flex justify-between items-center">
                            <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                                <Atom size={18} /> Gemini Analysis
                            </h3>
                            <span className="text-xs uppercase tracking-wider bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700">
                                {aiResult.type}
                            </span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <p className="text-2xl font-mono text-white tracking-wide">{aiResult.equation}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><Info size={14}/> Detailed Observation</h4>
                                    <p className="text-slate-200 leading-relaxed">{aiResult.observation}</p>
                                    <p className="text-slate-300 mt-2 text-sm italic"><span className="text-emerald-500">Color Change:</span> {aiResult.colorChange}</p>
                                </div>
                                
                                <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-500 mb-2 flex items-center gap-2"><AlertTriangle size={14}/> Safety Warning</h4>
                                    <p className="text-amber-200/80 text-sm">{aiResult.safetyWarning}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'rates' && <RatesLab />}
      {activeTab === 'electrolysis' && <ElectrolysisLab />}
      {activeTab === 'equilibrium' && <EquilibriumLab />}
      {activeTab === 'energy' && <EnergyProfileLab />}
      {activeTab === 'organic' && <OrganicLab />}
      {activeTab === 'titration' && <TitrationLab />}
      {activeTab === 'flame' && <FlameTestLab />}
      {activeTab === 'qualitative' && <QualitativeLab />}
      {activeTab === 'chromatography' && <ChromatographyLab />}

      {activeTab === 'orbitals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Orbital Selector</h3>
                <div className="space-y-2">
                    {ORBITAL_TYPES.map((orb, i) => (
                        <button
                            key={i}
                            onClick={() => handleOrbitalChange(orb)}
                            className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between ${
                                selectedOrbital.label === orb.label 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <span className="font-mono text-lg font-bold">{orb.label}</span>
                            <div className="text-xs opacity-70">
                                n={orb.n}, l={orb.l}, m={orb.m}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                   <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-bold uppercase">
                       <Settings2 size={12} /> Rotation Speed
                   </div>
                   <div className="flex gap-1">
                       {[0, 0.5, 1, 2].map(s => (
                           <button
                               key={s}
                               onClick={() => setOrbitalSpeed(s)}
                               className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                                   orbitalSpeed === s 
                                   ? 'bg-blue-600 text-white' 
                                   : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                               }`}
                           >
                               {s === 0 ? 'Stop' : s + 'x'}
                           </button>
                       ))}
                   </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">AI Description</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {orbitalDesc || "Select an orbital to see its properties."}
                    </p>
                </div>
            </div>
            <div className="col-span-1 lg:col-span-2 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700 p-8">
                 <div className="w-full max-w-2xl">
                    <div className="mb-4 flex justify-between items-end">
                         <div>
                            <h2 className="text-2xl font-bold text-white">Quantum Visualization</h2>
                            <p className="text-slate-400 text-sm">Probability Density Cloud</p>
                         </div>
                         <div className="text-right font-mono text-xs text-slate-500">
                            R(r) · Y(θ, φ)
                         </div>
                    </div>
                    <OrbitalVisualizer params={selectedOrbital} speed={orbitalSpeed} />
                 </div>
            </div>
        </div>
      )}

      {/* Chemical Details Overlay */}
      {viewingChemical && (
          <ChemicalDetails chemical={viewingChemical} onClose={() => setViewingChemical(null)} />
      )}
    </div>
  );
};

export default ChemistryLab;

import React, { useState, useEffect } from 'react';
import { Magnet, Hand, Zap, Move, Brain, ChevronRight, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

type LabMode = 'fields' | 'left_hand' | 'right_hand';
type FieldType = 'bar' | 'wire';

const MagnetismLab: React.FC = () => {
  const [mode, setMode] = useState<LabMode>('fields');
  const [fieldType, setFieldType] = useState<FieldType>('bar');
  
  // Hand Rule State
  const [fieldDir, setFieldDir] = useState<'N-S' | 'S-N'>('N-S'); // B Field
  const [currentDir, setCurrentDir] = useState<'In' | 'Out' | 'Off'>('Off'); // Motor Input
  const [motionVel, setMotionVel] = useState(0); // Generator Input (-100 to 100)
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const getMotorForce = () => {
      if (currentDir === 'Off') return 'None';
      if (fieldDir === 'N-S') {
          return currentDir === 'In' ? 'Down' : 'Up';
      } else { // S-N (B Left)
          return currentDir === 'In' ? 'Up' : 'Down';
      }
  };

  const getInducedCurrent = () => {
      if (Math.abs(motionVel) < 10) return 'None';
      const motionDir = motionVel > 0 ? 'Up' : 'Down';
      
      if (fieldDir === 'N-S') {
          return motionDir === 'Up' ? 'In' : 'Out';
      } else {
          return motionDir === 'Up' ? 'Out' : 'In';
      }
  };

  const handleReset = () => {
      setCurrentDir('Off');
      setMotionVel(0);
      setFieldDir('N-S');
      setExplanation("");
  };

  const handleExplain = async () => {
      setLoading(true);
      let topic = "";
      let data = {};

      if (mode === 'fields') {
          topic = fieldType === 'bar' ? "Magnetic Field of Bar Magnet" : "Magnetic Field around Wire";
          data = {
              visual: fieldType === 'bar' ? "Field lines N to S" : "Concentric circles",
              rule: fieldType === 'wire' ? "Right Hand Grip Rule" : "Like poles repel, unlike attract"
          };
      } else if (mode === 'left_hand') {
          topic = "Motor Effect (Left Hand Rule)";
          data = {
              thumb: "Force (Motion)",
              firstFinger: "Field (N->S)",
              secondFinger: "Current (+ to -)",
              scenario: `Field: ${fieldDir}, Current: ${currentDir}`,
              resultForce: getMotorForce()
          };
      } else {
          topic = "Generator Effect (Right Hand Rule)";
           data = {
              thumb: "Motion",
              firstFinger: "Field (N->S)",
              secondFinger: "Induced Current",
              scenario: `Field: ${fieldDir}, Motion: ${motionVel > 0 ? 'Up' : 'Down'}`,
              resultCurrent: getInducedCurrent()
          };
      }

      const text = await explainConcept(topic, data);
      setExplanation(text || "Error connecting to AI.");
      setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Sidebar Controls */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            {/* ... Controls (Same as before) ... */}
            <div className="flex items-center gap-2 mb-4">
                <Magnet className="text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Electromagnetism</h3>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-700">
                <button onClick={() => setMode('fields')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === 'fields' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    Fields
                </button>
                <button onClick={() => setMode('left_hand')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === 'left_hand' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    Motor (LHR)
                </button>
                <button onClick={() => setMode('right_hand')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === 'right_hand' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    Gen (RHR)
                </button>
            </div>

            <div className="flex-1 space-y-6">
                {/* Fields Mode Controls */}
                {mode === 'fields' && (
                    <div className="space-y-4 animate-fade-in">
                        <label className="text-xs font-bold text-slate-400 uppercase">Field Source</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setFieldType('bar')} className={`p-3 border rounded-lg text-sm font-bold ${fieldType === 'bar' ? 'bg-slate-700 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                Bar Magnet
                            </button>
                            <button onClick={() => setFieldType('wire')} className={`p-3 border rounded-lg text-sm font-bold ${fieldType === 'wire' ? 'bg-slate-700 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                Straight Wire
                            </button>
                        </div>
                    </div>
                )}

                {/* Left Hand (Motor) Controls */}
                {mode === 'left_hand' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg">
                            <h4 className="text-indigo-300 font-bold text-sm mb-1 flex items-center gap-2"><Hand size={14}/> Motor Effect</h4>
                            <p className="text-xs text-indigo-200/70">A current-carrying wire in a magnetic field experiences a Force.</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Magnetic Field (Index Finger)</label>
                            <div className="flex gap-2">
                                <button onClick={() => setFieldDir('N-S')} className={`flex-1 py-2 text-xs border rounded ${fieldDir === 'N-S' ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 text-slate-400'}`}>N ➔ S</button>
                                <button onClick={() => setFieldDir('S-N')} className={`flex-1 py-2 text-xs border rounded ${fieldDir === 'S-N' ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 text-slate-400'}`}>S ➔ N</button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Current (Middle Finger)</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setCurrentDir('In')} className={`p-2 text-xs border rounded ${currentDir === 'In' ? 'bg-yellow-600 border-yellow-400 text-white' : 'border-slate-700 text-slate-400'}`}>In (X)</button>
                                <button onClick={() => setCurrentDir('Off')} className={`p-2 text-xs border rounded ${currentDir === 'Off' ? 'bg-slate-600 text-white' : 'border-slate-700 text-slate-400'}`}>Off</button>
                                <button onClick={() => setCurrentDir('Out')} className={`p-2 text-xs border rounded ${currentDir === 'Out' ? 'bg-yellow-600 border-yellow-400 text-white' : 'border-slate-700 text-slate-400'}`}>Out (•)</button>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-slate-900 rounded border border-slate-600 mt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">Resultant Force</span>
                            <span className="text-sm font-bold text-red-400 uppercase">{getMotorForce()}</span>
                        </div>
                    </div>
                )}

                {/* Right Hand (Generator) Controls */}
                {mode === 'right_hand' && (
                     <div className="space-y-4 animate-fade-in">
                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg">
                            <h4 className="text-emerald-300 font-bold text-sm mb-1 flex items-center gap-2"><Zap size={14}/> Generator Effect</h4>
                            <p className="text-xs text-emerald-200/70">Moving a wire through a magnetic field induces a Current.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Magnetic Field (Index Finger)</label>
                            <div className="flex gap-2">
                                <button onClick={() => setFieldDir('N-S')} className={`flex-1 py-2 text-xs border rounded ${fieldDir === 'N-S' ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 text-slate-400'}`}>N ➔ S</button>
                                <button onClick={() => setFieldDir('S-N')} className={`flex-1 py-2 text-xs border rounded ${fieldDir === 'S-N' ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-700 text-slate-400'}`}>S ➔ N</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Wire Motion (Thumb)</label>
                            <input 
                                type="range" min="-100" max="100" step="10"
                                value={motionVel} 
                                onChange={(e) => setMotionVel(Number(e.target.value))}
                                className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                <span>Down (Fast)</span>
                                <span>Stop</span>
                                <span>Up (Fast)</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-900 rounded border border-slate-600 mt-2 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">Induced Current</span>
                            <span className="text-sm font-bold text-yellow-400 uppercase">{getInducedCurrent()}</span>
                        </div>
                    </div>
                )}
            </div>
             <div className="pt-4 border-t border-slate-700">
                 <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Physics"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in border-l-2 border-cyan-500 max-h-32 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        {/* Visualization Area */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center p-10 relative overflow-hidden">
            
            {/* Field Line Visual (Simple Background) */}
            {mode !== 'fields' || fieldType === 'bar' ? (
                 <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-full h-px bg-blue-400 mb-8 relative">
                            <div className={`absolute left-1/2 w-2 h-2 border-t-2 border-r-2 border-blue-300 ${fieldDir === 'N-S' ? 'rotate-45' : '-rotate-[135deg]'}`}></div>
                        </div>
                    ))}
                 </div>
            ) : null}

            {/* ---- SCENE: Wire Between Magnets ---- */}
            {(mode === 'left_hand' || mode === 'right_hand') && (
                <RotatableView className="w-full h-full flex items-center justify-center">
                    {/* Left Magnet Pole */}
                    <div className={`absolute left-0 h-64 w-24 rounded-r-lg flex items-center justify-center text-4xl font-bold text-white shadow-2xl z-10 ${fieldDir === 'N-S' ? 'bg-red-600 border-r-4 border-red-400' : 'bg-blue-600 border-r-4 border-blue-400'} transform translate-z-[-40px]`}>
                        {fieldDir === 'N-S' ? 'N' : 'S'}
                    </div>

                    {/* Right Magnet Pole */}
                    <div className={`absolute right-0 h-64 w-24 rounded-l-lg flex items-center justify-center text-4xl font-bold text-white shadow-2xl z-10 ${fieldDir === 'N-S' ? 'bg-blue-600 border-l-4 border-blue-400' : 'bg-red-600 border-l-4 border-red-400'} transform translate-z-[-40px]`}>
                        {fieldDir === 'N-S' ? 'S' : 'N'}
                    </div>

                    {/* The Wire Cross-Section */}
                    <div 
                        className="relative z-20 transition-transform duration-500 ease-out transform-style-3d"
                        style={{
                            transform: mode === 'left_hand' 
                                ? `translateY(${getMotorForce() === 'Up' ? '-80px' : getMotorForce() === 'Down' ? '80px' : '0px'})`
                                : `translateY(${ -motionVel * 1.5 }px)`
                        }}
                    >
                        {/* Wire Circle */}
                        <div className={`w-24 h-24 rounded-full border-[6px] ${
                             (mode === 'left_hand' && currentDir !== 'Off') || (mode === 'right_hand' && getInducedCurrent() !== 'None')
                             ? 'border-yellow-400 bg-yellow-900/50 shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
                             : 'border-slate-500 bg-slate-800'
                        } flex items-center justify-center relative backface-visible`}>
                             
                             {/* Current Indicator Symbol */}
                             <span className="text-6xl font-bold text-yellow-400">
                                 {(mode === 'left_hand' && currentDir === 'In') || (mode === 'right_hand' && getInducedCurrent() === 'In') ? '✕' : 
                                  (mode === 'left_hand' && currentDir === 'Out') || (mode === 'right_hand' && getInducedCurrent() === 'Out') ? '•' : ''}
                             </span>

                             <div className={`absolute -bottom-8 text-xs font-bold uppercase tracking-wider ${
                                 (mode === 'left_hand' && currentDir !== 'Off') || (mode === 'right_hand' && getInducedCurrent() !== 'None')
                                 ? 'text-yellow-400' : 'text-slate-600'
                             }`}>
                                 Current
                             </div>
                        </div>

                        {/* VECTORS OVERLAY - 3D Elements */}
                        
                        {/* 1. Field Vector (Blue) */}
                        <div className={`absolute top-1/2 left-1/2 w-40 h-1 bg-blue-500 flex items-center transform translate-z-[20px] ${fieldDir === 'S-N' ? 'origin-right -translate-x-full rotate-180' : 'origin-left'}`}>
                             <div className="absolute right-0 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-blue-500"></div>
                             <span className="absolute -top-5 left-10 text-blue-400 text-xs font-bold">Field (B)</span>
                        </div>

                        {/* 2. Force/Motion Vector (Red) */}
                        {((mode === 'left_hand' && getMotorForce() !== 'None') || (mode === 'right_hand' && Math.abs(motionVel) > 10)) && (
                            <div className={`absolute left-1/2 top-1/2 w-1 h-32 bg-red-500 origin-top flex justify-center transform translate-z-[20px] ${
                                (mode === 'left_hand' && getMotorForce() === 'Up') || (mode === 'right_hand' && motionVel > 0)
                                ? 'rotate-180 -translate-y-full' 
                                : '' 
                            }`}>
                                <div className="absolute bottom-0 w-0 h-0 border-x-[6px] border-x-transparent border-t-[10px] border-t-red-500"></div>
                                <span className={`absolute top-10 ml-4 text-red-400 text-xs font-bold whitespace-nowrap ${
                                    (mode === 'left_hand' && getMotorForce() === 'Up') || (mode === 'right_hand' && motionVel > 0) ? 'rotate-180' : ''
                                }`}>
                                    {mode === 'left_hand' ? 'Force (F)' : 'Motion (v)'}
                                </span>
                            </div>
                        )}
                    </div>
                </RotatableView>
            )}

            {/* ---- SCENE: Wire Field View ---- */}
            {mode === 'fields' && fieldType === 'wire' && (
                 <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-orange-500 border-4 border-orange-300 flex items-center justify-center z-20 shadow-lg relative">
                         <div className="text-white font-bold text-5xl">⊙</div>
                         <div className="absolute -bottom-8 text-orange-400 text-xs font-bold uppercase">Current Out</div>
                    </div>
                    {[...Array(4)].map((_, i) => (
                         <div key={i} className="absolute rounded-full border-2 border-blue-500/40 border-dashed z-10 animate-spin-slow"
                              style={{ 
                                  width: `${160 + i*80}px`, 
                                  height: `${160 + i*80}px`,
                                  animationDirection: 'reverse',
                                  animationDuration: '20s'
                              }}
                         >
                             <div className="absolute top-1/2 right-0 translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-blue-400 -rotate-90"></div>
                         </div>
                    ))}
                </div>
            )}

        </div>
    </div>
  );
};

export default MagnetismLab;
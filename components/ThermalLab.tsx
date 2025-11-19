import React, { useState, useEffect } from 'react';
import { Thermometer, Flame, Brain, RotateCcw, Snowflake, Wind, Droplets } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

const ThermalLab: React.FC = () => {
  const [temp, setTemp] = useState(-20); // Celsius
  const [isHeating, setIsHeating] = useState(false);
  const [energy, setEnergy] = useState(0); // Joules/Arbitrary units
  const [state, setState] = useState<'solid' | 'melting' | 'liquid' | 'boiling' | 'gas'>('solid');
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{e: number, t: number}[]>([]);

  useEffect(() => {
      let interval: any;
      if (isHeating) {
          interval = setInterval(() => {
              setEnergy(e => e + 1);
              
              setTemp(currentT => {
                  let newT = currentT;
                  
                  // Simple heating simulation
                  if (currentT < 0) {
                      newT += 1; 
                  } else if (currentT === 0) {
                      // Melting
                      if (Math.random() > 0.9) newT = 0.1; 
                  }
                  // ... simplified logic for demo ...
                  
                  return newT;
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isHeating, state]);

  useEffect(() => {
      let t = -20;
      let s: any = 'solid';
      
      if (energy < 20) {
          t = -20 + energy;
          s = 'solid';
      } else if (energy < 50) {
          t = 0;
          s = 'melting';
      } else if (energy < 100) {
          t = (energy - 50) * 2; 
          s = 'liquid';
      } else if (energy < 140) {
          t = 100;
          s = 'boiling';
      } else {
          t = 100 + (energy - 140);
          s = 'gas';
      }
      
      setTemp(t);
      setState(s);
      setHistory(h => [...h, {e: energy, t: t}]);

      if (t > 140) setIsHeating(false);

  }, [energy]);

  const handleReset = () => {
      setEnergy(0);
      setIsHeating(false);
      setHistory([]);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        currentTemp: `${temp.toFixed(0)}°C`,
        stateOfMatter: state.toUpperCase(),
        observation: state === 'melting' || state === 'boiling' ? "Temperature constant during phase change" : "Temperature rising",
        concept: "Latent Heat vs Specific Heat Capacity",
        particleBehavior: state === 'solid' ? "Vibrating fixed positions" : state === 'gas' ? "Moving freely fast" : "Sliding over each other"
    };
    const text = await explainConcept("Heating Curve & States of Matter", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Controls ... same as before ... */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Thermometer className="text-red-400" /> Thermal Physics
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="space-y-6 flex-1">
                <div className="bg-slate-900 p-4 rounded border border-slate-600 text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Current Temperature</div>
                    <div className={`text-4xl font-mono font-bold ${temp > 80 ? 'text-red-500' : temp < 0 ? 'text-blue-400' : 'text-white'}`}>
                        {temp.toFixed(0)}°C
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-800 text-xs text-emerald-400 font-bold uppercase border border-slate-700">
                        {state}
                    </div>
                </div>

                <button 
                   onClick={() => setIsHeating(!isHeating)}
                   disabled={temp > 140}
                   className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                       isHeating ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-600 text-white hover:bg-slate-500'
                   }`}
                >
                    <Flame size={18} fill={isHeating ? "currentColor" : "none"}/> {isHeating ? 'Heating...' : 'Apply Heat'}
                </button>

                <div className="text-xs text-slate-400 p-3 bg-slate-900/50 rounded border border-slate-700">
                    <span className="font-bold text-white">Latent Heat:</span> Notice how temperature stops rising during Melting (0°C) and Boiling (100°C) as energy breaks bonds.
                </div>
            </div>

             <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Curve"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-rows-2 gap-6">
             {/* Particle Visualizer - Now 3D Rotatable */}
             <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 relative overflow-hidden flex items-center justify-center">
                 <RotatableView className="w-full h-full flex items-center justify-center" initialRotation={{ x: 20, y: 0 }}>
                    {/* Container */}
                    <div className="w-48 h-48 border-4 border-slate-500 bg-slate-800/50 rounded-lg relative flex flex-wrap content-end p-2 gap-1 overflow-hidden transform-style-3d backface-visible shadow-2xl">
                        {[...Array(25)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-8 h-8 rounded-full transition-all duration-300 shadow-inner ${
                                    state === 'solid' || state === 'melting' ? 'bg-blue-300 border-blue-200' :
                                    state === 'liquid' || state === 'boiling' ? 'bg-blue-500 border-blue-400' : 'bg-slate-200 border-white opacity-50'
                                }`}
                                style={{
                                    // Simulation of states
                                    animation: state === 'solid' ? `vibrate 0.2s infinite` :
                                            state === 'melting' ? `vibrate 0.1s infinite` :
                                            state === 'liquid' ? `slide 2s infinite alternate` :
                                            state === 'boiling' ? `slide 0.5s infinite alternate` :
                                            `gas 1s infinite linear`,
                                    animationDelay: `${Math.random()}s`,
                                    transform: state === 'gas' ? `translate(${Math.random()*100}px, -${Math.random()*100}px) translateZ(${Math.random()*50}px)` : 'none',
                                    margin: state === 'solid' ? '1px' : state === 'liquid' ? '2px' : '10px'
                                }}
                            ></div>
                        ))}
                    </div>
                 </RotatableView>
                 
                 {/* Heater */}
                 <div className="absolute bottom-2 text-red-500 transition-opacity duration-300 pointer-events-none" style={{ opacity: isHeating ? 1 : 0.2 }}>
                      <div className="flex gap-1">
                          <Flame size={32} className="animate-flicker"/>
                          <Flame size={32} className="animate-flicker" style={{ animationDelay: '0.1s' }}/>
                          <Flame size={32} className="animate-flicker" style={{ animationDelay: '0.2s' }}/>
                      </div>
                 </div>

                 {/* State Label */}
                 <div className="absolute top-4 right-4">
                     {state === 'solid' && <Snowflake className="text-blue-300" size={24}/>}
                     {state === 'liquid' && <Droplets className="text-blue-500" size={24}/>}
                     {(state === 'gas' || state === 'boiling') && <Wind className="text-slate-300" size={24}/>}
                 </div>
             </div>

             {/* Heating Curve Graph */}
             <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 relative">
                 <div className="absolute top-2 left-2 text-xs font-bold text-slate-400">Heating Curve (Temp vs Energy)</div>
                 <div className="w-full h-full pt-6 pl-6 border-l border-b border-slate-600 relative">
                     {history.length > 1 && (
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                             <polyline 
                                points={history.map((pt) => {
                                    const x = (pt.e / 200) * 100;
                                    const y = 100 - ((pt.t + 20) / 160) * 100;
                                    return `${x}%,${y}%`;
                                }).join(' ')}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                             />
                        </svg>
                     )}
                     {/* Reference Lines */}
                     <div className="absolute w-full h-px bg-slate-600 border-t border-dashed border-slate-500 top-[75%]" title="0C"></div>
                     <div className="absolute w-full h-px bg-slate-600 border-t border-dashed border-slate-500 top-[12.5%]" title="100C"></div>
                 </div>
                 <div className="absolute bottom-1 right-2 text-[10px] text-slate-500">Time / Energy Added</div>
                 <div className="absolute top-1/2 left-1 text-[10px] text-slate-500 -rotate-90 origin-left">Temp (°C)</div>
             </div>
        </div>
        
        <style>{`
            @keyframes vibrate {
                0% { transform: translate(0, 0); }
                25% { transform: translate(1px, 1px); }
                50% { transform: translate(0, 0); }
                75% { transform: translate(-1px, -1px); }
                100% { transform: translate(0, 0); }
            }
            @keyframes slide {
                0% { transform: translateX(0); }
                100% { transform: translateX(10px) translateY(5px); }
            }
             @keyframes gas {
                0% { transform: translate(0,0) scale(1); opacity: 0.8; }
                50% { transform: translate(var(--tx), var(--ty)) scale(1.1); opacity: 0.5; }
                100% { transform: translate(var(--tx2), var(--ty2)) scale(1); opacity: 0.8; }
            }
            .transform-style-3d { transform-style: preserve-3d; }
        `}</style>
    </div>
  );
};

export default ThermalLab;
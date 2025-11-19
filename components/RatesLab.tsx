
import React, { useState, useEffect, useRef } from 'react';
import { Timer, Thermometer, FlaskConical, Activity, Brain, RotateCcw, Play, Pause } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const RatesLab: React.FC = () => {
  const [concentration, setConcentration] = useState(1.0); // mol/dm3
  const [surfaceArea, setSurfaceArea] = useState<'chips' | 'powder'>('chips');
  const [temperature, setTemperature] = useState(25); // Celsius
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(0); // cm3 of CO2
  const [history, setHistory] = useState<{t: number, v: number}[]>([]);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulation Constants
  const maxVolume = 100; // cm3
  
  useEffect(() => {
    let interval: any;
    if (isRunning && volume < maxVolume) {
        interval = setInterval(() => {
            setTime(t => {
                const dt = 0.1;
                const newT = t + dt;
                
                // Rate Equation Simulation
                // Rate = k * [Conc]^n * SurfaceAreaFactor * TempFactor
                // Base rate at 1.0M, 25C, Chips
                const baseRate = 2.0; 
                
                // Factors
                const concFactor = concentration; // First order approx
                const saFactor = surfaceArea === 'powder' ? 5 : 1; // Powder is much faster
                // Arrhenius-like temp dependence: Rate doubles every ~10C approx
                const tempFactor = Math.pow(2, (temperature - 25) / 10);
                
                // Reaction slows down as reactants are used up (Volume approaches max)
                const completion = volume / maxVolume;
                const reactantFactor = Math.max(0, 1 - completion); 

                const currentRate = baseRate * concFactor * saFactor * tempFactor * reactantFactor;
                
                setVolume(v => {
                    const newV = Math.min(maxVolume, v + currentRate * dt);
                    return newV;
                });
                
                return newT;
            });
        }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, concentration, surfaceArea, temperature, volume]);

  // Update Graph History
  useEffect(() => {
      if (isRunning) {
          setHistory(h => [...h, { t: time, v: volume }]);
      }
  }, [time, volume, isRunning]);

  const handleReset = () => {
      setIsRunning(false);
      setTime(0);
      setVolume(0);
      setHistory([]);
      setExplanation("");
  };

  const handleExplain = async () => {
      setLoading(true);
      const data = {
          experiment: "CaCO3 + HCl -> CaCl2 + H2O + CO2",
          conditions: {
              concentration: `${concentration} M`,
              surfaceArea: surfaceArea,
              temperature: `${temperature}°C`
          },
          collisionTheory: {
              tempEffect: "Higher KE = More frequent & successful collisions",
              concEffect: "More particles per unit volume = More frequent collisions",
              saEffect: "More contact area = More frequent collisions"
          },
          observation: `Gas produced: ${volume.toFixed(1)} cm3 in ${time.toFixed(1)}s`
      };
      const text = await explainConcept("Rate of Reaction Factors", data);
      setExplanation(text || "Error connecting to AI.");
      setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Timer className="text-rose-400"/> Rate of Reaction
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RotateCcw size={16} />
               </button>
           </div>
           
           <p className="text-slate-400 text-sm">
               Experiment: Calcium Carbonate + Hydrochloric Acid. Measure $CO_2$ volume.
           </p>

           <div className="space-y-5 flex-1">
               <div>
                   <label className="flex justify-between text-sm text-slate-300 mb-1">
                       <span>Acid Concentration</span>
                       <span>{concentration.toFixed(1)} M</span>
                   </label>
                   <input 
                       type="range" min="0.5" max="3.0" step="0.5"
                       value={concentration} onChange={e => setConcentration(Number(e.target.value))} 
                       disabled={isRunning && time > 0}
                       className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg"
                   />
               </div>

               <div>
                   <label className="flex justify-between text-sm text-slate-300 mb-1">
                       <span>Temperature</span>
                       <span>{temperature}°C</span>
                   </label>
                   <input 
                       type="range" min="20" max="80" step="5"
                       value={temperature} onChange={e => setTemperature(Number(e.target.value))} 
                       disabled={isRunning && time > 0}
                       className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg"
                   />
               </div>

               <div>
                   <label className="text-sm text-slate-300 mb-2 block">Surface Area</label>
                   <div className="flex gap-2">
                       <button 
                           onClick={() => setSurfaceArea('chips')}
                           disabled={isRunning && time > 0}
                           className={`flex-1 py-2 rounded border text-sm ${surfaceArea === 'chips' ? 'bg-slate-600 border-rose-500 text-white' : 'border-slate-600 text-slate-400'}`}
                       >
                           Marble Chips
                       </button>
                       <button 
                           onClick={() => setSurfaceArea('powder')}
                           disabled={isRunning && time > 0}
                           className={`flex-1 py-2 rounded border text-sm ${surfaceArea === 'powder' ? 'bg-slate-600 border-rose-500 text-white' : 'border-slate-600 text-slate-400'}`}
                       >
                           Fine Powder
                       </button>
                   </div>
               </div>
               
               <button 
                   onClick={() => setIsRunning(!isRunning)}
                   className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                       isRunning ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-emerald-600 hover:bg-emerald-500'
                   } text-white`}
               >
                   {isRunning ? <><Pause size={18}/> Pause</> : <><Play size={18}/> Start Experiment</>}
               </button>
           </div>

           <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Collision Theory"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-32 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
       </div>

       <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
           {/* Visual Simulation Area */}
           <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 relative overflow-hidden h-64 flex items-end justify-center gap-10">
               
               {/* Flask */}
               <div className="relative w-32 h-40">
                   <div className="absolute bottom-0 w-full h-32 bg-slate-800/50 border-x-2 border-b-2 border-slate-500 rounded-b-3xl overflow-hidden backdrop-blur-sm">
                       {/* Acid */}
                       <div className="absolute bottom-0 w-full h-24 bg-emerald-100/5 transition-all duration-1000 border-t border-emerald-200/10"></div>
                       
                       {/* Particles & Reaction Sites */}
                       <div className="absolute bottom-1 w-full flex justify-center flex-wrap content-end px-2 gap-1 z-10">
                           {surfaceArea === 'chips' ? (
                               // Marble Chips: Fewer, larger, collision sites on surface
                               [...Array(6)].map((_, i) => (
                                   <div key={i} className="relative w-8 h-6 bg-stone-300 rounded-sm border border-stone-500 shadow-md transform rotate-6 transition-transform duration-500">
                                       <div className="absolute inset-0 bg-stone-400/20"></div>
                                       {/* Collision/Reaction Sites on Surface */}
                                       {isRunning && (
                                           <>
                                               <div className="absolute -top-1 right-0 w-1 h-1 bg-white rounded-full animate-ping opacity-80" style={{ animationDuration: '0.8s' }}></div>
                                               <div className="absolute top-2 -left-1 w-1 h-1 bg-white rounded-full animate-ping opacity-80" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }}></div>
                                           </>
                                       )}
                                   </div>
                               ))
                           ) : (
                               // Fine Powder: Many, small, massive surface area
                               [...Array(80)].map((_, i) => (
                                   <div key={i} className="relative w-1.5 h-1.5 bg-white rounded-full opacity-90 shadow-sm">
                                        {/* Frequent Collision Sites */}
                                        {isRunning && Math.random() > 0.6 && (
                                            <div className="absolute inset-0 bg-yellow-100 animate-ping opacity-60" style={{ animationDuration: `${0.5 + Math.random()}s` }}></div>
                                        )}
                                   </div>
                               ))
                           )}
                       </div>

                       {/* Bubbles Rising */}
                       {isRunning && volume < maxVolume && (
                           <div className="absolute inset-0 z-20 pointer-events-none">
                               {[...Array(surfaceArea === 'powder' ? 40 : 15)].map((_, i) => (
                                   <div key={i} className="absolute bg-white/70 rounded-full animate-bubble-up" style={{
                                       width: Math.random() * 4 + 2 + 'px',
                                       height: Math.random() * 4 + 2 + 'px',
                                       left: Math.random() * 80 + 10 + '%',
                                       animationDuration: (Math.random() * 0.5 + 0.5) / (temperature/25) + 's',
                                       animationDelay: Math.random() * 2 + 's',
                                       bottom: '0px'
                                   }}></div>
                               ))}
                           </div>
                       )}
                   </div>
                   
                   {/* Neck */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 border-x-2 border-slate-500 bg-slate-800/30"></div>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-600 rounded"></div> {/* Stopper */}
                   
                   {/* Delivery Tube */}
                   <div className="absolute top-0 left-1/2 w-40 h-32 border-t-2 border-r-2 border-slate-500 rounded-tr-xl pointer-events-none"></div>
               </div>

               {/* Gas Syringe */}
               <div className="relative w-64 h-12 self-center -mb-20">
                   <div className="w-full h-full border-2 border-slate-500 bg-slate-800/50 rounded relative overflow-hidden flex items-center">
                        {/* Graduations */}
                        <div className="absolute inset-0 flex justify-between px-2 opacity-50">
                            {[...Array(11)].map((_, i) => <div key={i} className="w-px h-full bg-slate-400"></div>)}
                        </div>
                        
                        {/* Plunger */}
                        <div 
                            className="h-[90%] bg-slate-300/90 absolute right-0 transition-all duration-100 border-l-4 border-slate-500"
                            style={{ width: `${100 - (volume / maxVolume * 100)}%` }}
                        >
                            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-20 h-2 bg-slate-500"></div> {/* Rod */}
                        </div>
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-300 z-10 mix-blend-difference">
                            {volume.toFixed(0)} cm³
                        </div>
                   </div>
                   <div className="text-center text-xs text-slate-500 mt-1 font-mono uppercase">Gas Syringe</div>
               </div>

           </div>

           {/* Real-time Graph */}
           <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 flex-1 relative">
               <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Activity size={14}/> Volume vs Time</h4>
               <div className="absolute inset-4 top-10 border-l border-b border-slate-600">
                   {history.length > 1 && (
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                             <polyline 
                                points={history.map((pt, i) => {
                                    // Max time approx 60s for reaction
                                    const x = (pt.t / 60) * 100;
                                    const y = 100 - (pt.v / maxVolume * 100);
                                    return `${x}%,${y}%`;
                                }).join(' ')}
                                fill="none"
                                stroke="#f43f5e"
                                strokeWidth="2"
                             />
                        </svg>
                   )}
                   {/* Grid Lines */}
                   <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_19px,#fff_1px),linear-gradient(90deg,transparent_19px,#fff_1px)] bg-[size:20px_20px]"></div>
               </div>
               <div className="absolute bottom-1 right-4 text-xs text-slate-500">Time (s)</div>
               <div className="absolute top-10 left-1 text-xs text-slate-500 -rotate-90 origin-top-left">Vol (cm³)</div>
           </div>
       </div>
       <style>{`
         @keyframes bubble-up {
             0% { bottom: 0; opacity: 0; }
             50% { opacity: 1; }
             100% { bottom: 100%; opacity: 0; }
         }
         .animate-bubble-up { animation: bubble-up infinite linear; }
       `}</style>
    </div>
  );
};

export default RatesLab;

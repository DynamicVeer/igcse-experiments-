
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Magnet, Activity, Brain, RotateCcw, Zap, ChevronRight } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const InductionLab: React.FC = () => {
  const [magnetPos, setMagnetPos] = useState(0); // -100 to 100 (Coil at 0)
  const [velocity, setVelocity] = useState(0);
  const [flux, setFlux] = useState(0);
  const [emf, setEmf] = useState(0);
  const [history, setHistory] = useState<{t: number, emf: number, flux: number}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(0);
  const lastPosRef = useRef<number>(0);
  const historyRef = useRef<{t: number, emf: number, flux: number}[]>([]);

  // Physics Loop
  useEffect(() => {
    let animationFrame: number;
    
    const updatePhysics = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const dt = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        if (dt > 0) {
            // Calculate Flux: Gaussian approx
            const currentFlux = 100 * Math.exp(-(Math.pow(magnetPos, 2)) / 1500);
            
            let v = 0;
            if (isDragging) {
                v = (magnetPos - lastPosRef.current) / dt; 
                v = Math.max(-500, Math.min(500, v));
            } 

            // Faraday's Law: Emf = -N * dPhi/dt
            const dPhi_dx = -2 * magnetPos * (currentFlux / 1500); 
            const calculatedEmf = -1 * dPhi_dx * v * 5; // Scale factor

            setFlux(currentFlux);
            setEmf(calculatedEmf);
            setVelocity(v);

            lastPosRef.current = magnetPos;

            const now = Date.now();
            historyRef.current.push({ t: now, emf: calculatedEmf, flux: currentFlux });
            if (historyRef.current.length > 300) historyRef.current.shift(); 
            setHistory([...historyRef.current]);
        }
        
        animationFrame = requestAnimationFrame(updatePhysics);
    };

    animationFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrame);
  }, [magnetPos, isDragging]);

  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      
      const rawPos = ((x / width) * 200) - 100;
      setMagnetPos(Math.max(-100, Math.min(100, rawPos)));
  }, [isDragging]);

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        phenomenon: "Electromagnetic Induction",
        law: "Faraday's Law & Lenz's Law",
        condition: Math.abs(emf) > 5 ? "Magnet Moving Fast" : "Magnet Stationary/Slow",
        observation: Math.abs(emf) > 5 ? "High Induced EMF (Voltage)" : "Low/Zero EMF",
        direction: emf > 0 ? "Positive Current" : emf < 0 ? "Negative Current" : "No Current",
        fluxChange: "Rate of change of magnetic flux generates EMF"
    };
    const text = await explainConcept("Electromagnetic Induction", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  const handleReset = () => {
      setMagnetPos(-80);
      historyRef.current = [];
      setHistory([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Magnet className="text-red-500" /> Induced EMF
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-600 flex flex-col items-center justify-center min-h-[120px]">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2">Galvanometer</div>
                <div className="relative w-32 h-16 border-t-2 border-x-2 border-slate-500 rounded-t-full flex justify-center overflow-hidden bg-slate-800">
                    <div className="absolute bottom-0 w-2 h-2 bg-slate-300 rounded-full z-10"></div>
                    {/* Needle */}
                    <div 
                        className="absolute bottom-0 left-1/2 w-0.5 h-14 bg-red-500 origin-bottom transition-transform duration-75 ease-out"
                        style={{ transform: `translateX(-50%) rotate(${Math.max(-80, Math.min(80, emf * 2))}deg)` }}
                    ></div>
                    {/* Ticks */}
                    <div className="absolute inset-0">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-slate-600 origin-bottom" style={{ transform: `translateX(-50%) rotate(${(i-4)*20}deg) translateY(-56px)` }}></div>
                        ))}
                    </div>
                </div>
                <div className="mt-2 font-mono font-bold text-xl" style={{ color: Math.abs(emf) > 50 ? '#ef4444' : '#fff' }}>
                    {emf.toFixed(1)} mV
                </div>
            </div>

            <div className="space-y-4 flex-1">
                 <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                     <Zap size={20} className={Math.abs(emf) > 10 ? 'text-yellow-400 animate-pulse' : 'text-slate-600'} fill={Math.abs(emf) > 10 ? 'currentColor' : 'none'}/>
                     <div>
                         <div className="text-xs text-slate-400">Circuit Status</div>
                         <div className="font-bold text-sm text-white">{Math.abs(emf) > 10 ? 'Current Flowing' : 'No Significant Current'}</div>
                     </div>
                 </div>
                 
                 <p className="text-xs text-slate-400 leading-relaxed">
                     Drag the magnet through the coil. Voltage is generated when flux <b>changes</b>.
                 </p>
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
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in border-l-2 border-cyan-500">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            {/* Simulation Area */}
            <div 
                ref={containerRef}
                className="relative h-64 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden cursor-ew-resize select-none touch-none"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleDrag}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={handleDrag}
            >
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#1e293b_1px,transparent_1px)] bg-[length:40px_100%] opacity-20"></div>

                {/* Coil (Solenoid) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 z-10 pointer-events-none">
                    
                    {/* Wire Loops */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        {/* Back Loops */}
                        {[...Array(6)].map((_, i) => (
                            <path 
                                key={`back-${i}`} 
                                d={`M ${16 + i*24} 32 A 12 32 0 0 0 ${16 + i*24} 96`} 
                                fill="none" 
                                stroke="#475569" 
                                strokeWidth="4" 
                            />
                        ))}
                        
                        {/* Moving Magnet is Layered Here via Z-index tricks usually, but simple layering for now */}
                    </svg>
                    
                    {/* Highlight Ring */}
                    <div className={`absolute inset-0 rounded-full opacity-20 transition-colors duration-100 ${emf > 0 ? 'bg-red-500/30' : emf < 0 ? 'bg-blue-500/30' : 'bg-transparent'}`}></div>
                </div>

                {/* Magnet */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 w-40 h-16 flex shadow-2xl z-20 transition-transform duration-75"
                    style={{ 
                        left: '50%', 
                        transform: `translate(calc(-50% + ${magnetPos * 3}px), -50%)`
                    }}
                >
                    <div className="flex-1 bg-red-600 rounded-l-md flex items-center justify-center text-white font-bold text-2xl border-y border-l border-red-400">N</div>
                    <div className="flex-1 bg-blue-600 rounded-r-md flex items-center justify-center text-white font-bold text-2xl border-y border-r border-blue-400">S</div>
                    {/* Magnetic Field Aura */}
                    <div className="absolute inset-0 bg-white/5 rounded-md blur-xl -z-10"></div>
                </div>

                {/* Coil Front Loops with Electron Animation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 z-30 pointer-events-none">
                     <svg className="absolute inset-0 w-full h-full overflow-visible">
                        {[...Array(6)].map((_, i) => (
                            <g key={`front-${i}`}>
                                {/* Physical Wire */}
                                <path 
                                    d={`M ${16 + i*24} 32 A 12 32 0 0 1 ${16 + i*24} 96`} 
                                    fill="none" 
                                    stroke="#94a3b8" 
                                    strokeWidth="4" 
                                />
                                {/* Electron Flow Overlay */}
                                {Math.abs(emf) > 2 && (
                                    <path 
                                        d={`M ${16 + i*24} 32 A 12 32 0 0 1 ${16 + i*24} 96`} 
                                        fill="none" 
                                        stroke={emf > 0 ? "#facc15" : "#facc15"} // Yellow for current
                                        strokeWidth="2" 
                                        strokeDasharray="4 8"
                                        className="animate-electron-flow"
                                        style={{
                                            animationDirection: emf > 0 ? 'normal' : 'reverse',
                                            animationDuration: `${Math.max(0.2, 200 / Math.abs(emf))}s`
                                        }}
                                    />
                                )}
                            </g>
                        ))}
                    </svg>
                    
                    {/* Current Direction Indicator */}
                    {Math.abs(emf) > 10 && (
                        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full text-yellow-400 border border-yellow-500/30 animate-bounce">
                            <span className="text-xs font-bold whitespace-nowrap">Current</span>
                            <ChevronRight size={16} className={`transition-transform ${emf < 0 ? 'rotate-180' : ''}`}/>
                        </div>
                    )}
                </div>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono bg-slate-900/80 px-2 py-1 rounded">
                    Drag magnet left/right
                </div>
            </div>

            {/* Graphing Area */}
            <div className="h-48 bg-slate-900 rounded-xl border border-slate-700 p-4 relative">
                <div className="absolute top-2 left-2 flex gap-4">
                     <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                         <div className="w-3 h-1 bg-red-400"></div> EMF (V)
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                         <div className="w-3 h-1 bg-blue-400"></div> Flux (Φ)
                     </div>
                </div>
                
                <div className="w-full h-full flex items-end overflow-hidden relative pt-6">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="1" strokeDasharray="4 4"/>
                        {history.length > 1 && (
                            <>
                            <polyline 
                                points={history.map((pt, i) => {
                                    const x = (i / (history.length - 1)) * 100;
                                    const y = 50 - (pt.emf * 0.5); 
                                    return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                                }).join(' ')}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                            />
                            <polyline 
                                points={history.map((pt, i) => {
                                    const x = (i / (history.length - 1)) * 100;
                                    const y = 90 - (pt.flux * 0.8); 
                                    return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                                }).join(' ')}
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="2"
                                strokeDasharray="2 2"
                                opacity="0.6"
                            />
                            </>
                        )}
                    </svg>
                </div>
            </div>
        </div>
        <style>{`
            @keyframes flow {
                to { stroke-dashoffset: -24; }
            }
            .animate-electron-flow {
                animation: flow linear infinite;
            }
        `}</style>
    </div>
  );
};

export default InductionLab;

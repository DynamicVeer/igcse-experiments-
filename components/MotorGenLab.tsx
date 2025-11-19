
import React, { useState, useEffect, useRef } from 'react';
import { Zap, RotateCw, Activity, Settings, Brain, RotateCcw, Magnet, ArrowRight, Info } from 'lucide-react';
import { explainConcept } from '../services/geminiService';
import RotatableView from './ui/RotatableView';

type MachineType = 'dc_motor' | 'ac_generator' | 'dc_generator';

const MotorGenLab: React.FC = () => {
  const [type, setType] = useState<MachineType>('ac_generator');
  const [speed, setSpeed] = useState(1); // 0 to 3
  const [fieldStrength, setFieldStrength] = useState(50); // % of max B-field
  const [angle, setAngle] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [history, setHistory] = useState<{t: number, v: number}[]>([]);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  
  const frameRef = useRef<number>(0);

  // Animation Loop
  useEffect(() => {
      let animationFrame: number;
      
      const animate = () => {
          if (isRunning && speed > 0) {
              // Update Angle
              const rotationSpeed = speed * 2;
              setAngle(a => (a + rotationSpeed) % 360);
              frameRef.current += 1;
              
              const rad = (angle * Math.PI) / 180;
              const bFactor = fieldStrength / 50;
              
              let output = 0;

              if (type === 'ac_generator') {
                  // AC: Sine wave. 
                  // Max EMF when coil is horizontal (cutting lines perpendicularly).
                  // Zero EMF when coil is vertical (moving parallel to lines).
                  // We define angle 0 as horizontal.
                  output = Math.cos(rad) * speed * 5 * bFactor; 
              } else if (type === 'dc_generator') {
                  // DC Gen: Rectified Cosine (Absolute value due to commutator)
                  output = Math.abs(Math.cos(rad)) * speed * 5 * bFactor;
              } else {
                  // DC Motor: Constant Torque (idealized)
                  // In reality torque ripples, but we show constant "Drive"
                  output = speed * 5 * bFactor;
              }

              // Update Graph Data
              if (frameRef.current % 3 === 0) {
                  setHistory(h => {
                      const newH = [...h, { t: frameRef.current, v: output }];
                      if (newH.length > 150) newH.shift();
                      return newH;
                  });
              }
          }
          animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
  }, [isRunning, speed, fieldStrength, type, angle]);

  const handleReset = () => {
      setAngle(0);
      setHistory([]);
      setSpeed(1);
      setFieldStrength(50);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    let concept = "";
    let data = {};

    if (type === 'dc_motor') {
        concept = "DC Motor Principle";
        data = {
            construction: "Coil, Split-Ring Commutator, Brushes, Curved Magnets",
            principle: "Motor Effect (Fleming's Left Hand Rule)",
            roleOfCommutator: "Reverses current direction in the coil every half-turn to keep torque in the same direction.",
            energyConversion: "Electrical Energy -> Mechanical Energy"
        };
    } else if (type === 'ac_generator') {
        concept = "AC Generator (Alternator)";
        data = {
            construction: "Coil, Two Slip Rings, Brushes, Magnets",
            principle: "Electromagnetic Induction (Faraday's Law)",
            roleOfSlipRings: "Maintain continuous connection to the same wire leg, resulting in Alternating Current (AC output).",
            energyConversion: "Mechanical Energy -> Electrical Energy"
        };
    } else {
        concept = "DC Generator (Dynamo)";
        data = {
            construction: "Coil, Split-Ring Commutator, Brushes, Magnets",
            principle: "Electromagnetic Induction + Rectification",
            roleOfCommutator: "Acts as a mechanical rectifier, swapping connections every half-turn to keep output current in one direction (DC).",
            energyConversion: "Mechanical Energy -> Electrical Energy"
        };
    }

    const text = await explainConcept(concept, data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  // --- Visual Logic Helper ---
  
  // Calculate Current Direction for Arrows
  // Returns: 1 (Forward/Clockwise flow), -1 (Backward), 0 (Zero)
  const getCurrentFlow = () => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad); // EMF proportional to cos(angle) if 0 is horizontal
      
      if (type === 'dc_motor') {
          // DC Motor: Current is always supplied in same direction from source.
          // But INSIDE the coil, the commutator flips it relative to the wire to keep it "Up" on the left side.
          // Visually: Current arrows on the wire should flip relative to the wire frame?
          // No, in a DC motor, current flows A->B then B->A relative to wire.
          // Relative to SCREEN (Space), current on Top wire is always Away?
          // Let's simulate: Current flows into Brush 1.
          // Brush 1 touches Ring Segment A (0-180). Current in Wire Side A is (+)
          // Brush 1 touches Ring Segment B (180-360). Current in Wire Side B is (+)
          // Visually, we want to show current flowing.
          return 1; 
      } else if (type === 'dc_generator') {
          // DC Gen: Current varies magnitude, but direction in EXTERNAL circuit is constant.
          // Internal direction flips.
          // Visual: Arrows on wire flip direction relative to wire.
          // When angle 0-180: Current A->B. When 180-360: Current B->A.
          return Math.sign(cos) || 1;
      } else {
          // AC Gen: Current flips direction (Sine wave)
          return Math.sign(cos) || 1;
      }
  };
  
  // Determine if we should show specific arrows based on angle (hide at zero crossings)
  const showArrows = Math.abs(Math.cos((angle * Math.PI) / 180)) > 0.1 || type === 'dc_motor';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Controls Panel */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="text-orange-400"/> Machine Lab
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="space-y-6 flex-1">
                {/* Machine Selector */}
                <div>
                    <label className="text-xs font-bold text-slate-300 uppercase">Select Configuration</label>
                    <div className="flex flex-col gap-2 mt-2">
                        <button 
                            onClick={() => { setType('ac_generator'); setHistory([]); }} 
                            className={`px-4 py-3 rounded-lg border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                type === 'ac_generator' 
                                ? 'bg-blue-500/20 border-blue-500 text-blue-200' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <div>
                                <span className="block">AC Generator</span>
                                <span className="text-[10px] opacity-70 font-normal">Two Slip Rings • Alternating Output</span>
                            </div>
                            <Activity size={16}/>
                        </button>
                        <button 
                            onClick={() => { setType('dc_generator'); setHistory([]); }} 
                            className={`px-4 py-3 rounded-lg border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                type === 'dc_generator' 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <div>
                                <span className="block">DC Generator</span>
                                <span className="text-[10px] opacity-70 font-normal">Split-Ring Commutator • Pulsed DC</span>
                            </div>
                            <Zap size={16}/>
                        </button>
                         <button 
                            onClick={() => { setType('dc_motor'); setHistory([]); }} 
                            className={`px-4 py-3 rounded-lg border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                                type === 'dc_motor' 
                                ? 'bg-orange-500/20 border-orange-500 text-orange-200' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                             <div>
                                <span className="block">DC Motor</span>
                                <span className="text-[10px] opacity-70 font-normal">Split-Ring Commutator • Electrical Input</span>
                            </div>
                            <RotateCw size={16}/>
                        </button>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                    <div>
                        <label className="flex justify-between text-sm text-slate-300 mb-1">
                            <span>Rotation Speed ($\omega$)</span>
                            <span>{speed.toFixed(1)}x</span>
                        </label>
                        <input 
                            type="range" min="0" max="3" step="0.1"
                            value={speed} onChange={e => setSpeed(Number(e.target.value))} 
                            className="w-full accent-orange-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm text-slate-300 mb-1">
                            <span>Magnetic Field Strength ($B$)</span>
                            <span>{fieldStrength}%</span>
                        </label>
                        <input 
                            type="range" min="0" max="100" step="5"
                            value={fieldStrength} onChange={e => setFieldStrength(Number(e.target.value))} 
                            className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`w-full py-2 rounded-lg font-bold transition-colors shadow-lg ${isRunning ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                >
                    {isRunning ? 'Pause Simulation' : 'Start Rotation'}
                </button>
            </div>

            {/* AI Section */}
            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50 transition-all"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Analyze Component"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in border-l-2 border-cyan-500 max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        {/* Visuals Panel */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            
            {/* 3D Simulation View */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner min-h-[400px]">
                
                {/* Instructions Overlay */}
                <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                    <ArrowRight size={12} className="text-orange-400"/> Click & Drag to Rotate View 3D
                </div>

                <RotatableView className="w-full h-full flex items-center justify-center" initialRotation={{x: 15, y: -30}}>
                    
                    {/* === MAGNET ASSEMBLY (STATIC) === */}
                    <div className="absolute transform-style-3d flex items-center justify-between w-[500px] pointer-events-none z-0">
                         {/* North Pole (Left) */}
                         <div className="relative h-48 w-24 flex items-center transform translate-z-[-30px]">
                             {/* Main Block */}
                             <div className="absolute inset-0 bg-red-600 border-y-4 border-l-4 border-red-800 shadow-2xl rounded-l-lg"></div>
                             {/* Concave Face (Simulated by mask or overlay) */}
                             <div className="absolute right-[-15px] top-0 h-full w-8 bg-red-600 rounded-r-[100%] border-y-4 border-r-4 border-red-700" 
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20%, 50% 50%, 0 80%)' }}> 
                                  {/* CSS shape trick for concave look is hard, let's use a radial gradient overlay on a block to fake depth */}
                             </div>
                             {/* Better Concave Trick: Use a circle of background color to 'cut' the magnet */}
                             <div className="absolute right-[-35px] top-1/2 -translate-y-1/2 w-40 h-40 bg-slate-950 rounded-full"></div>
                             
                             <span className="relative z-10 text-6xl font-black text-red-900 ml-6 drop-shadow-md">N</span>
                         </div>

                         {/* South Pole (Right) */}
                         <div className="relative h-48 w-24 flex items-center justify-end transform translate-z-[-30px]">
                             <div className="absolute inset-0 bg-blue-600 border-y-4 border-r-4 border-blue-800 shadow-2xl rounded-r-lg"></div>
                             {/* Concave Cutout */}
                             <div className="absolute left-[-35px] top-1/2 -translate-y-1/2 w-40 h-40 bg-slate-950 rounded-full"></div>
                             <span className="relative z-10 text-6xl font-black text-blue-900 mr-6 drop-shadow-md">S</span>
                         </div>
                    </div>

                    {/* Magnetic Field Lines (Static Background) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none transform translate-z-[-20px]">
                        {[...Array(5)].map((_, i) => (
                            <div 
                                key={i} 
                                className="w-[220px] h-px bg-cyan-400 mb-8 shadow-[0_0_8px_cyan]"
                                style={{ opacity: (fieldStrength / 100) }}
                            >
                                <div className="absolute left-1/2 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45 transform -translate-y-1/2 translate-x-4"></div>
                            </div>
                        ))}
                    </div>

                    {/* === ROTATING ARMATURE ASSEMBLY === */}
                    <div 
                        className="relative w-[260px] h-[140px] transform-style-3d transition-transform duration-0 ease-linear z-10"
                        style={{ transform: `rotateX(${angle}deg)` }}
                    >
                        {/* -- Shaft -- */}
                        <div className="absolute top-1/2 left-[-80px] w-[420px] h-4 bg-gray-400 -translate-y-1/2 transform-style-3d rounded shadow-inner flex items-center justify-center">
                             <div className="w-full h-1 bg-gray-300 opacity-50"></div>
                        </div>

                        {/* -- Coil Wire Frame -- */}
                        <div className="absolute inset-0 border-[8px] border-orange-500 rounded-sm transform-style-3d backface-visible shadow-xl group">
                             {/* Wire Core */}
                             <div className="absolute inset-0 border-[2px] border-orange-300 opacity-50"></div>
                             
                             {/* Current Arrows (Yellow) - Dynamic */}
                             {showArrows && (
                                 <>
                                    {/* Top Wire Arrow */}
                                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-xl animate-pulse transform -rotate-90 filter drop-shadow-md">
                                        {getCurrentFlow() > 0 ? '➤' : '◀'}
                                    </div>
                                    {/* Bottom Wire Arrow */}
                                    <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-xl animate-pulse transform rotate-90 filter drop-shadow-md">
                                        {getCurrentFlow() > 0 ? '◀' : '➤'}
                                    </div>
                                 </>
                             )}
                             
                             {/* Force/Motion Arrows (Green) - Attached to wire frame */}
                             {/* Top Wire Force */}
                             <div className="absolute -right-10 top-0 flex flex-col items-center">
                                 <div className={`w-0 h-0 border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-b-[16px] border-b-green-500 transform transition-all ${type === 'dc_motor' ? 'rotate-0' : 'rotate-180'}`}></div>
                                 <span className="text-green-400 text-[8px] font-bold uppercase bg-slate-900/50 px-1 rounded">{type === 'dc_motor' ? 'Force' : 'Motion'}</span>
                             </div>
                             {/* Bottom Wire Force (Opposite) */}
                             <div className="absolute -right-10 bottom-0 flex flex-col items-center">
                                 <div className={`w-0 h-0 border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-b-[16px] border-b-green-500 transform transition-all ${type === 'dc_motor' ? 'rotate-180' : 'rotate-0'}`}></div>
                             </div>
                        </div>

                        {/* -- Commutator / Slip Rings (Attached to Shaft) -- */}
                        <div className="absolute left-[-50px] top-1/2 -translate-y-1/2 flex items-center transform-style-3d">
                            
                            {type === 'ac_generator' ? (
                                /* Two Slip Rings (AC) */
                                <div className="flex gap-3 transform-style-3d relative">
                                    {/* Ring 1 */}
                                    <div className="w-4 h-14 bg-yellow-600 rounded-full border-2 border-yellow-200 shadow-lg transform rotateY(90deg)"></div>
                                    {/* Ring 2 */}
                                    <div className="w-4 h-14 bg-yellow-600 rounded-full border-2 border-yellow-200 shadow-lg transform rotateY(90deg)"></div>
                                    
                                    {/* Connecting Wires from Coil to Rings */}
                                    <div className="absolute right-[-10px] top-[-30px] w-10 h-1 bg-orange-500 origin-right rotate-[35deg] translate-z-[5px]"></div>
                                    <div className="absolute right-[-10px] bottom-[-30px] w-16 h-1 bg-orange-500 origin-right rotate-[-20deg] translate-z-[-5px]"></div>
                                </div>
                            ) : (
                                /* Split Ring Commutator (DC) */
                                <div className="relative w-12 h-12 transform-style-3d">
                                    {/* Top Half */}
                                    <div className="absolute top-[-2px] w-12 h-6 bg-orange-500 border-2 border-orange-200 rounded-t-full transform-style-3d"></div>
                                    {/* Bottom Half */}
                                    <div className="absolute bottom-[-2px] w-12 h-6 bg-orange-500 border-2 border-orange-200 rounded-b-full transform-style-3d"></div>
                                    {/* Gap is visible between them naturally */}
                                    
                                    {/* Connection wires */}
                                    <div className="absolute right-[-20px] top-[-30px] w-10 h-1 bg-orange-500 origin-right rotate-[45deg]"></div>
                                    <div className="absolute right-[-20px] bottom-[-30px] w-10 h-1 bg-orange-500 origin-right rotate-[-45deg]"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === BRUSHES (STATIC) === */}
                    {/* Brushes must align with the rings but stay still in the view */}
                    <div className="absolute left-[-130px] top-1/2 -translate-y-1/2 z-20 pointer-events-none transform translate-z-[20px]">
                         {type === 'ac_generator' ? (
                             // Brushes for 2 rings
                             <div className="flex gap-3">
                                 <div className="w-4 h-24 flex flex-col justify-between py-2">
                                     <div className="w-full h-4 bg-stone-700 border border-stone-500 shadow-lg rounded-r-sm"></div> {/* Brush 1 Top? No, brushes are usually top/bottom or side/side. Lets do Top/Bottom for visibility */}
                                 </div>
                                 <div className="w-4 h-24 flex flex-col justify-between py-2">
                                     <div className="w-full h-4 bg-stone-700 border border-stone-500 shadow-lg rounded-r-sm mt-auto"></div> {/* Brush 2 */}
                                 </div>
                             </div>
                         ) : (
                             // Brushes for Split Ring (Top and Bottom pressing on commutator)
                             <div className="relative w-12 h-28">
                                 {/* Top Brush */}
                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-stone-800 border border-stone-500 rounded-b-sm shadow-lg flex items-center justify-center">
                                    <div className="w-1 h-full bg-black/50"></div>
                                 </div>
                                 {/* Bottom Brush */}
                                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-stone-800 border border-stone-500 rounded-t-sm shadow-lg flex items-center justify-center">
                                     <div className="w-1 h-full bg-black/50"></div>
                                 </div>
                                 
                                 {/* External Circuit Wires */}
                                 <div className="absolute top-[-20px] left-1/2 w-0.5 h-5 bg-yellow-400"></div>
                                 <div className="absolute bottom-[-20px] left-1/2 w-0.5 h-5 bg-yellow-400"></div>
                             </div>
                         )}
                    </div>

                </RotatableView>
            </div>

            {/* Graph Output */}
            <div className="h-48 bg-slate-900 rounded-xl border border-slate-700 p-4 relative overflow-hidden">
                <div className="absolute top-2 left-2 z-10 flex gap-4">
                     <div className="text-xs font-bold text-slate-300 bg-slate-800/90 px-2 py-1 rounded border border-slate-600 flex items-center gap-2 shadow-sm">
                        <Activity size={12} className={type.includes('dc') ? 'text-emerald-400' : 'text-blue-400'} /> 
                        {type === 'dc_motor' ? 'Torque / Speed' : type === 'ac_generator' ? 'AC Voltage Output' : 'DC Voltage Output'}
                     </div>
                </div>

                <div className="w-full h-full flex items-center overflow-hidden relative pl-10 pt-4 pb-4">
                     {/* Axes */}
                     <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-600 z-10"></div> 
                     <div className="absolute left-10 right-0 top-1/2 h-px bg-slate-600 z-10"></div> 
                     
                     {/* Zero Line Label */}
                     <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">0</div>
                     <div className="absolute left-2 top-4 text-[10px] text-slate-500 font-mono">+</div>
                     <div className="absolute left-2 bottom-4 text-[10px] text-slate-500 font-mono">-</div>

                     {history.length > 1 && (
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                             <defs>
                                 <linearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                     <stop offset="0%" stopColor={type.includes('dc') ? '#10b981' : '#3b82f6'} stopOpacity="0" />
                                     <stop offset="20%" stopColor={type.includes('dc') ? '#10b981' : '#3b82f6'} stopOpacity="1" />
                                 </linearGradient>
                             </defs>
                             <polyline 
                                points={history.map((pt, i) => {
                                    const x = (i / 150) * 100; 
                                    // Scale graph: 50 is center. Amplitude varies.
                                    const y = 50 - (pt.v * 1.5); 
                                    return `${x}%,${y}%`;
                                }).join(' ')}
                                fill="none"
                                stroke="url(#gradLine)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]"
                             />
                        </svg>
                     )}
                </div>
            </div>
        </div>
        <style>{`
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-visible { backface-visibility: visible; }
        `}</style>
    </div>
  );
};

export default MotorGenLab;

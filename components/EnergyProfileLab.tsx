
import React, { useState } from 'react';
import { Activity, ArrowUp, ArrowDown, Brain, RotateCcw, Flame, Snowflake } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const EnergyProfileLab: React.FC = () => {
  const [reactantE, setReactantE] = useState(50);
  const [productE, setProductE] = useState(20);
  const [activationE, setActivationE] = useState(80); // Peak height relative to 0
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const deltaH = productE - reactantE;
  const ea = activationE - reactantE;
  const isExothermic = deltaH < 0;

  const handleReset = () => {
      setReactantE(50);
      setProductE(20);
      setActivationE(80);
      setExplanation("");
  };

  const setPreset = (type: 'exo' | 'endo') => {
      if (type === 'exo') {
          setReactantE(60);
          setProductE(20);
          setActivationE(90);
      } else {
          setReactantE(20);
          setProductE(60);
          setActivationE(90);
      }
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        type: isExothermic ? "Exothermic" : "Endothermic",
        enthalpyChange: `${deltaH} kJ/mol`,
        activationEnergy: `${ea} kJ/mol`,
        concept: "Energy Level Diagram",
        meaning: isExothermic ? "Energy released to surroundings (Temp rises)" : "Energy absorbed from surroundings (Temp falls)"
    };
    const text = await explainConcept("Reaction Energy Profile", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  // SVG Path Generation
  // Curve from (0, R) to (50, Peak) to (100, P)
  // Using Cubic Bezier for smooth hump
  const width = 100; // percent
  // X coords: Reactants 0-20, Curve 20-80, Products 80-100
  const drawCurve = () => {
      // Coordinates are % based. Y is inverted in SVG (100-value)
      const rY = 100 - reactantE;
      const pY = 100 - productE;
      const aY = 100 - Math.max(activationE, Math.max(reactantE, productE) + 10); // Ensure peak is above both

      // Path: Move to start, line to reactant end, curve up to peak, curve down to product
      return `
        M 5 ${rY} 
        L 30 ${rY} 
        Q 50 ${aY} 70 ${pY}
        L 95 ${pY}
      `;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-pink-400"/> Energy Profile
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setPreset('exo')} className="flex-1 py-2 bg-red-900/30 border border-red-500/50 rounded text-red-300 text-sm hover:bg-red-900/50 flex items-center justify-center gap-1">
                    <Flame size={14}/> Exothermic
                </button>
                <button onClick={() => setPreset('endo')} className="flex-1 py-2 bg-blue-900/30 border border-blue-500/50 rounded text-blue-300 text-sm hover:bg-blue-900/50 flex items-center justify-center gap-1">
                    <Snowflake size={14}/> Endothermic
                </button>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="text-sm text-slate-300 mb-1 flex justify-between">
                        <span>Reactant Energy</span>
                        <span>{reactantE} kJ</span>
                    </label>
                    <input 
                        type="range" min="10" max="90" 
                        value={reactantE} onChange={e => setReactantE(Number(e.target.value))} 
                        className="w-full accent-slate-400 h-2 bg-slate-700 rounded-lg"
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-300 mb-1 flex justify-between">
                        <span>Product Energy</span>
                        <span>{productE} kJ</span>
                    </label>
                    <input 
                        type="range" min="10" max="90" 
                        value={productE} onChange={e => setProductE(Number(e.target.value))} 
                        className="w-full accent-slate-400 h-2 bg-slate-700 rounded-lg"
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-300 mb-1 flex justify-between">
                        <span>Peak Energy (Activation)</span>
                        <span>{Math.max(activationE, Math.max(reactantE, productE))} kJ</span>
                    </label>
                    <input 
                        type="range" min="10" max="100" 
                        value={activationE} onChange={e => setActivationE(Number(e.target.value))} 
                        className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-900 p-3 rounded border border-slate-600 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold">Enthalpy (ΔH)</div>
                        <div className={`text-xl font-bold ${deltaH < 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {deltaH > 0 ? '+' : ''}{deltaH}
                        </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold">Activation (Ea)</div>
                        <div className="text-xl font-bold text-yellow-400">
                            {Math.max(0, Math.max(activationE, Math.max(reactantE, productE)) - reactantE)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
                >
                    <Brain size={16} /> {loading ? "Thinking..." : "Explain Diagram"}
                </button>
                {explanation && (
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-32 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center p-8 relative overflow-hidden">
             <div className="absolute top-4 left-4 text-xs text-slate-500 font-bold uppercase">Potential Energy</div>
             <div className="absolute bottom-4 right-4 text-xs text-slate-500 font-bold uppercase">Reaction Progress</div>

             {/* Chart Area */}
             <div className="w-full h-full border-l-2 border-b-2 border-slate-500 relative">
                 <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                     {/* Path */}
                     <path 
                        d={drawCurve()} 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="1"
                     />

                     {/* Levels */}
                     <line x1="0" y1={100-reactantE} x2="35" y2={100-reactantE} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2 2"/>
                     <text x="2" y={100-reactantE-2} fontSize="3" fill="#94a3b8">Reactants</text>

                     <line x1="65" y1={100-productE} x2="100" y2={100-productE} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2 2"/>
                     <text x="85" y={100-productE-2} fontSize="3" fill="#94a3b8">Products</text>

                     {/* Activation Energy Arrow */}
                     <line x1="50" y1={100-reactantE} x2="50" y2={100-Math.max(activationE, Math.max(reactantE, productE))} stroke="#eab308" strokeWidth="0.5" markerEnd="url(#arrowhead-yellow)"/>
                     <text x="52" y={100-(reactantE + (Math.max(activationE, Math.max(reactantE, productE))-reactantE)/2)} fontSize="3" fill="#eab308">Ea</text>

                     {/* Delta H Arrow */}
                     <line x1="80" y1={100-reactantE} x2="80" y2={100-productE} stroke={deltaH < 0 ? '#f87171' : '#60a5fa'} strokeWidth="0.5" markerEnd={`url(#arrowhead-${deltaH<0 ? 'red' : 'blue'})`}/>
                     <text x="82" y={100-(reactantE + (productE-reactantE)/2)} fontSize="3" fill={deltaH < 0 ? '#f87171' : '#60a5fa'}>ΔH</text>

                     <defs>
                         <marker id="arrowhead-yellow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                             <polygon points="0 0, 10 3.5, 0 7" fill="#eab308" />
                         </marker>
                         <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                             <polygon points="0 0, 10 3.5, 0 7" fill="#f87171" />
                         </marker>
                         <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                             <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                         </marker>
                     </defs>
                 </svg>
             </div>
        </div>
    </div>
  );
};

export default EnergyProfileLab;


import React, { useState, useEffect, useRef } from 'react';
import { Droplets, RotateCcw, Brain, Layers, ArrowUp } from 'lucide-react';
import RotatableView from './ui/RotatableView';
import { explainConcept } from '../services/geminiService';

const ChromatographyLab: React.FC = () => {
    const [solventLevel, setSolventLevel] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [dyes, setDyes] = useState([
        { color: 'bg-red-500', rf: 0.3, y: 0, name: 'Red Dye A' },
        { color: 'bg-blue-500', rf: 0.7, y: 0, name: 'Blue Dye B' },
        { color: 'bg-yellow-400', rf: 0.5, y: 0, name: 'Yellow Dye C' }
    ]);
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRunning && solventLevel < 100) {
            interval = setInterval(() => {
                setSolventLevel(prev => prev + 0.5);
                
                // Move dyes based on Rf
                setDyes(currentDyes => currentDyes.map(dye => ({
                    ...dye,
                    // Dye moves at speed proportional to Rf * SolventSpeed
                    y: Math.min(dye.rf * (solventLevel + 0.5), dye.rf * 100) 
                })));

            }, 50);
        } else if (solventLevel >= 100) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, solventLevel]);

    const handleReset = () => {
        setIsRunning(false);
        setSolventLevel(0);
        setDyes(dyes.map(d => ({ ...d, y: 0 })));
        setExplanation("");
    };

    const handleExplain = async () => {
        setLoading(true);
        const data = {
            process: "Paper Chromatography",
            solventFront: "Top line",
            separationPrinciple: "Difference in solubility and attraction to paper",
            rfValues: dyes.map(d => `${d.name}: ${d.rf}`).join(", "),
            formula: "Rf = distance moved by spot / distance moved by solvent"
        };
        const text = await explainConcept("Chromatography Rf Values", data);
        setExplanation(text || "AI Error.");
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="text-purple-400"/> Chromatography
                    </h3>
                    <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                        <RotateCcw size={16} />
                    </button>
                </div>

                <p className="text-sm text-slate-400">
                    Separate the ink mixture based on the solubility of its components.
                </p>

                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase">Rf Values</h4>
                        {dyes.map((d, i) => (
                            <div key={i} className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${d.color}`}></div> {d.name}</span>
                                <span className="font-mono text-slate-400">{d.rf.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`w-full py-3 rounded-lg font-bold text-white ${isRunning ? 'bg-slate-600' : 'bg-purple-600 hover:bg-purple-500'}`}
                    >
                        {isRunning ? 'Running...' : 'Start Separation'}
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50">
                        <Brain size={16} /> {loading ? "Calculating..." : "Explain Rf"}
                    </button>
                    {explanation && (
                        <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                            {explanation}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-8">
                 <RotatableView className="w-full h-full flex items-center justify-center">
                     {/* Beaker */}
                     <div className="relative w-48 h-80 border-b-4 border-x-4 border-slate-600 rounded-b-xl bg-slate-800/20 backdrop-blur-sm transform-style-3d">
                         
                         {/* Solvent Pool */}
                         <div className="absolute bottom-0 w-full h-12 bg-blue-500/30 border-t border-blue-400/50"></div>

                         {/* Paper Strip */}
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-[90%] bg-white shadow-lg flex flex-col items-center overflow-hidden">
                             {/* Pencil Line */}
                             <div className="absolute bottom-16 w-full h-px bg-slate-300"></div>
                             <div className="absolute bottom-16 right-1 text-[8px] text-slate-400">Start Line</div>

                             {/* Solvent Front */}
                             <div 
                                className="absolute bottom-4 w-full bg-blue-100/30 border-t border-blue-300 transition-all duration-75"
                                style={{ height: `${solventLevel}%` }}
                             >
                                 <div className="absolute top-0 right-1 text-[8px] text-blue-500 -mt-3">Solvent Front</div>
                             </div>

                             {/* Dyes */}
                             {dyes.map((d, i) => (
                                 <div 
                                    key={i}
                                    className={`absolute w-4 h-4 rounded-full ${d.color} blur-[2px] opacity-80 transition-all duration-75`}
                                    style={{ 
                                        bottom: `${16 + d.y}%`, // Start at 16% (above solvent pool)
                                        left: `${30 + i * 20}%`
                                    }}
                                 ></div>
                             ))}
                         </div>

                         {/* Lid/Support */}
                         <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-700 rounded shadow-lg"></div>
                     </div>
                 </RotatableView>
            </div>
        </div>
    );
};

export default ChromatographyLab;


import React, { useState } from 'react';
import { Thermometer, Flame, Snowflake, Gauge, RotateCcw, Brain } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const PressureLab: React.FC = () => {
  const [volume, setVolume] = useState(50); // represents piston height
  const [temp, setTemp] = useState(300); // Kelvin
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // P = nRT/V (Ideal Gas Law)
  const pressure = (1000 * temp) / volume; 
  
  const handleReset = () => {
      setVolume(50);
      setTemp(300);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    const data = {
        volume: `${volume} units`,
        temperature: `${temp} K`,
        pressure: `${Math.round(pressure)} kPa`,
        law: "PV = nRT (Ideal Gas Law)"
    };
    const text = await explainConcept("Gas Laws", data);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  // Color calculation: Blue (100K) -> Purple -> Red (500K)
  const getTempColor = () => {
      const t = Math.max(100, Math.min(500, temp));
      const ratio = (t - 100) / 400; // 0 to 1
      const r = Math.round(20 + ratio * 180);
      const g = 50;
      const b = Math.round(200 - ratio * 150);
      return `rgb(${r}, ${g}, ${b})`;
  };

  const getGlowColor = () => {
      if (temp > 350) return 'rgba(239, 68, 68, 0.3)'; // Red glow
      if (temp < 250) return 'rgba(59, 130, 246, 0.3)'; // Blue glow
      return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Gauge className="text-purple-400"/> Gas Laws
                </h3>
                <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                    <RotateCcw size={16} />
                </button>
            </div>
            
            <div className="space-y-6 flex-1">
                <div>
                    <label className="text-sm text-slate-300">Volume (Piston Height)</label>
                    <input type="range" min="20" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full accent-purple-500"/>
                </div>
                <div>
                    <label className="flex justify-between text-sm text-slate-300">
                        <span>Temperature</span>
                        <span className={temp > 400 ? 'text-red-400' : temp < 200 ? 'text-blue-400' : 'text-white'}>{temp} K</span>
                    </label>
                    <input 
                        type="range" min="100" max="500" value={temp} 
                        onChange={e => setTemp(Number(e.target.value))} 
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer`}
                        style={{ background: `linear-gradient(to right, #3b82f6, #ef4444)` }}
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Snowflake size={10}/> Cold</span>
                        <span className="flex items-center gap-1">Hot <Flame size={10}/></span>
                    </div>
                </div>
                <div className="p-4 bg-slate-900 rounded text-center border border-slate-600">
                    <div className="text-sm text-slate-400">Pressure</div>
                    <div className="text-3xl font-mono font-bold text-white">{Math.round(pressure)} kPa</div>
                </div>
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
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                        {explanation}
                    </div>
                )}
            </div>
        </div>

        <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-10 relative overflow-hidden">
            {/* Ambient Temp Glow */}
            <div 
                className="absolute inset-0 transition-colors duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${getGlowColor()}, transparent 70%)` }}
            ></div>

            {/* Cylinder */}
            <div className="w-48 h-80 border-x-4 border-b-4 border-slate-500 relative bg-slate-800/80 backdrop-blur-sm transition-colors duration-500"
                 style={{ backgroundColor: getTempColor().replace('rgb', 'rgba').replace(')', ', 0.2)') }}
            >
                {/* Thermometer Visual */}
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                     <Thermometer size={24} className={temp > 350 ? 'text-red-500' : temp < 250 ? 'text-blue-500' : 'text-slate-400'} />
                     <div className="h-24 w-2 bg-slate-700 rounded-full relative overflow-hidden">
                         <div 
                            className={`absolute bottom-0 w-full transition-all duration-300 ${temp > 300 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ height: `${(temp/500)*100}%` }}
                         ></div>
                     </div>
                </div>

                {/* Piston */}
                <div 
                    className="w-full h-4 bg-slate-400 absolute transition-all duration-200 ease-out border-b border-slate-600 shadow-lg z-10"
                    style={{ top: `${100 - volume}%` }}
                >
                    {/* Rod */}
                    <div className="w-4 h-96 bg-slate-500 absolute bottom-full left-1/2 -translate-x-1/2"></div>
                </div>
                
                {/* Particles */}
                <div className="absolute bottom-0 w-full overflow-hidden" style={{ top: `${100 - volume}%` }}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`absolute w-2 h-2 rounded-full animate-bounce transition-colors duration-500 ${temp > 350 ? 'bg-red-200 shadow-[0_0_5px_red]' : 'bg-white'}`} style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.max(0.2, (500/temp) * 1.5)}s`
                        }}></div>
                    ))}
                </div>
            </div>

            {/* Heat Source / Sink Indicator */}
            <div className="mt-4 h-12 flex items-center justify-center relative">
                 {temp > 320 && (
                     <div className="flex gap-1 justify-center items-end animate-pulse">
                         {[...Array(Math.ceil((temp - 300) / 40))].map((_, i) => (
                             <Flame key={i} size={24 + i*4} className="text-orange-500 fill-orange-500/50 animate-flicker" style={{ animationDelay: `${i*0.1}s` }} />
                         ))}
                     </div>
                 )}
                 {temp < 280 && (
                     <div className="flex gap-2 justify-center items-center opacity-80">
                         <Snowflake size={24} className="text-blue-400 animate-spin-slow" />
                         <div className="text-blue-400 font-bold text-xs">COOLING</div>
                         <Snowflake size={18} className="text-blue-300 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                     </div>
                 )}
            </div>
        </div>
    </div>
  );
};

export default PressureLab;

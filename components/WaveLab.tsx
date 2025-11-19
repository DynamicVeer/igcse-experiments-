
import React, { useRef, useEffect, useState } from 'react';
import { Brain, RotateCcw, Settings2 } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const WaveLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [freq1, setFreq1] = useState(5);
  const [freq2, setFreq2] = useState(5);
  const [phaseOffset, setPhaseOffset] = useState(0);
  const [showSum, setShowSum] = useState(true);
  const [speed, setSpeed] = useState(1);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.05 * speed;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Wave 1 (Red)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)'; // Red
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = Math.sin((x * 0.05) + (time * freq1 * 0.05)) * 40;
        if (x === 0) ctx.moveTo(x, centerY + y);
        else ctx.lineTo(x, centerY + y);
      }
      ctx.stroke();

      // Wave 2 (Blue)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'; // Blue
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = Math.sin((x * 0.05) + (time * freq2 * 0.05) + phaseOffset) * 40;
        if (x === 0) ctx.moveTo(x, centerY + y);
        else ctx.lineTo(x, centerY + y);
      }
      ctx.stroke();

      // Superposition (White)
      if (showSum) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        for (let x = 0; x < width; x++) {
            const y1 = Math.sin((x * 0.05) + (time * freq1 * 0.05)) * 40;
            const y2 = Math.sin((x * 0.05) + (time * freq2 * 0.05) + phaseOffset) * 40;
            const ySum = y1 + y2;
            if (x === 0) ctx.moveTo(x, centerY + ySum);
            else ctx.lineTo(x, centerY + ySum);
        }
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [freq1, freq2, phaseOffset, showSum, speed]);

  const handleExplain = async () => {
      setLoading(true);
      const result = await explainConcept("Wave Superposition", {
          frequency1: freq1,
          frequency2: freq2,
          phaseDifference: phaseOffset
      });
      setExplanation(result || "Error getting explanation.");
      setLoading(false);
  };

  const handleReset = () => {
      setFreq1(5);
      setFreq2(5);
      setPhaseOffset(0);
      setSpeed(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
         <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-white">Wave Properties</h3>
             <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset Defaults">
                 <RotateCcw size={16} />
             </button>
         </div>
         <p className="text-slate-400 text-sm">Explore constructive and destructive interference by adjusting two waves.</p>
         
         <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-rose-400">Wave 1 Frequency</label>
                <input type="range" min="1" max="20" value={freq1} onChange={e => setFreq1(Number(e.target.value))} className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
            </div>
            <div>
                <label className="text-xs font-bold text-sky-400">Wave 2 Frequency</label>
                <input type="range" min="1" max="20" value={freq2} onChange={e => setFreq2(Number(e.target.value))} className="w-full accent-sky-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-300">Phase Shift</label>
                <input type="range" min="0" max={Math.PI*2} step="0.1" value={phaseOffset} onChange={e => setPhaseOffset(Number(e.target.value))} className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
            </div>
            
            {/* Speed Control */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-bold uppercase">
                   <Settings2 size={12} /> Simulation Speed
               </div>
               <div className="flex gap-1">
                   {[0.5, 1, 2].map(s => (
                       <button
                           key={s}
                           onClick={() => setSpeed(s)}
                           className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                               speed === s 
                               ? 'bg-sky-600 text-white' 
                               : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                           }`}
                       >
                           {s}x
                       </button>
                   ))}
               </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={showSum} onChange={e => setShowSum(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-emerald-500" />
                <label className="text-sm text-slate-200">Show Resultant Wave</label>
            </div>
         </div>

         <div className="pt-4 border-t border-slate-700">
             <button 
                onClick={handleExplain}
                disabled={loading}
                className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
             >
                <Brain size={16} /> {loading ? "Thinking..." : "Explain Interference"}
             </button>
             {explanation && (
                 <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in">
                     {explanation}
                 </div>
             )}
         </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center relative">
          <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono space-y-1">
              <div className="text-rose-400">Wave 1: y = A sin(ω₁t + kx)</div>
              <div className="text-sky-400">Wave 2: y = A sin(ω₂t + kx + φ)</div>
              <div className="text-white">Sum: y = y₁ + y₂</div>
          </div>
      </div>
    </div>
  );
};

export default WaveLab;

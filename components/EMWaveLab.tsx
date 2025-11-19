
import React, { useRef, useEffect, useState } from 'react';
import { Radio, RotateCcw, Brain, Settings2, ArrowRight } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

const EMWaveLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frequency, setFrequency] = useState(2); // Hz approx
  const [amplitude, setAmplitude] = useState(50); // px
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);
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
      const startX = 50;
      const endX = width - 50;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw Axis (Propagation Direction)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.stroke();

      // Arrow head for propagation
      ctx.beginPath();
      ctx.moveTo(endX, centerY);
      ctx.lineTo(endX - 10, centerY - 5);
      ctx.lineTo(endX - 10, centerY + 5);
      ctx.fill();

      // Wave Parameters
      const wavelength = 200; 
      // k = 2PI / lambda
      const k = (Math.PI * 2) / (wavelength / frequency); // Adjust wavelength with freq for visual effect
      // Or better: Keep wavelength constant visually or allow freq to change k? 
      // Let's make freq change the density of waves (k).
      const waveK = 0.02 * frequency; 

      // Draw Fields
      // Loop through x points
      for (let x = startX; x < endX; x += 5) {
          const relativeX = x - startX;
          const phase = waveK * relativeX - time;
          const val = Math.sin(phase);
          
          // 1. Electric Field (E) - Vertical (Red)
          if (showE) {
              const yE = val * amplitude;
              
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'; // Rose-500
              ctx.lineWidth = 2;
              ctx.moveTo(x, centerY);
              ctx.lineTo(x, centerY - yE);
              ctx.stroke();
              
              // Arrow head for vector
              if (Math.abs(yE) > 5) {
                  ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
                  ctx.beginPath();
                  ctx.arc(x, centerY - yE, 2, 0, Math.PI*2);
                  ctx.fill();
              }
          }

          // 2. Magnetic Field (B) - Horizontal/Diagonal (Blue)
          // To simulate 3D Z-axis, we project diagonal: x' = x - z*cos(45), y' = y + z*sin(45)
          // We want B to be perpendicular to E and Propagation.
          // E is Y-axis. Prop is X-axis. B is Z-axis.
          // Visual Z-axis: Slanted.
          if (showB) {
              const zB = val * amplitude;
              // Projection angle for Z-axis (isometric-ish)
              const slantX = zB * 0.5; 
              const slantY = zB * 0.5; 

              ctx.beginPath();
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'; // Sky-400
              ctx.lineWidth = 2;
              ctx.moveTo(x, centerY);
              ctx.lineTo(x - slantX, centerY + slantY);
              ctx.stroke();

              if (Math.abs(zB) > 5) {
                  ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
                  ctx.beginPath();
                  ctx.arc(x - slantX, centerY + slantY, 2, 0, Math.PI*2);
                  ctx.fill();
              }
          }
      }

      // Draw Envelopes (The sine curves connecting tips)
      if (showE) {
          ctx.beginPath();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          for (let x = startX; x < endX; x += 2) {
              const phase = waveK * (x - startX) - time;
              const yE = Math.sin(phase) * amplitude;
              if (x === startX) ctx.moveTo(x, centerY - yE);
              else ctx.lineTo(x, centerY - yE);
          }
          ctx.stroke();
      }

      if (showB) {
          ctx.beginPath();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          for (let x = startX; x < endX; x += 2) {
              const phase = waveK * (x - startX) - time;
              const zB = Math.sin(phase) * amplitude;
              const slantX = zB * 0.5; 
              const slantY = zB * 0.5; 
              if (x === startX) ctx.moveTo(x - slantX, centerY + slantY);
              else ctx.lineTo(x - slantX, centerY + slantY);
          }
          ctx.stroke();
      }
      
      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText('Propagation (c)', endX - 20, centerY + 20);

      if (showE) {
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('E-Field', startX, centerY - amplitude - 10);
      }
      if (showB) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('B-Field', startX, centerY + amplitude + 20);
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [frequency, amplitude, showE, showB, speed]);

  const handleExplain = async () => {
      setLoading(true);
      const data = {
          concept: "Electromagnetic Wave",
          components: "Electric Field (E) and Magnetic Field (B)",
          relationship: "Oscillate in phase, perpendicular to each other and direction of travel",
          properties: {
              frequency: "Determines color/type (Radio -> Gamma)",
              amplitude: "Determines intensity/brightness"
          }
      };
      const text = await explainConcept("Electromagnetic Waves", data);
      setExplanation(text || "Error getting explanation.");
      setLoading(false);
  };

  const handleReset = () => {
      setFrequency(2);
      setAmplitude(50);
      setSpeed(1);
      setShowE(true);
      setShowB(true);
      setExplanation("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
         <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Radio className="text-rose-400"/> EM Waves
             </h3>
             <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                 <RotateCcw size={16} />
             </button>
         </div>
         
         <p className="text-slate-400 text-sm">
             Visualizing transverse electromagnetic waves. <br/>
             <span className="text-rose-400 font-bold">E-Field</span> and <span className="text-sky-400 font-bold">B-Field</span> are orthogonal.
         </p>

         <div className="space-y-5 flex-1">
            <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Frequency (f)</label>
                <input type="range" min="1" max="5" step="0.1" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"/>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-300 uppercase">Amplitude (A)</label>
                <input type="range" min="20" max="100" value={amplitude} onChange={e => setAmplitude(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2"/>
            </div>
            
            {/* Toggles */}
            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={showE} onChange={e => setShowE(e.target.checked)} className="w-4 h-4 rounded border-rose-500 bg-slate-900 text-rose-500 focus:ring-0 accent-rose-500"/>
                    Show E-Field
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={showB} onChange={e => setShowB(e.target.checked)} className="w-4 h-4 rounded border-sky-500 bg-slate-900 text-sky-500 focus:ring-0 accent-sky-500"/>
                    Show B-Field
                </label>
            </div>

            {/* Speed Control */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-bold uppercase">
                   <Settings2 size={12} /> Wave Speed (c)
               </div>
               <div className="flex gap-1">
                   {[0.5, 1, 2, 4].map(s => (
                       <button
                           key={s}
                           onClick={() => setSpeed(s)}
                           className={`flex-1 py-1 text-xs rounded font-medium transition-colors ${
                               speed === s 
                               ? 'bg-indigo-600 text-white' 
                               : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                           }`}
                       >
                           {s}x
                       </button>
                   ))}
               </div>
            </div>
         </div>

         <div className="pt-4 border-t border-slate-700">
             <button 
                onClick={handleExplain}
                disabled={loading}
                className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50"
             >
                <Brain size={16} /> {loading ? "Thinking..." : "Explain EM Physics"}
             </button>
             {explanation && (
                 <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                     {explanation}
                 </div>
             )}
         </div>
      </div>

      <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
          <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />
          
          {/* Coordinate Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/80 p-2 rounded border border-slate-600 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-rose-500"></div> E-Field (Vertical)</div>
              <div className="flex items-center gap-2 mt-1"><div className="w-3 h-0.5 bg-sky-400 rotate-45 origin-left"></div> B-Field (Horizontal)</div>
              <div className="flex items-center gap-2 mt-1"><div className="w-3 h-0.5 bg-slate-400"></div> Direction (v)</div>
          </div>
      </div>
    </div>
  );
};

export default EMWaveLab;

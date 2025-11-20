
import React, { useState, useRef, useEffect } from 'react';
import { Zap, Plus, Minus, RotateCcw, Brain } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

interface Charge { id: number; x: number; y: number; q: number; }

const ElectricFieldLab: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([{ id: 1, x: 300, y: 250, q: 1 }, { id: 2, x: 500, y: 250, q: -1 }]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      const hit = charges.find(c => Math.hypot(c.x - (e.clientX - rect.left), c.y - (e.clientY - rect.top)) < 25);
      if (hit) setDraggingId(hit.id);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
      if (draggingId === null) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      setCharges(prev => prev.map(c => c.id === draggingId ? { ...c, x: e.clientX - rect.left, y: e.clientY - rect.top } : c));
  };
  const handleMouseUp = () => setDraggingId(null);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      const seeds = charges.filter(c => c.q > 0).length > 0 ? charges.filter(c => c.q > 0) : charges;
      seeds.forEach(c => {
          for (let i = 0; i < 16; i++) {
              let cx = c.x, cy = c.y;
              const angle = (Math.PI * 2 * i) / 16;
              cx += Math.cos(angle) * 10; cy += Math.sin(angle) * 10;
              ctx.beginPath(); ctx.moveTo(cx, cy);
              for (let s = 0; s < 100; s++) {
                  let Ex = 0, Ey = 0;
                  charges.forEach(ch => {
                      const dx = cx - ch.x, dy = cy - ch.y;
                      const r2 = dx*dx + dy*dy;
                      const E = (ch.q * 2000) / (r2 + 1);
                      Ex += E * dx/Math.sqrt(r2); Ey += E * dy/Math.sqrt(r2);
                  });
                  const mag = Math.sqrt(Ex*Ex + Ey*Ey);
                  if (mag === 0) break;
                  cx += (Ex/mag)*8 * (c.q > 0 ? 1 : -1); cy += (Ey/mag)*8 * (c.q > 0 ? 1 : -1);
                  ctx.lineTo(cx, cy);
                  if (charges.some(target => Math.hypot(cx - target.x, cy - target.y) < 15)) break;
              }
              ctx.stroke();
          }
      });

      charges.forEach(c => {
          ctx.beginPath(); ctx.arc(c.x, c.y, 15, 0, Math.PI*2);
          ctx.fillStyle = c.q > 0 ? '#ef4444' : '#3b82f6'; ctx.fill();
          ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y);
      });
  }, [charges]);

  const handleExplain = async () => {
      setLoading(true);
      const text = await explainConcept("Electric Fields", { charges: charges.length });
      setExplanation(text || "Error."); setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="text-yellow-400"/> Electric Fields</h3><button onClick={() => {setCharges([]); setExplanation("");}} className="p-2 hover:bg-slate-700 rounded-full text-slate-400"><RotateCcw size={16}/></button></div>
            <div className="flex gap-2"><button onClick={() => setCharges([...charges, {id: Date.now(), x: 400, y: 300, q: 1}])} className="flex-1 py-2 bg-slate-700 text-red-400 rounded"><Plus size={16} className="inline"/> Positive</button><button onClick={() => setCharges([...charges, {id: Date.now(), x: 400, y: 300, q: -1}])} className="flex-1 py-2 bg-slate-700 text-blue-400 rounded"><Minus size={16} className="inline"/> Negative</button></div>
            <div className="pt-4 border-t border-slate-700"><button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded hover:bg-cyan-900/50"><Brain size={16} className="inline"/> Explain</button>{explanation && <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300">{explanation}</div>}</div>
        </div>
        <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden cursor-crosshair">
            <canvas ref={canvasRef} width={800} height={600} className="w-full h-full object-cover" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}/>
        </div>
    </div>
  );
};

export default ElectricFieldLab;

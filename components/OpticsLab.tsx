
import React, { useState, useRef, useEffect } from 'react';
import { Sun, RotateCcw, Brain, Layers, Circle, Triangle, Search, ChevronDown, ArrowRight } from 'lucide-react';
import { explainConcept } from '../services/geminiService';

type OpticsMode = 'block' | 'prism' | 'convex' | 'concave' | 'mirror';

const OpticsLab: React.FC = () => {
  const [mode, setMode] = useState<OpticsMode>('block');
  const [angle, setAngle] = useState(30); // Incident angle
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [focalLength, setFocalLength] = useState(100); // Pixels
  const [objectDistance, setObjectDistance] = useState(200); // Pixels
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const canvas = canvasRef.current;
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      if(!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);
      
      // Draw Optical Axis
      ctx.beginPath();
      ctx.strokeStyle = '#334155'; // Slate-700
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      if (mode === 'block') {
          drawBlock(ctx, cx, cy, width, height);
      } else if (mode === 'prism') {
          drawPrism(ctx, cx, cy);
      } else if (mode === 'convex') {
          drawConvexLens(ctx, cx, cy);
      } else if (mode === 'concave') {
          drawConcaveLens(ctx, cx, cy);
      } else if (mode === 'mirror') {
          drawConcaveMirror(ctx, cx, cy);
      }

  }, [mode, angle, refractiveIndex, focalLength, objectDistance]);

  // --- Drawing Functions ---

  const drawBlock = (ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) => {
      // Glass Block
      ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
      ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 100, cy - 75, 200, 150);
      ctx.strokeRect(cx - 100, cy - 75, 200, 150);

      // Normal line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Incident Ray
      const rad = (angle * Math.PI) / 180;
      const incidentLen = 300;
      const startX = cx - Math.sin(rad) * incidentLen;
      const startY = (cy - 75) - Math.cos(rad) * incidentLen;

      drawRay(ctx, startX, startY, cx, cy - 75, '#ef4444'); // Red Input

      // Refracted Ray
      const sinR = Math.sin(rad) / refractiveIndex;
      const rRad = Math.asin(sinR);
      const blockHeight = 150;
      const dx = Math.tan(rRad) * blockHeight;
      
      drawRay(ctx, cx, cy - 75, cx + dx, cy + 75, '#ef4444'); // Inside

      // Emergent Ray
      const emergentLen = 300;
      const ex = (cx + dx) + Math.sin(rad) * emergentLen;
      const ey = (cy + 75) + Math.cos(rad) * emergentLen;

      drawRay(ctx, cx + dx, cy + 75, ex, ey, '#ef4444', true); // Output
  };

  const drawPrism = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      const size = 150;
      const h = size * (Math.sqrt(3)/2);
      
      // Vertices (Equilateral Triangle centered)
      const p1 = { x: cx, y: cy - h/1.5 }; // Top
      const p2 = { x: cx - size/2, y: cy + h/3 }; // Bottom Left
      const p3 = { x: cx + size/2, y: cy + h/3 }; // Bottom Right

      ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
      ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Simplified Ray Tracing for equilateral prism
      const hit1X = cx - size/4; 
      const hit1Y = cy; 
      
      const angleRad = (angle * Math.PI) / 180;
      const startX = hit1X - Math.cos(angleRad) * 200;
      const startY = hit1Y + Math.sin(angleRad) * 200;

      drawRay(ctx, startX, startY, hit1X, hit1Y, '#ef4444');

      const bendFactor = (refractiveIndex - 1) * 15; 
      const hit2X = cx + size/4;
      const hit2Y = hit1Y + bendFactor;

      drawRay(ctx, hit1X, hit1Y, hit2X, hit2Y, '#ef4444');

      const exitX = hit2X + 200;
      const exitY = hit2Y + bendFactor * 2; 
      
      drawRay(ctx, hit2X, hit2Y, exitX, exitY, '#ef4444', true);
      
      if (refractiveIndex > 1.2) {
        ctx.globalAlpha = 0.5;
        drawRay(ctx, hit2X, hit2Y, exitX, exitY - 20, '#8b5cf6', true); 
        drawRay(ctx, hit2X, hit2Y, exitX, exitY + 5, '#ef4444', true); 
        ctx.globalAlpha = 1.0;
      }
  };

  const drawConvexLens = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      // Lens Shape
      ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 15, 120, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Focal Points
      drawFocus(ctx, cx + focalLength, cy, 'F');
      drawFocus(ctx, cx - focalLength, cy, 'F\'');
      drawFocus(ctx, cx + 2*focalLength, cy, '2F');
      drawFocus(ctx, cx - 2*focalLength, cy, '2F\'');

      // Object (Arrow)
      const objH = 60;
      const objX = cx - objectDistance;
      const objY = cy - objH;
      
      // Draw Object
      drawArrow(ctx, objX, cy, objX, objY, '#fbbf24', "Object");

      // Image Calculation (1/v - 1/u = 1/f) => v = (uf) / (u+f)
      // u is negative (left of lens)
      const u = -objectDistance;
      const f = focalLength;
      const v = (u * f) / (u + f);
      const m = v / u;
      const imgH = objH * m;
      const imgX = cx + v;
      const imgY = cy - imgH; // Because Y is inverted in canvas (down is positive), but h is height "up" from axis? 
      // Let's track Y coords. Object tip is at (objX, cy - 60).
      // Image tip is at (imgX, cy + something).
      // m is negative for real image (inverted).
      // if m = -1, image tip is at cy - (-60) = cy + 60 (Below axis). Correct.

      // Rays
      // 1. Parallel to axis -> Refracts through F
      drawRay(ctx, objX, objY, cx, objY, '#ef4444');
      drawRay(ctx, cx, objY, cx + 400, objY + (400/f)*(objY-cy)*-1, '#ef4444', false); // Basic slope calc
      // Better: from (cx, objY) through (cx+f, cy)
      // Slope = (cy - objY) / f
      // Y at x = imgX: cy + slope * v = cy + (cy-objY)/f * v = cy - h * (v/f) ... complicated.
      // Just draw segment to image tip if real, or extend back if virtual.
      
      const isReal = v > 0;

      // Ray 1 Path: Tip -> Lens(parallel) -> Focus -> Image Tip
      drawRay(ctx, objX, objY, cx, objY, '#ef4444'); // To Lens
      if (isReal) {
          drawRay(ctx, cx, objY, imgX, cy + (cy-objY)*m, '#ef4444', true); // To Image
      } else {
          // Virtual: Diverges, but trace back hits image
          // Draw solid ray diverging
          const slope = (cy - objY) / f; 
          drawRay(ctx, cx, objY, cx + 300, objY + slope * 300, '#ef4444', true);
          // Draw dashed back to image
          ctx.setLineDash([4, 4]);
          drawRay(ctx, cx, objY, imgX, cy + (cy-objY)*m, '#ef4444', false);
          ctx.setLineDash([]);
      }

      // Ray 2 Path: Tip -> Center -> Image Tip (Undeviated)
      if (isReal) {
          drawRay(ctx, objX, objY, imgX, cy + (cy-objY)*m, '#22c55e', false);
      } else {
           drawRay(ctx, objX, objY, cx + 300, cy + ((cy-objY)/(-objectDistance))*300, '#22c55e', true); // Continue forward
           ctx.setLineDash([4, 4]);
           drawRay(ctx, objX, objY, imgX, cy + (cy-objY)*m, '#22c55e', false); // Back trace
           ctx.setLineDash([]);
      }

      // Draw Image
      const imageYTip = cy + (cy - objY) * m;
      const isVirtual = v < 0;
      drawArrow(ctx, imgX, cy, imgX, imageYTip, isVirtual ? '#a8a29e' : '#fbbf24', isVirtual ? "Virtual Image" : "Real Image");
  };

  const drawConcaveLens = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      // Lens Shape
      ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.clearRect(cx-15, cy-100, 30, 200);
      ctx.beginPath();
      ctx.moveTo(cx-15, cy-100);
      ctx.lineTo(cx+15, cy-100);
      ctx.quadraticCurveTo(cx+5, cy, cx+15, cy+100);
      ctx.lineTo(cx-15, cy+100);
      ctx.quadraticCurveTo(cx-5, cy, cx-15, cy-100);
      ctx.fill();
      ctx.stroke();

      // Focal Points
      drawFocus(ctx, cx - focalLength, cy, 'F');

      // Just parallel rays for now as requested focus is Convex
      const rayY = [cy - 60, cy - 30, cy, cy + 30, cy + 60];
      rayY.forEach(y => {
          drawRay(ctx, 0, y, cx, y, '#ef4444'); 
          if (Math.abs(y - cy) < 1) {
              drawRay(ctx, cx, y, cx + 400, y, '#ef4444', true);
          } else {
              const slope = (y - cy) / focalLength; 
              const destX = cx + 400;
              const destY = y + slope * 400;
              drawRay(ctx, cx, y, destX, destY, '#ef4444', true);
              ctx.setLineDash([2, 4]);
              ctx.globalAlpha = 0.5;
              drawRay(ctx, cx - focalLength, cy, cx, y, '#ef4444', false);
              ctx.setLineDash([]);
              ctx.globalAlpha = 1.0;
          }
      });
  };

  const drawConcaveMirror = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx + 50, cy, 150, Math.PI - 0.5, Math.PI + 0.5); 
      ctx.stroke();

      const realFocusX = (cx + 50) - focalLength;
      drawFocus(ctx, realFocusX, cy, 'F');

      const rayY = [cy - 60, cy - 30, cy, cy + 30, cy + 60];
      rayY.forEach(y => {
          const hitX = cx + 50 - (Math.pow(y-cy, 2) / 300);
          drawRay(ctx, 0, y, hitX, y, '#ef4444');
          if (Math.abs(y - cy) < 1) {
              drawRay(ctx, hitX, y, 0, y, '#ef4444', true);
          } else {
              const slope = (cy - y) / (realFocusX - hitX);
              const destX = 0;
              const destY = y - slope * hitX; 
              drawRay(ctx, hitX, y, destX, destY, '#ef4444', true);
          }
      });
  };

  const drawRay = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, arrow: boolean = false) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (arrow) {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const angle = Math.atan2(y2 - y1, x2 - x1);
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX - 10 * Math.cos(angle - Math.PI / 6), midY - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(midX - 10 * Math.cos(angle + Math.PI / 6), midY - 10 * Math.sin(angle + Math.PI / 6));
          ctx.lineTo(midX, midY);
          ctx.fillStyle = color;
          ctx.fill();
      }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, label: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Arrow head at x2, y2
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(x2, y2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(label, x1 - 10, y2 - 10);
  };

  const drawFocus = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string) => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(label, x - 5, y + 15);
  };

  const handleReset = () => {
      setAngle(30);
      setRefractiveIndex(1.5);
      setFocalLength(100);
      setObjectDistance(200);
      setExplanation("");
  };

  const handleExplain = async () => {
    setLoading(true);
    
    let promptData: any = {};
    let topic = "";

    if (mode === 'block') {
        topic = "Refraction through Glass Block";
        promptData = { angle: `${angle}°`, index: refractiveIndex };
    } else if (mode === 'convex') {
        topic = "Convex Lens Image Formation";
        const u = objectDistance;
        const f = focalLength;
        const v = (u * f) / (u - f); // Calc for real v magnitude if u > f
        
        promptData = {
            focalLength: focalLength,
            objectDistance: objectDistance,
            imageType: objectDistance > focalLength ? "Real, Inverted" : "Virtual, Upright, Magnified",
            magnification: (v/u).toFixed(2)
        };
    } else {
        topic = "Optical System";
        promptData = { mode: mode };
    }

    const text = await explainConcept(topic, promptData);
    setExplanation(text || "Error connecting to AI.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
           <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Sun className="text-blue-400"/> Optics Bench
               </h3>
               <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400" title="Reset">
                   <RotateCcw size={16} />
               </button>
           </div>
           
           <div className="space-y-6 flex-1">
               {/* Mode Selector */}
               <div>
                   <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">Optical Element</label>
                   <div className="relative">
                       <select 
                           value={mode} 
                           onChange={(e) => setMode(e.target.value as OpticsMode)}
                           className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:border-blue-500 focus:outline-none"
                       >
                           <option value="block">Glass Block (Refraction)</option>
                           <option value="prism">Triangular Prism</option>
                           <option value="convex">Convex Lens (Converging)</option>
                           <option value="concave">Concave Lens (Diverging)</option>
                           <option value="mirror">Concave Mirror</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
                   </div>
               </div>

               {/* Dynamic Controls */}
               {(mode === 'block' || mode === 'prism') && (
                   <>
                       <div>
                           <label className="flex justify-between text-sm text-slate-300 mb-1">
                               <span>Incidence Angle</span>
                               <span>{angle}°</span>
                           </label>
                           <input type="range" min="0" max="60" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg"/>
                       </div>
                       <div>
                           <label className="flex justify-between text-sm text-slate-300 mb-1">
                               <span>Refractive Index (n)</span>
                               <span>{refractiveIndex}</span>
                           </label>
                           <input type="range" min="1" max="2.5" step="0.1" value={refractiveIndex} onChange={e => setRefractiveIndex(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg"/>
                       </div>
                   </>
               )}

               {(mode === 'convex' || mode === 'concave' || mode === 'mirror') && (
                   <>
                       <div>
                           <label className="flex justify-between text-sm text-slate-300 mb-1">
                               <span>Focal Length (f)</span>
                               <span>{focalLength} px</span>
                           </label>
                           <input type="range" min="50" max="150" step="10" value={focalLength} onChange={e => setFocalLength(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg"/>
                       </div>
                       {mode === 'convex' && (
                           <div>
                               <label className="flex justify-between text-sm text-slate-300 mb-1">
                                   <span>Object Distance (u)</span>
                                   <span>{objectDistance} px</span>
                               </label>
                               <input type="range" min="50" max="350" step="10" value={objectDistance} onChange={e => setObjectDistance(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg"/>
                           </div>
                       )}
                   </>
               )}

               <div className="bg-slate-900 p-4 rounded border border-slate-600 flex items-center gap-3">
                   {mode === 'block' && <Layers size={24} className="text-slate-400"/>}
                   {mode === 'prism' && <Triangle size={24} className="text-slate-400"/>}
                   {(mode === 'convex' || mode === 'concave') && <Search size={24} className="text-slate-400"/>}
                   {mode === 'mirror' && <Circle size={24} className="text-slate-400"/>}
                   
                   <div>
                       <div className="text-xs text-slate-400 uppercase font-bold">Active Element</div>
                       <div className="text-blue-400 font-medium capitalize">{mode}</div>
                   </div>
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
                    <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in border-l-2 border-cyan-500 max-h-40 overflow-y-auto custom-scrollbar">
                        {explanation}
                    </div>
                )}
            </div>
       </div>
       
       <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center p-4 overflow-hidden relative">
           <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono z-10 pointer-events-none">
               Ray Trace Engine v2.0
           </div>
           <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain"/>
       </div>
    </div>
  );
};

export default OpticsLab;

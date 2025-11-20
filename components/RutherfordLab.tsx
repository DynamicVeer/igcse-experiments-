
import React, { useState, useRef, useEffect } from 'react';
import { Atom, RotateCcw, Brain, ChevronRight, Settings2 } from 'lucide-react';
import RotatableView from './ui/RotatableView';
import { explainConcept } from '../services/geminiService';

const RutherfordLab: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [alphaEnergy, setAlphaEnergy] = useState(5); // MeV approx relative scale
    const [nucleusZ, setNucleusZ] = useState(79); // Gold
    const [particles, setParticles] = useState<{x: number, y: number, z: number, vx: number, vy: number, vz: number, trace: {x:number, z:number}[]}[]>([]);
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(true);

    // Simulation Constants
    const k = 100; // Coulomb constant visual scale

    useEffect(() => {
        // Initialize batch of particles
        if (particles.length === 0) {
            const newParticles = [];
            for (let i = -10; i <= 10; i++) {
                newParticles.push({
                    x: -300, // Start left
                    y: 0,
                    z: i * 15, // Spread vertically in Z
                    vx: alphaEnergy * 2,
                    vy: 0,
                    vz: 0,
                    trace: []
                });
            }
            setParticles(newParticles);
        }
    }, [particles.length, alphaEnergy]);

    useEffect(() => {
        let frameId: number;
        
        const update = () => {
            if (!isRunning) return;

            setParticles(prev => prev.map(p => {
                // If far away, stop calculating
                if (p.x > 300 || p.x < -310 || Math.abs(p.z) > 200) return p;

                // Distance to Nucleus (at 0,0,0)
                const d2 = p.x*p.x + p.z*p.z; // Simplified to 2D plane for visual clarity mainly, but we render in 3D
                const d = Math.sqrt(d2);
                
                if (d < 2) return p; // Collision/Clamping

                // Coulomb Force F = k * q1 * q2 / r^2
                // q1 (alpha) = 2, q2 (gold) = 79
                const F = (k * 2 * nucleusZ) / d2;
                
                // Components
                const fx = F * (-p.x / d); // Repulsive
                const fz = F * (-p.z / d); // Z is the deflection plane here
                
                // Update Velocity (F = ma, assume m=1 for alpha)
                const vx = p.vx + fx * 0.1;
                const vz = p.vz + fz * 0.1;

                // Update Position
                const x = p.x + vx * 0.1;
                const z = p.z + vz * 0.1;

                // Trace management
                const newTrace = p.x % 5 < 1 ? [...p.trace, {x, z}] : p.trace;

                return { ...p, x, z, vx, vz, trace: newTrace };
            }));

            frameId = requestAnimationFrame(update);
        };

        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [isRunning, nucleusZ, alphaEnergy]);

    // Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Render function called by RotatableView context? 
        // Actually RotatableView handles DOM elements. We can just render to canvas and let RotatableView transform the canvas container?
        // No, for best particle trails, 2D canvas inside a 3D transformed div works, but "true" 3D lines are better drawn relative to rotation.
        // Let's stick to: Render top-down view on canvas, transform canvas container in 3D.
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Draw Nucleus
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.beginPath();
        ctx.arc(cx, cy, Math.sqrt(nucleusZ)/2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Particles
        particles.forEach(p => {
            // Draw Trace
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.lineWidth = 1;
            p.trace.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(cx + pt.x, cy + pt.z);
                else ctx.lineTo(cx + pt.x, cy + pt.z);
            });
            ctx.stroke();

            // Draw Head
            ctx.fillStyle = '#f87171';
            ctx.beginPath();
            ctx.arc(cx + p.x, cy + p.z, 2, 0, Math.PI*2);
            ctx.fill();
        });

    }, [particles, nucleusZ]);

    const handleReset = () => {
        setParticles([]);
        setIsRunning(true);
    };

    const handleExplain = async () => {
        setLoading(true);
        const data = {
            experiment: "Rutherford Alpha Scattering",
            observations: "Most pass straight through. Some deflect. Very few bounce back.",
            conclusion: "Atom is mostly empty space. Positive charge concentrated in tiny nucleus.",
            parameters: `Alpha Energy: ${alphaEnergy}, Nucleus Z: ${nucleusZ}`
        };
        const text = await explainConcept("Atomic Structure Evidence", data);
        setExplanation(text || "AI Error.");
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Atom className="text-yellow-400"/> Rutherford Lab
                    </h3>
                    <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                        <RotateCcw size={16} />
                    </button>
                </div>

                <div className="space-y-6 flex-1">
                    <div>
                        <label className="text-xs font-bold text-slate-300 uppercase">Alpha Particle Energy</label>
                        <input type="range" min="1" max="10" value={alphaEnergy} onChange={e => { setAlphaEnergy(Number(e.target.value)); handleReset(); }} className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg mt-2"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-300 uppercase">Nucleus Size (Z)</label>
                        <input type="range" min="10" max="100" value={nucleusZ} onChange={e => setNucleusZ(Number(e.target.value))} className="w-full accent-yellow-500 h-2 bg-slate-700 rounded-lg mt-2"/>
                        <div className="text-right text-xs text-slate-500 mt-1">Z = {nucleusZ} (Gold ~ 79)</div>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                        <h4 className="text-sm font-bold text-white mb-2">Key Observations</h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                            <li>Most α-particles pass undeflected (Empty space).</li>
                            <li>Small deflections occur near nucleus (Repulsion).</li>
                            <li>Large deflections (>90°) happen rarely (Direct hit).</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <button onClick={handleExplain} disabled={loading} className="w-full py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-900/50">
                        <Brain size={16} /> {loading ? "Analyzing..." : "Explain Experiment"}
                    </button>
                    {explanation && (
                        <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-300 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                            {explanation}
                        </div>
                    )}
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute top-4 left-4 z-10 bg-black/40 px-3 py-1 rounded-full text-xs text-slate-400 pointer-events-none">
                     Top-Down View (Rotate to see plane)
                 </div>
                 
                 <RotatableView className="w-full h-full flex items-center justify-center" initialRotation={{x: 45, y: 0}}>
                     <div className="relative w-[600px] h-[400px] bg-slate-900/50 border border-slate-700 rounded-lg shadow-2xl transform-style-3d">
                         {/* Canvas showing trajectories */}
                         <canvas ref={canvasRef} width={600} height={400} className="absolute inset-0" />
                         
                         {/* 3D Nucleus Representation sticking out */}
                         <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-yellow-500 rounded-full shadow-[0_0_20px_gold] transform -translate-x-1/2 -translate-y-1/2 translate-z-[10px]"></div>
                         
                         {/* Source Gun */}
                         <div className="absolute top-1/2 left-[-20px] w-10 h-6 bg-slate-600 rounded-r transform -translate-y-1/2 flex items-center justify-center border-l-4 border-red-500">
                             <span className="text-[8px] text-white font-bold">α</span>
                         </div>
                     </div>
                 </RotatableView>
            </div>
        </div>
    );
};

export default RutherfordLab;

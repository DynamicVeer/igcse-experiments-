
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhysicsParams } from '../types';
import { explainConcept } from '../services/geminiService';
import { Rocket, Play, RefreshCw, Brain, Zap, Activity, MoveDown, Settings2, RotateCcw, Sun, Gauge, Scale, LineChart, Box, Ship, Cpu, Magnet, Radiation, Thermometer, Radio, Settings } from 'lucide-react';
import WaveLab from './WaveLab';
import CircuitLab from './CircuitLab';
import CircuitBuilder from './CircuitBuilder';
import SpringLab from './SpringLab';
import OpticsLab from './OpticsLab';
import PressureLab from './PressureLab';
import MomentsLab from './MomentsLab';
import KinematicsLab from './KinematicsLab';
import DensityLab from './DensityLab';
import BuoyancyLab from './BuoyancyLab';
import InductionLab from './InductionLab';
import MagnetismLab from './MagnetismLab';
import RadioactivityLab from './RadioactivityLab';
import ThermalLab from './ThermalLab';
import EMWaveLab from './EMWaveLab';
import MotorGenLab from './MotorGenLab';
import Tooltip from './ui/Tooltip';

const ProjectileLab: React.FC = () => {
  const defaultParams: PhysicsParams = {
    velocity: 50,
    angle: 45,
    gravity: 9.8,
    height: 0
  };

  const [params, setParams] = useState<PhysicsParams>(defaultParams);
  
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // For UI display
  const [trajectory, setTrajectory] = useState<{x: number, y: number}[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timeScale, setTimeScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const simTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const trajectoryRef = useRef<{x: number, y: number}[]>([]);

  const calculatePosition = useCallback((t: number) => {
    const rad = (params.angle * Math.PI) / 180;
    const vx = params.velocity * Math.cos(rad);
    const vy = params.velocity * Math.sin(rad);
    
    const x = vx * t;
    const y = params.height + (vy * t) - (0.5 * params.gravity * t * t);
    
    return { x, y };
  }, [params]);

  const drawScene = useCallback((ctx: CanvasRenderingContext2D, currentX: number, currentY: number, traj: {x: number, y: number}[]) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const scale = 4; 

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, height - 20, width, 20);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<width; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i, height); }
    for(let i=0; i<height; i+=50) { ctx.moveTo(0,i); ctx.lineTo(width, i); }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    traj.forEach((pt, index) => {
      const canvasX = pt.x * scale;
      const canvasY = height - 20 - (pt.y * scale);
      if (index === 0) ctx.moveTo(canvasX, canvasY);
      else ctx.lineTo(canvasX, canvasY);
    });
    ctx.stroke();

    const ballX = currentX * scale;
    const ballY = height - 20 - (currentY * scale);
    
    if (ballY < height + 50 && ballX < width + 50) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ballX - 2, ballY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
  }, []);

  const resetSimulation = () => {
    setIsRunning(false);
    if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
    }
    setTime(0);
    setTrajectory([]);
    simTimeRef.current = 0;
    trajectoryRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawScene(ctx, 0, params.height, []);
    }
  };

  const resetDefaults = () => {
    setParams(defaultParams);
    resetSimulation();
  };

  const animate = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    const dt = (timestamp - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = timestamp;
    const simDt = Math.min(dt * 3, 0.1) * timeScale; 
    
    simTimeRef.current += simDt;
    const currentT = simTimeRef.current;
    const pos = calculatePosition(currentT);
    
    if (pos.y < 0 && currentT > 0.1) {
      setIsRunning(false);
      return;
    }
    trajectoryRef.current.push(pos);
    setTime(currentT);
    setTrajectory([...trajectoryRef.current]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawScene(ctx, pos.x, pos.y, trajectoryRef.current);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [calculatePosition, drawScene, timeScale]);

  useEffect(() => {
    if (isRunning) {
      lastFrameTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
      }
    }
    return () => {
      if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
      }
    };
  }, [isRunning, animate]);

  useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && !isRunning) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              const pos = calculatePosition(0);
              drawScene(ctx, pos.x, pos.y, []);
          }
      }
  }, [params, isRunning, calculatePosition, drawScene]);

  const handleExplain = async () => {
    setLoading(true);
    setExplanation("");
    const text = await explainConcept("Projectile Motion", params);
    setExplanation(text || "No explanation available.");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="col-span-1 space-y-6 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Rocket className="text-rose-500" />
                <h2 className="text-xl font-bold text-slate-100">Launch Control</h2>
            </div>
            <Tooltip content="Reset all parameters to default values">
                <button 
                    onClick={resetDefaults} 
                    className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-transform hover:rotate-180 duration-500"
                >
                    <RotateCcw size={16} />
                </button>
            </Tooltip>
        </div>

        <div className="space-y-4 flex-1">
          <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Velocity (m/s): {params.velocity}</label>
              <input 
              type="range" min="10" max="100" value={params.velocity}
              onChange={(e) => { setParams({...params, velocity: Number(e.target.value)}); resetSimulation(); }}
              className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer transition-all hover:h-3"
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Angle (degrees): {params.angle}</label>
              <input 
              type="range" min="0" max="90" value={params.angle}
              onChange={(e) => { setParams({...params, angle: Number(e.target.value)}); resetSimulation(); }}
              className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer transition-all hover:h-3"
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Gravity (m/s²): {params.gravity}</label>
              <input 
              type="range" min="1.6" max="20" step="0.1" value={params.gravity}
              onChange={(e) => { setParams({...params, gravity: Number(e.target.value)}); resetSimulation(); }}
              className="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer transition-all hover:h-3"
              />
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-bold uppercase">
                   <Settings2 size={12} /> Simulation Speed
               </div>
               <div className="flex gap-1">
                   {[0.5, 1, 2].map(scale => (
                       <button
                           key={scale}
                           onClick={() => setTimeScale(scale)}
                           className={`flex-1 py-1 text-xs rounded font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                               timeScale === scale 
                               ? 'bg-rose-600 text-white shadow-md' 
                               : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                           }`}
                       >
                           {scale}x
                       </button>
                   ))}
               </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
              onClick={() => {
                  if (isRunning) {
                      setIsRunning(false);
                  } else {
                      if (trajectory.length > 0 && trajectory[trajectory.length-1].y <= 0) {
                          resetSimulation();
                          setTimeout(() => setIsRunning(true), 50);
                      } else {
                          setIsRunning(true);
                      }
                  }
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ${
              isRunning 
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-600' 
                  : 'bg-rose-600 text-white hover:bg-rose-500 hover:shadow-rose-600/20'
              }`}
          >
              <Play size={18} fill={isRunning ? "currentColor" : "none"} />
              {isRunning ? 'Pause' : 'Launch'}
          </button>
          <button onClick={resetSimulation} className="py-2 px-4 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mt-4">
           <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Brain size={16} className="text-cyan-400"/> AI Tutor</h3>
              <button 
                onClick={handleExplain} 
                disabled={loading} 
                className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded hover:bg-cyan-900/50 border border-cyan-900 transition-all hover:scale-105 active:scale-95"
              >
                  {loading ? 'Thinking...' : 'Explain'}
              </button>
           </div>
           <div className="text-sm text-slate-400 min-h-[80px]">
             {explanation ? <p className="animate-fade-in">{explanation}</p> : <p className="italic opacity-50">Run the simulation and ask the AI.</p>}
           </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
        <div className="relative h-[400px] bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-lg group">
           <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover"/>
           <div className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded border border-slate-700 backdrop-blur text-xs font-mono transition-opacity opacity-50 group-hover:opacity-100">
             <div>T: {time.toFixed(2)}s</div>
             <div>X: {trajectory.length > 0 ? trajectory[trajectory.length-1].x.toFixed(1) : 0}m</div>
             <div>Y: {trajectory.length > 0 ? trajectory[trajectory.length-1].y.toFixed(1) : 0}m</div>
           </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
    initialTab?: 'projectile' | 'waves' | 'circuits' | 'builder' | 'spring' | 'optics' | 'pressure' | 'moments' | 'kinematics' | 'density' | 'buoyancy' | 'induction' | 'magnetism' | 'machines' | 'radioactivity' | 'thermal' | 'em_waves';
}

const PhysicsLab: React.FC<Props> = ({ initialTab }) => {
    const [activeTab, setActiveTab] = useState<'projectile' | 'waves' | 'circuits' | 'builder' | 'spring' | 'optics' | 'pressure' | 'moments' | 'kinematics' | 'density' | 'buoyancy' | 'induction' | 'magnetism' | 'machines' | 'radioactivity' | 'thermal' | 'em_waves'>(initialTab || 'projectile');

    const tabs = [
        { id: 'projectile', label: 'Projectile', icon: Rocket, color: 'rose' },
        { id: 'waves', label: 'Waves', icon: Activity, color: 'sky' },
        { id: 'circuits', label: "Ohm's Law", icon: Zap, color: 'yellow' },
        { id: 'builder', label: 'Circuit Builder', icon: Cpu, color: 'emerald' },
        { id: 'spring', label: "Hooke's", icon: MoveDown, color: 'lime' },
        { id: 'optics', label: 'Optics', icon: Sun, color: 'blue' },
        { id: 'pressure', label: 'Gas', icon: Gauge, color: 'purple' },
        { id: 'moments', label: 'Moments', icon: Scale, color: 'orange' },
        { id: 'kinematics', label: 'Motion', icon: LineChart, color: 'pink' },
        { id: 'density', label: 'Density', icon: Box, color: 'amber' },
        { id: 'buoyancy', label: 'Buoyancy', icon: Ship, color: 'teal' },
        { id: 'induction', label: 'Induction', icon: Zap, color: 'red' },
        { id: 'magnetism', label: 'Magnetism', icon: Magnet, color: 'indigo' },
        { id: 'machines', label: 'Motors/Gen', icon: Settings, color: 'orange' },
        { id: 'radioactivity', label: 'Decay', icon: Radiation, color: 'yellow' },
        { id: 'thermal', label: 'Thermal', icon: Thermometer, color: 'red' },
        { id: 'em_waves', label: 'EM Waves', icon: Radio, color: 'violet' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4 overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const activeClass = `bg-${tab.color}-500/20 text-${tab.color}-400 shadow-sm border-${tab.color}-500/30`;
                    
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center gap-2 border border-transparent ${
                                isActive 
                                ? activeClass
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                            style={isActive ? { borderColor: `var(--${tab.color}-500)` } : {}}
                        >
                            <Icon size={16} className={isActive ? `text-${tab.color}-400` : ''}/> 
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            
            <div className="flex-1 relative">
                {/* Animated Container */}
                <div key={activeTab} className="animate-slide-up-fade h-full">
                    {activeTab === 'projectile' && <ProjectileLab />}
                    {activeTab === 'waves' && <WaveLab />}
                    {activeTab === 'circuits' && <CircuitLab />}
                    {activeTab === 'builder' && <CircuitBuilder />}
                    {activeTab === 'spring' && <SpringLab />}
                    {activeTab === 'optics' && <OpticsLab />}
                    {activeTab === 'pressure' && <PressureLab />}
                    {activeTab === 'moments' && <MomentsLab />}
                    {activeTab === 'kinematics' && <KinematicsLab />}
                    {activeTab === 'density' && <DensityLab />}
                    {activeTab === 'buoyancy' && <BuoyancyLab />}
                    {activeTab === 'induction' && <InductionLab />}
                    {activeTab === 'magnetism' && <MagnetismLab />}
                    {activeTab === 'machines' && <MotorGenLab />}
                    {activeTab === 'radioactivity' && <RadioactivityLab />}
                    {activeTab === 'thermal' && <ThermalLab />}
                    {activeTab === 'em_waves' && <EMWaveLab />}
                </div>
            </div>
            
            <style>{`
                @keyframes slide-up-fade {
                    0% { opacity: 0; transform: translateY(10px) scale(0.99); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-slide-up-fade {
                    animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

export default PhysicsLab;

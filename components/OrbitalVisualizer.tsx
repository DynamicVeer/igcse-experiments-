import React, { useRef, useEffect, useState } from 'react';
import { OrbitalParams } from '../types';
import { Move } from 'lucide-react';

interface Props {
  params: OrbitalParams;
  speed?: number;
}

const OrbitalVisualizer: React.FC<Props> = ({ params, speed = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Rotation State
  const [autoRotation, setAutoRotation] = useState(0);
  const [manualRotation, setManualRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastManualRef = useRef({ x: 0, y: 0 });

  // Handle Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      lastManualRef.current = { ...manualRotation };
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;
          
          setManualRotation({
              y: lastManualRef.current.y + dx * 0.01,
              x: lastManualRef.current.x + dy * 0.01
          });
      };

      const handleMouseUp = () => {
          setIsDragging(false);
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging]);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      // Center
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 4;

      // Update Auto Rotation
      const newAutoRot = autoRotation + (0.01 * speed);
      setAutoRotation(newAutoRot);

      // Combine Rotations
      // Auto rotates around Y. Manual adds X and Y offsets.
      const rotY = newAutoRot + manualRotation.y;
      const rotX = manualRotation.x;

      const { n, l, m } = params;

      // Simple probabilistic dot plot simulation for 3D effect
      const numPoints = 1500;
      
      ctx.fillStyle = '#38bdf8'; // Light blue
      
      for (let i = 0; i < numPoints; i++) {
        // Generate random spherical coordinates
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const rBase = Math.random(); // Random radius base

        // Probability function approximation based on orbital type
        let r = rBase * scale;

        // Apply simplified angular probability functions (Shapes)
        let x, y, z;
        
        // S-orbital (Spherical)
        if (l === 0) {
          r = rBase * scale * (0.5 + n * 0.2); 
        } 
        // P-orbital (Dumbbell)
        else if (l === 1) {
          r = rBase * scale * (0.8 + n * 0.2);
          if (m === 0) { // z-axis
             r *= Math.abs(Math.cos(phi));
          } else if (m === 1) { // x-axis approx
             r *= Math.abs(Math.sin(phi) * Math.cos(theta));
          } else { // y-axis approx
             r *= Math.abs(Math.sin(phi) * Math.sin(theta));
          }
        }
        // D-orbital (Clover/Donut)
        else if (l === 2) {
          r = rBase * scale * (1.0 + n * 0.1);
          if (m === 0) { // dz^2
            const term = 3 * Math.cos(phi)**2 - 1;
            r *= Math.abs(term) * 0.5;
          } else {
            r *= Math.abs(Math.sin(phi)**2 * Math.sin(2*theta)); 
          }
        }

        // Convert spherical to cartesian
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        // Apply 3D Rotation Matrix
        // 1. Rotate around X axis
        let y_rot = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z_rot = y * Math.sin(rotX) + z * Math.cos(rotX);
        let x_rot = x;

        // 2. Rotate around Y axis
        let x_final = x_rot * Math.cos(rotY) - z_rot * Math.sin(rotY);
        let z_final = x_rot * Math.sin(rotY) + z_rot * Math.cos(rotY);
        let y_final = y_rot;
        
        // Project to 2D (Perspective)
        const fov = 300;
        const z_offset = 400; // Distance from camera
        const scale_proj = fov / (fov + z_final + z_offset);
        
        const x_proj = cx + x_final * scale_proj;
        const y_proj = cy + y_final * scale_proj;
        
        // Depth shading
        const alpha = Math.max(0.1, (z_final + 100) / 200); 
        ctx.globalAlpha = alpha;
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(x_proj, y_proj, 1.5 * scale_proj, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1.0;
      // Draw Nucleus
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(() => render(time + 16));
    };

    animationFrameId = requestAnimationFrame(() => render(0));

    return () => cancelAnimationFrame(animationFrameId);
  }, [params, speed, autoRotation, manualRotation]); // Dependencies update loop logic

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner group cursor-move" onMouseDown={handleMouseDown}>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="w-full h-full block"
      />
      <div className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
        <Move size={20} />
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-slate-400 font-mono pointer-events-none">
        Rotation: {((autoRotation + manualRotation.y) * 57.29 % 360).toFixed(0)}°
      </div>
    </div>
  );
};

export default OrbitalVisualizer;
import React, { useState, useRef, useEffect } from 'react';
import { Move } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  className?: string;
  initialRotation?: { x: number, y: number };
}

const RotatableView: React.FC<Props> = ({ children, className = '', initialRotation = { x: 0, y: 0 } }) => {
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    currentRef.current = { x: rotation.y, y: rotation.x }; // Map X move to Y rot, Y move to X rot
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      
      // Sensitivity factor
      const s = 0.5;

      setRotation({
        x: Math.max(-45, Math.min(45, currentRef.current.y - dy * s)), // Limit X tilt to avoid flipping upside down
        y: currentRef.current.x + dx * s
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

  return (
    <div 
      className={`relative cursor-move group ${className}`}
      style={{ perspective: '1000px' }}
      onMouseDown={handleMouseDown}
    >
      {/* 3D Hint Icon */}
      <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white p-1 rounded pointer-events-none backdrop-blur-sm">
         <Move size={16} />
      </div>
      
      <div 
        className="w-full h-full transition-transform duration-75 ease-out"
        style={{ 
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default RotatableView;
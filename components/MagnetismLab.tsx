
import React, { useState } from 'react';
import { Magnet, Hand } from 'lucide-react';
import RotatableView from './ui/RotatableView';

const MagnetismLab: React.FC = () => {
  const [mode, setMode] = useState<'left' | 'right'>('left');
  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Hand className="text-indigo-400"/> Hand Rules</h3>
              <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  <button onClick={() => setMode('left')} className={`flex-1 py-2 text-sm rounded ${mode === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Left Hand (Motor)</button>
                  <button onClick={() => setMode('right')} className={`flex-1 py-2 text-sm rounded ${mode === 'right' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Right Hand (Gen)</button>
              </div>
              <div className="bg-slate-900 p-4 rounded border border-slate-600 space-y-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> <span className="text-slate-300">Thumb: <b>{mode === 'left' ? 'Force/Motion' : 'Motion'}</b></span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> <span className="text-slate-300">First Finger: <b>Field (N to S)</b></span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> <span className="text-slate-300">Second Finger: <b>Current</b></span></div>
              </div>
          </div>
          <div className="col-span-1 lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
               <RotatableView className="w-full h-full flex items-center justify-center">
                   <div className="relative w-64 h-64 transform-style-3d">
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-orange-300 rounded-xl transform translate-z-[-10px]"></div>
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-40 bg-blue-500 flex items-start justify-center pt-2 shadow-lg transform translate-z-[10px]"><span className="text-white font-bold text-xs writing-vertical">THUMB</span></div>
                       <div className="absolute top-1/2 left-1/2 w-40 h-8 bg-red-500 origin-left transform rotateY(90deg) flex items-center justify-end pr-2 shadow-lg"><span className="text-white font-bold text-xs">FIELD (N-S)</span></div>
                       <div className={`absolute top-1/2 left-1/2 w-40 h-8 bg-green-500 origin-left flex items-center justify-end pr-2 shadow-lg ${mode === 'left' ? 'rotate-0' : 'rotate-180'}`}><span className="text-white font-bold text-xs">{mode === 'left' ? 'CURRENT' : 'INDUCED I'}</span></div>
                   </div>
               </RotatableView>
          </div>
      </div>
  );
}
export default MagnetismLab;

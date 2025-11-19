import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Chemical, ReactionRule } from '../types';
import { KNOWN_REACTIONS } from '../constants';
import { Thermometer, Wind, Snowflake } from 'lucide-react';
import RotatableView from './ui/RotatableView';

interface Props {
  chemicals: Chemical[];
  onReactionFound: (rule: ReactionRule | null) => void;
}

const BeakerSimulation: React.FC<Props> = ({ chemicals, onReactionFound }) => {
  const [simState, setSimState] = useState<'idle' | 'reacting' | 'done'>('idle');
  const [activeRule, setActiveRule] = useState<ReactionRule | null>(null);
  
  // Pouring State
  const [pouringChem, setPouringChem] = useState<Chemical | null>(null);
  const prevChemLength = useRef(0);

  const liquids = chemicals.filter(c => c.state === 'solution' || c.state === 'liquid' || c.type === 'acid' || c.type === 'base' || c.type === 'indicator');
  const solids = chemicals.filter(c => c.state === 'solid' || c.type === 'metal');
  const hasSolid = solids.length > 0;
  
  // Detect new chemical added to trigger pour animation
  useEffect(() => {
      if (chemicals.length > prevChemLength.current) {
          const newChem = chemicals[chemicals.length - 1];
          setPouringChem(newChem);
          const timer = setTimeout(() => setPouringChem(null), 1500); // Pour lasts 1.5s
          return () => clearTimeout(timer);
      }
      prevChemLength.current = chemicals.length;
  }, [chemicals.length, chemicals]);

  // 1. Calculate Simulated pH based on contents
  const calculatedPH = useMemo(() => {
      let ph = 7; // Start Neutral
      const acids = chemicals.filter(c => c.type === 'acid');
      const bases = chemicals.filter(c => c.type === 'base');
      
      if (acids.length > 0 && bases.length === 0) {
          ph = Math.min(...acids.map(a => a.ph || 1));
      } else if (bases.length > 0 && acids.length === 0) {
          ph = Math.max(...bases.map(b => b.ph || 14));
      } else if (acids.length > 0 && bases.length > 0) {
          // Neutralization rough approx
          ph = 7; 
      }
      return ph;
  }, [chemicals]);

  // 2. Determine Liquid Color (Dynamic Indicator Logic)
  const liquidClass = useMemo(() => {
      const indicator = chemicals.find(c => c.type === 'indicator');
      
      if (indicator) {
          if (indicator.id === 'phenolphthalein') {
              return calculatedPH >= 8.2 ? 'bg-pink-500/80' : 'bg-slate-100/50';
          }
          if (indicator.id === 'methyl_orange') {
              if (calculatedPH < 3.1) return 'bg-red-500/80';
              if (calculatedPH > 4.4) return 'bg-yellow-400/80';
              return 'bg-orange-400/80';
          }
      }

      if (simState === 'done' && activeRule?.visual.solutionColor) {
          return activeRule.visual.solutionColor; 
      }

      if (liquids.length > 0) {
           const coloredLiquid = liquids.find(l => l.color !== 'bg-transparent' && !l.color.includes('border'));
           return coloredLiquid ? coloredLiquid.color : liquids[0].color; 
      }
      return 'bg-transparent';
  }, [simState, activeRule, calculatedPH, chemicals, liquids]);

  // Calculate reaction when chemicals change
  useEffect(() => {
    if (chemicals.length >= 2) {
      const chemicalIds = new Set(chemicals.map(c => c.id));
      
      const rule = KNOWN_REACTIONS.find(r => 
        r.reactants.length > 0 && r.reactants.every(reactantId => chemicalIds.has(reactantId))
      );
      
      if (rule) {
        if (activeRule?.id !== rule.id) {
            setActiveRule(rule);
            setSimState('idle'); 
            
            const startTimer = setTimeout(() => {
                setSimState('reacting');
                onReactionFound(rule);
            }, 1000);
            
            const doneTimer = setTimeout(() => {
               setSimState('done');
            }, 4000); 

            return () => { clearTimeout(startTimer); clearTimeout(doneTimer); };
        }
      } else {
        if (activeRule) {
             const stillValid = activeRule.reactants.every(id => chemicalIds.has(id));
             if (!stillValid) {
                 setActiveRule(null);
                 setSimState('idle');
                 onReactionFound(null);
             }
        } else {
            setActiveRule(null);
            setSimState('idle');
            onReactionFound(null);
        }
      }
    } else {
      setSimState('idle');
      setActiveRule(null);
      onReactionFound(null);
    }
  }, [chemicals, onReactionFound, activeRule]);

  const showBubbles = (simState === 'reacting' || simState === 'done') && activeRule?.visual.bubbles;
  const solidDissolving = simState !== 'idle' && activeRule?.visual.solidDissolves;
  const showPrecipitate = simState === 'done' && activeRule?.visual.precipitateColor;
  const isExothermic = activeRule?.visual.tempChange === 'exothermic' && simState !== 'idle';
  const isEndothermic = activeRule?.visual.tempChange === 'endothermic' && simState !== 'idle';
  
  const bubbleColor = activeRule?.visual.gasColor || 'bg-white/40';
  const precipitateColor = activeRule?.visual.precipitateColor || 'bg-white';
  const liquidHeight = liquids.length === 0 ? '0%' : Math.min(90, 20 + liquids.length * 20) + '%';

  return (
    <div className="relative w-full h-80 flex items-end justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-8 overflow-hidden group">
      
      {/* 3D Rotatable Container */}
      <RotatableView className="w-full h-full flex items-end justify-center" initialRotation={{ x: 10, y: 0 }}>
        
        {/* POURING ANIMATION - Fixed in Z space relative to beaker */}
        {pouringChem && (
            <div className="absolute top-[-50px] right-[20%] z-40 animate-pour-in pointer-events-none transform translate-z-[50px]">
                <div className="w-16 h-8 bg-slate-300/30 border border-slate-400/50 rounded-md transform -rotate-45 origin-top-right flex items-center justify-center overflow-hidden backdrop-blur-sm relative shadow-xl">
                     <div className={`absolute inset-0 ${pouringChem.color} opacity-80`}></div>
                     <span className="relative z-10 text-[8px] font-bold text-white drop-shadow-md">{pouringChem.formula}</span>
                </div>
                {pouringChem.state !== 'solid' ? (
                    <div className={`absolute top-6 right-2 w-2 h-64 ${pouringChem.color} opacity-80 rounded-full blur-[1px] origin-top animate-stream`}></div>
                ) : (
                    <div className="absolute top-6 right-2 w-6 h-64 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`absolute w-2 h-2 rounded-sm ${pouringChem.color} animate-drop-solid`} style={{
                                left: Math.random() * 10 + 'px',
                                animationDelay: i * 0.1 + 's'
                            }}></div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Beaker Container */}
        <div className="relative w-48 h-64 border-b-4 border-l-4 border-r-4 border-slate-400/30 rounded-b-3xl backdrop-blur-sm bg-white/5 flex items-end justify-center overflow-hidden shadow-2xl transform-style-3d backface-visible">
          
          {/* Temp Overlay - Glow */}
          {isExothermic && <div className="absolute inset-0 bg-red-500/20 animate-pulse mix-blend-overlay z-10 pointer-events-none"></div>}
          {isEndothermic && <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay z-10 pointer-events-none"></div>}

          {/* Liquid Layer */}
          <div 
            className={`absolute bottom-0 left-0 w-full transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1) ${liquidClass} flex items-end justify-center`}
            style={{ height: liquidHeight }}
          >
            <div className="absolute top-0 w-full h-2 bg-white/20 animate-pulse"></div>

            {(pouringChem || simState === 'reacting') && (
                <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                    <div className="w-full h-full bg-gradient-to-t from-transparent to-white animate-swirl"></div>
                </div>
            )}

            {showBubbles && (
              <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-20 transition-opacity duration-1000 ${simState === 'done' ? 'opacity-20' : 'opacity-100'}`}>
                 <div className="bubble-container">
                    {[...Array(30)].map((_, i) => (
                      <div key={i} className={`absolute rounded-full ${bubbleColor} animate-rise shadow-sm`} style={{
                        left: hasSolid ? `${50 + (Math.random() * 30 - 15)}%` : `${Math.random() * 90 + 5}%`,
                        width: `${Math.random() * 6 + 3}px`,
                        height: `${Math.random() * 6 + 3}px`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 1.5}s`,
                        bottom: hasSolid ? '20px' : '0px'
                      }}></div>
                    ))}
                 </div>
              </div>
            )}
            
            {showPrecipitate && (
               <>
                  <div className={`absolute bottom-0 w-full h-8 ${precipitateColor} blur-md opacity-90 transition-all duration-[2000ms] z-0`}></div>
                  <div className="absolute inset-0 w-full h-full overflow-hidden z-10">
                      {[...Array(40)].map((_, i) => (
                          <div key={i} className={`absolute rounded-full ${precipitateColor} opacity-80 animate-precipitate`} style={{
                              left: `${Math.random() * 100}%`,
                              width: `${Math.random() * 3 + 2}px`,
                              height: `${Math.random() * 3 + 2}px`,
                              top: `${Math.random() * -50}%`,
                              animationDuration: `${3 + Math.random() * 2}s`,
                              animationDelay: `${Math.random()}s`
                          }}></div>
                      ))}
                  </div>
               </>
            )}
          </div>

          {hasSolid && (
            <div 
              className={`absolute bottom-4 w-16 h-8 rounded-sm border border-white/20 shadow-lg transition-all duration-[4000ms] ease-in-out ${solids[0].color} ${solidDissolving ? 'scale-0 opacity-0 blur-[2px]' : 'scale-100 opacity-100'} z-10 transform translate-z-[10px]`}
            >
               <div className="text-[8px] text-center text-black/50 font-bold pt-1">{solids[0].formula}</div>
               {solidDissolving && (
                   <div className="absolute inset-0 w-full h-full pointer-events-none">
                       {[...Array(12)].map((_, i) => (
                           <div key={i} className={`absolute w-1.5 h-1.5 rounded-full ${solids[0].color} animate-dissolve-speck`} style={{
                               left: `${Math.random() * 100}%`,
                               top: `${Math.random() * 100}%`,
                               animationDelay: `${Math.random() * 2}s`,
                               '--tx': `${Math.random() * 40 - 20}px`,
                               '--ty': `-${Math.random() * 30 + 10}px`
                           } as React.CSSProperties}></div>
                       ))}
                   </div>
               )}
            </div>
          )}

          {isExothermic && (
             <div className="absolute -right-8 top-10 animate-pulse text-red-500 z-20 transform translate-z-[20px]">
                 <Thermometer size={24} />
                 <span className="text-xs font-bold drop-shadow-md">+ Heat</span>
             </div>
          )}
          
          {isEndothermic && (
             <div className="absolute -right-8 top-10 animate-pulse text-blue-400 z-20 transform translate-z-[20px]">
                 <Snowflake size={24} />
                 <span className="text-xs font-bold drop-shadow-md">- Cool</span>
             </div>
          )}

          {(showBubbles || isExothermic) && (
            <div className="absolute -top-20 left-0 w-full h-32 z-20 flex justify-center pointer-events-none">
               {activeRule?.visual.gasColor && (
                   <div className={`absolute bottom-0 w-24 h-24 rounded-full blur-2xl opacity-40 animate-waft ${activeRule.visual.gasColor}`}></div>
               )}
               <div className="animate-waft opacity-60">
                   <Wind size={32} className={`${activeRule?.visual.gasColor ? 'text-white' : 'text-slate-300'}`}/>
               </div>
            </div>
          )}
        </div>
      </RotatableView>
      
      <style>{`
        @keyframes pour-in {
            0% { transform: translateY(-20px) translateX(20px) rotate(0deg); opacity: 0; }
            20% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
            80% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-10px) translateX(10px) rotate(10deg); opacity: 0; }
        }
        .animate-pour-in { animation: pour-in 1.5s ease-in-out forwards; }

        @keyframes stream {
            0% { transform: scaleY(0); }
            20% { transform: scaleY(1); }
            80% { transform: scaleY(1); opacity: 1; }
            100% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
        }
        .animate-stream { animation: stream 1.2s ease-in-out forwards; animation-delay: 0.2s; }

        @keyframes drop-solid {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(200px); opacity: 0; }
        }
        .animate-drop-solid { animation: drop-solid 0.8s linear forwards; }

        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-200px) scale(1.2); opacity: 0; }
        }
        .animate-rise { animation-name: rise; animation-timing-function: ease-in; animation-iteration-count: infinite; }

        @keyframes precipitate {
            0% { transform: translateY(0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(200px); opacity: 0; }
        }
        .animate-precipitate { animation-name: precipitate; animation-timing-function: linear; animation-iteration-count: infinite; }

        @keyframes waft {
          0% { transform: translateY(0) translateX(-50%) scale(0.8); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-60px) translateX(-50%) scale(1.5); opacity: 0; }
        }
        .animate-waft { animation: waft 3s infinite ease-out; }
        
        @keyframes swirl {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
        }
        .animate-swirl { animation: swirl 3s infinite linear; }

        @keyframes dissolve-speck {
            0% { transform: translate(0,0) scale(1); opacity: 0.8; }
            100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .animate-dissolve-speck { animation: dissolve-speck 1.5s linear infinite; }
        
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default BeakerSimulation;
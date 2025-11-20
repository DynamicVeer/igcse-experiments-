
import React from 'react';
import { Chemical } from '../types';
import { KNOWN_REACTIONS } from '../constants';
import { X, Info, Beaker, FlaskConical, ScrollText } from 'lucide-react';
import MoleculeStructure from './MoleculeStructure';

interface Props {
  chemical: Chemical;
  onClose: () => void;
}

const ChemicalDetails: React.FC<Props> = ({ chemical, onClose }) => {
  // Find reactions involving this chemical
  const relatedReactions = KNOWN_REACTIONS.filter(r => r.reactants.includes(chemical.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto custom-scrollbar relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700 p-4 flex justify-between items-start z-10">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full ${chemical.color} border-2 border-slate-600 shadow-lg flex items-center justify-center text-slate-900 font-bold text-lg`}>
                {chemical.state === 'solid' ? 'S' : chemical.state === 'gas' ? 'G' : 'L'}
             </div>
             <div>
                 <h2 className="text-xl font-bold text-white">{chemical.name}</h2>
                 <div className="text-slate-400 font-mono">{chemical.formula}</div>
             </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
             <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
             {/* Basic Properties Grid */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1">State</div>
                     <div className="text-white capitalize">{chemical.state}</div>
                 </div>
                 <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                     <div className="text-xs text-slate-500 uppercase font-bold mb-1">Type</div>
                     <div className="text-white capitalize">{chemical.type}</div>
                 </div>
                 {chemical.ph !== undefined && (
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">pH Level</div>
                         <div className={`text-lg font-bold ${chemical.ph < 7 ? 'text-red-400' : chemical.ph > 7 ? 'text-blue-400' : 'text-emerald-400'}`}>
                             {chemical.ph}
                         </div>
                     </div>
                 )}
             </div>

             {/* Molecular Structure (If organic) */}
             {chemical.type === 'organic' && (
                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center">
                     <div className="text-xs text-slate-500 uppercase font-bold w-full mb-2">Molecular Structure</div>
                     <div className="w-48 h-48">
                         <MoleculeStructure id={chemical.id} formula={chemical.formula} className="w-full h-full" />
                     </div>
                 </div>
             )}

             {/* Known Reactions */}
             <div>
                 <div className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                     <FlaskConical size={16} className="text-emerald-400"/> Known Reactions
                 </div>
                 {relatedReactions.length > 0 ? (
                     <div className="space-y-2">
                         {relatedReactions.map(r => (
                             <div key={r.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-sm">
                                 <div className="text-slate-300 mb-1">{r.observation}</div>
                                 {r.products.length > 0 && (
                                     <div className="text-xs text-slate-500 flex gap-1 flex-wrap">
                                         <span className="font-bold">Products:</span> 
                                         {r.products.join(', ')}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-slate-500 text-sm italic p-4 bg-slate-800/50 rounded-lg text-center">
                         No standard reactions listed for this context.
                     </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default ChemicalDetails;

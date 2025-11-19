
import React, { useState, useEffect } from 'react';
import { AppView, NotebookEntry } from './types';
import ChemistryLab from './components/ChemistryLab';
import PhysicsLab from './components/PhysicsLab';
import LabNotebook from './components/LabNotebook';
import { FlaskConical, Atom, ExternalLink, ArrowRight, BookOpen, Flame, Droplets, TestTube, Leaf, Rocket, Activity, Zap, Sun, Gauge, LineChart, Scale, Box, Magnet, Radiation, Thermometer, Timer, RotateCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [initialLabTab, setInitialLabTab] = useState<string | undefined>(undefined);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);

  useEffect(() => {
      if (!process.env.API_KEY) {
          setApiKeyMissing(true);
      }
  }, []);

  const handleAddEntry = (entry: NotebookEntry) => {
      setNotebookEntries([entry, ...notebookEntries]);
  };

  const handleDeleteEntry = (id: string) => {
      setNotebookEntries(notebookEntries.filter(e => e.id !== id));
  };

  const handleUpdateEntry = (updatedEntry: NotebookEntry) => {
      setNotebookEntries(notebookEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const navigateTo = (view: AppView, tab?: string) => {
    setInitialLabTab(tab);
    setCurrentView(view);
    window.scrollTo(0,0);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigateTo(AppView.HOME)}
          >
            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-lg shadow-lg group-hover:shadow-emerald-500/20 transition-all">
               <Atom className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              <span className="hidden sm:inline">IGCSE</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Science.AI</span>
            </h1>
          </div>

          <nav className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-slate-700/50 mr-2 md:mr-4">
                <button 
                onClick={() => navigateTo(AppView.CHEMISTRY)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === AppView.CHEMISTRY ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                <FlaskConical size={16} /> <span className="hidden md:inline">Chemistry</span>
                </button>
                <button 
                onClick={() => navigateTo(AppView.PHYSICS)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === AppView.PHYSICS ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                <Atom size={16} /> <span className="hidden md:inline">Physics</span>
                </button>
            </div>

            <button 
                onClick={() => setIsNotebookOpen(!isNotebookOpen)}
                className={`p-2 rounded-full border transition-colors ${isNotebookOpen ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500 hover:text-indigo-400'}`}
                title="Open Lab Notebook"
            >
                <BookOpen size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 relative">
        {apiKeyMissing && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 p-4 rounded-lg text-red-200 text-center text-sm md:text-base">
                Warning: API_KEY not detected. AI features will not function.
            </div>
        )}

        {currentView === AppView.HOME && (
          <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto mt-4 md:mt-10 text-center space-y-6 md:space-y-10 mb-16">
                <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                    Master IGCSE Science <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500">With AI Simulations</span>
                </h2>
                <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
                    Your interactive laboratory for Physics and Chemistry. 
                    Visualize concepts, predict reactions, and explore the laws of the universe.
                </p>
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => navigateTo(AppView.CHEMISTRY)}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
                    >
                        Start Chemistry <ArrowRight size={18}/>
                    </button>
                    <button 
                        onClick={() => navigateTo(AppView.PHYSICS)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        Start Physics <ArrowRight size={18}/>
                    </button>
                </div>
            </div>

            {/* Chemistry Section */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <FlaskConical className="text-emerald-400" size={24}/>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Chemistry Laboratory</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <FeatureCard 
                        title="Reaction Simulator" 
                        desc="Mix chemicals and observe reactions in a virtual beaker."
                        icon={<FlaskConical className="text-emerald-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'mix')}
                        color="emerald"
                    />
                    <FeatureCard 
                        title="Rate of Reaction" 
                        desc="Study collision theory, surface area, and temp."
                        icon={<Timer className="text-rose-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'rates')}
                        color="rose"
                    />
                    <FeatureCard 
                        title="Equilibrium" 
                        desc="Le Chatelier's Principle and reversible reactions."
                        icon={<Scale className="text-teal-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'equilibrium')}
                        color="teal"
                    />
                     <FeatureCard 
                        title="Energy Profiles" 
                        desc="Exothermic & Endothermic diagrams and Activation Energy."
                        icon={<Activity className="text-pink-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'energy')}
                        color="pink"
                    />
                    <FeatureCard 
                        title="Electrolysis" 
                        desc="Electrolytic cells and ion discharge rules."
                        icon={<Zap className="text-yellow-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'electrolysis')}
                        color="yellow"
                    />
                    <FeatureCard 
                        title="Organic Chemistry" 
                        desc="Test Alkanes, Alkenes, and Alcohol reactions."
                        icon={<Leaf className="text-green-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'organic')}
                        color="green"
                    />
                    <FeatureCard 
                        title="Titration Lab" 
                        desc="Perform acid-base titrations with indicators."
                        icon={<Droplets className="text-purple-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'titration')}
                        color="purple"
                    />
                    <FeatureCard 
                        title="Ion Analysis" 
                        desc="Identify cations and anions using test tube reactions."
                        icon={<TestTube className="text-yellow-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'qualitative')}
                        color="yellow"
                    />
                     <FeatureCard 
                        title="Flame Tests" 
                        desc="Identify metals by their characteristic flame colors."
                        icon={<Flame className="text-orange-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'flame')}
                        color="orange"
                    />
                    <FeatureCard 
                        title="3D Orbitals" 
                        desc="Visualize s, p, and d atomic orbital shapes."
                        icon={<Atom className="text-blue-400" size={24}/>}
                        onClick={() => navigateTo(AppView.CHEMISTRY, 'orbitals')}
                        color="blue"
                    />
                </div>
            </div>

            {/* Physics Section */}
            <div>
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Atom className="text-blue-400" size={24}/>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Physics Engine</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     <FeatureCard 
                        title="Motors & Generators" 
                        desc="Simulate DC motors and AC/DC generators."
                        icon={<RotateCw className="text-orange-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'machines')}
                        color="orange"
                    />
                    <FeatureCard 
                        title="Magnetism" 
                        desc="Magnetic fields, Motor Effect, and Hand Rules."
                        icon={<Magnet className="text-indigo-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'magnetism')}
                        color="indigo"
                    />
                    <FeatureCard 
                        title="Electromagnetic Induction" 
                        desc="Faraday's Law, Lenz's Law and Generators."
                        icon={<Zap className="text-red-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'induction')}
                        color="red"
                    />
                    <FeatureCard 
                        title="Circuit Builder" 
                        desc="Build series circuits and verify Ohm's Law."
                        icon={<Zap className="text-yellow-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'builder')}
                        color="yellow"
                    />
                     <FeatureCard 
                        title="Radioactivity" 
                        desc="Nuclear decay, half-life, and randomness."
                        icon={<Radiation className="text-yellow-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'radioactivity')}
                        color="yellow"
                    />
                    <FeatureCard 
                        title="Thermal Physics" 
                        desc="Heating curves, latent heat and states of matter."
                        icon={<Thermometer className="text-red-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'thermal')}
                        color="red"
                    />
                    <FeatureCard 
                        title="Projectile Motion" 
                        desc="Launch projectiles and analyze trajectories."
                        icon={<Rocket className="text-rose-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'projectile')}
                        color="rose"
                    />
                    <FeatureCard 
                        title="Wave Interference" 
                        desc="Visualize superposition and phase shifts."
                        icon={<Activity className="text-sky-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'waves')}
                        color="sky"
                    />
                    <FeatureCard 
                        title="Optics Bench" 
                        desc="Experiment with lenses, mirrors, and prisms."
                        icon={<Sun className="text-blue-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'optics')}
                        color="blue"
                    />
                     <FeatureCard 
                        title="Gas Laws" 
                        desc="Explore pressure, volume, and temperature."
                        icon={<Gauge className="text-purple-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'pressure')}
                        color="purple"
                    />
                    <FeatureCard 
                        title="Kinematics" 
                        desc="Analyze motion graphs for velocity and acceleration."
                        icon={<LineChart className="text-pink-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'kinematics')}
                        color="pink"
                    />
                    <FeatureCard 
                        title="Moments & Levers" 
                        desc="Balance torques on a pivot system."
                        icon={<Scale className="text-orange-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'moments')}
                        color="orange"
                    />
                     <FeatureCard 
                        title="Density & Buoyancy" 
                        desc="Sink or float? Test Archimedes' principle."
                        icon={<Box className="text-amber-400" size={24}/>}
                        onClick={() => navigateTo(AppView.PHYSICS, 'density')}
                        color="amber"
                    />
                </div>
            </div>
          </div>
        )}

        {currentView === AppView.CHEMISTRY && (
           <div className="animate-fade-in h-[calc(100vh-140px)]">
               <ChemistryLab initialTab={initialLabTab as any} />
           </div>
        )}

        {currentView === AppView.PHYSICS && (
            <div className="animate-fade-in h-[calc(100vh-140px)]">
                <PhysicsLab initialTab={initialLabTab as any} />
            </div>
        )}

        {/* Notebook Overlay */}
        <LabNotebook 
            isOpen={isNotebookOpen} 
            onClose={() => setIsNotebookOpen(false)}
            entries={notebookEntries}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateEntry={handleUpdateEntry}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-900 mt-auto">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
             <p>© 2024 IGCSE Science.AI</p>
             <div className="flex gap-4">
                 <a href="#" className="hover:text-white flex items-center gap-1">Powered by Gemini <ExternalLink size={12}/></a>
             </div>
          </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

interface FeatureCardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon, onClick, color }) => {
    // Map color string to tailwind classes dynamically is tricky safely without full map, 
    // simplified approach:
    const borderColor = `hover:border-${color}-500/50`;
    const shadowColor = `hover:shadow-${color}-900/20`;
    
    return (
        <div 
            onClick={onClick}
            className={`bg-slate-800 p-5 rounded-xl border border-slate-700 cursor-pointer hover:-translate-y-1 transition-all hover:shadow-xl group relative overflow-hidden`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                {icon}
            </div>
            <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 rounded-lg bg-slate-900 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h4>
                    <p className="text-sm text-slate-400 leading-snug mt-1">{desc}</p>
                </div>
            </div>
        </div>
    )
}

export default App;

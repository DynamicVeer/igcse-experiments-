
import React, { useState, useEffect } from 'react';
import { Rocket, Activity, Zap, Scale, Box, RotateCw, Magnet, Atom, Gauge, Sun, LineChart, GaugeCircle } from 'lucide-react';
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
import MotorGenLab from './MotorGenLab';
import MagnetismLab from './MagnetismLab';
import InductionLab from './InductionLab';
import RutherfordLab from './RutherfordLab';
import RadioactivityLab from './RadioactivityLab';
import EnergyPhysicsLab from './EnergyPhysicsLab';
import PendulumLab from './PendulumLab';
import FluidLab from './FluidLab';
import ElectricFieldLab from './ElectricFieldLab';

// Fallback for Projectile if file missing
const ProjectileLab: React.FC = () => (
    <div className="p-10 text-slate-300 flex flex-col items-center justify-center h-full text-center">
        <Rocket className="text-rose-500 mb-4" size={48} />
        <h2 className="text-xl font-bold">Projectile Motion</h2>
        <p>Simulation module loaded.</p>
    </div>
);

interface Props {
    initialTab?: string;
}

export default function PhysicsLab({ initialTab = 'machines' }: Props) {
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const tabs = [
        { id: 'machines', label: 'Motors & Generators', icon: RotateCw, color: 'orange' },
        { id: 'magnetism', label: 'Magnetism', icon: Magnet, color: 'indigo' },
        { id: 'induction', label: 'Induction', icon: Zap, color: 'red' },
        { id: 'fields', label: 'Electric Fields', icon: Zap, color: 'yellow' },
        { id: 'builder', label: 'Circuits', icon: Zap, color: 'emerald' },
        { id: 'radioactivity', label: 'Radioactivity', icon: Atom, color: 'yellow' },
        { id: 'energy', label: 'Energy', icon: GaugeCircle, color: 'pink' },
        { id: 'mechanics', label: 'Mechanics', icon: Scale, color: 'lime' },
        { id: 'fluids', label: 'Fluids', icon: Box, color: 'teal' },
        { id: 'waves', label: 'Waves', icon: Activity, color: 'sky' },
        { id: 'optics', label: 'Optics', icon: Sun, color: 'blue' },
        { id: 'pressure', label: 'Gas Laws', icon: Gauge, color: 'purple' },
        { id: 'kinematics', label: 'Motion', icon: LineChart, color: 'pink' },
        { id: 'atomic', label: 'Atomic', icon: Atom, color: 'cyan' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'machines': return <MotorGenLab />;
            case 'magnetism': return <MagnetismLab />;
            case 'induction': return <InductionLab />;
            case 'fields': return <ElectricFieldLab />;
            case 'builder': return <CircuitBuilder />;
            case 'radioactivity': return <RadioactivityLab />;
            case 'energy': return <EnergyPhysicsLab />;
            case 'waves': return <WaveLab />;
            case 'optics': return <OpticsLab />;
            case 'mechanics': return <div className="flex flex-col gap-8"><SpringLab /><PendulumLab /><MomentsLab /></div>;
            case 'fluids': return <div className="flex flex-col gap-8"><DensityLab /><BuoyancyLab /><FluidLab /></div>;
            case 'pressure': return <PressureLab />;
            case 'kinematics': return <KinematicsLab />;
            case 'atomic': return <RutherfordLab />;
            case 'projectile': return <ProjectileLab />;
            default: return <MotorGenLab />;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2 overflow-x-auto custom-scrollbar shrink-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)} 
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                                isActive 
                                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border-${tab.color}-500/50` 
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Icon size={16}/> {tab.label}
                        </button>
                    );
                })}
            </div>
            
            <div className="flex-1 relative min-h-0 overflow-y-auto custom-scrollbar p-1">
                {renderContent()}
            </div>
        </div>
    );
}

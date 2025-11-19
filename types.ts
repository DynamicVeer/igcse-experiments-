
export enum AppView {
  HOME = 'HOME',
  CHEMISTRY = 'CHEMISTRY',
  PHYSICS = 'PHYSICS'
}

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  color: string; // Tailwind class
  hexColor?: string; // Hex for canvas/advanced rendering
  state: 'solid' | 'liquid' | 'gas' | 'solution';
  type: 'acid' | 'base' | 'salt' | 'metal' | 'oxide' | 'indicator' | 'organic' | 'other';
  ph?: number;
}

export interface ReactionResult {
  equation: string;
  observation: string;
  safetyWarning: string;
  products: string[];
  type: string; 
  colorChange: string;
}

export interface ReactionRule {
  id: string;
  reactants: string[]; // IDs sorted
  products: string[];
  observation: string;
  visual: {
    bubbles: boolean;
    precipitateColor?: string; // Tailwind class
    solutionColor?: string; // Tailwind class
    solidDissolves: boolean;
    gasColor?: string;
    tempChange?: 'exothermic' | 'endothermic';
  };
}

export interface PhysicsParams {
  velocity: number;
  angle: number;
  gravity: number;
  height: number;
}

export interface OrbitalParams {
  n: number;
  l: number;
  m: number;
}

export interface NotebookEntry {
  id: string;
  timestamp: number;
  title: string;
  observation: string;
  data: string; // JSON string of experiment params
  conclusion: string;
  aiFeedback?: string;
  type: 'physics' | 'chemistry';
}

export interface FlameTestIon {
  id: string;
  name: string;
  formula: string;
  colorName: string;
  colorClass: string; 
}

export interface IonTestResult {
  id: string;
  reagent: 'NaOH' | 'NH3' | 'AgNO3' | 'BaCl2' | 'Acid';
  observation: string;
  precipitateColor?: string;
  solubleInExcess?: boolean;
  gasEvolved?: string;
}


import { Chemical, FlameTestIon, IonTestResult, ReactionRule } from './types';

export const CHEMICALS: Chemical[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', color: 'bg-transparent border-gray-400', hexColor: '#e2e8f0', state: 'solution', type: 'acid', ph: 1 },
  { id: 'h2so4', name: 'Sulfuric Acid', formula: 'H₂SO₄', color: 'bg-transparent border-yellow-100', hexColor: '#fefce8', state: 'solution', type: 'acid', ph: 1 },
  { id: 'citric_acid', name: 'Citric Acid', formula: 'C₆H₈O₇', color: 'bg-transparent border-gray-200', state: 'solution', type: 'acid', ph: 3 },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', color: 'bg-white/80', hexColor: '#ffffff', state: 'solution', type: 'base', ph: 14 },
  { id: 'koh', name: 'Potassium Hydroxide', formula: 'KOH', color: 'bg-white/80', hexColor: '#ffffff', state: 'solution', type: 'base', ph: 14 },
  { id: 'nahco3', name: 'Sodium Bicarbonate', formula: 'NaHCO₃', color: 'bg-white', hexColor: '#ffffff', state: 'solid', type: 'base' },
  { id: 'cu', name: 'Copper', formula: 'Cu', color: 'bg-orange-600', hexColor: '#ea580c', state: 'solid', type: 'metal' },
  { id: 'zn', name: 'Zinc', formula: 'Zn', color: 'bg-gray-400', hexColor: '#9ca3af', state: 'solid', type: 'metal' },
  { id: 'mg', name: 'Magnesium', formula: 'Mg', color: 'bg-gray-200', hexColor: '#e5e7eb', state: 'solid', type: 'metal' },
  { id: 'fe', name: 'Iron', formula: 'Fe', color: 'bg-neutral-600', hexColor: '#525252', state: 'solid', type: 'metal' },
  { id: 'sodium', name: 'Sodium', formula: 'Na', color: 'bg-stone-300', hexColor: '#d6d3d1', state: 'solid', type: 'metal' },
  { id: 'cuso4', name: 'Copper(II) Sulfate', formula: 'CuSO₄', color: 'bg-blue-500', hexColor: '#3b82f6', state: 'solution', type: 'salt' },
  { id: 'caco3', name: 'Calcium Carbonate', formula: 'CaCO₃', color: 'bg-white', hexColor: '#ffffff', state: 'solid', type: 'salt' },
  { id: 'agno3', name: 'Silver Nitrate', formula: 'AgNO₃', color: 'bg-transparent border-gray-200', hexColor: '#f3f4f6', state: 'solution', type: 'salt' },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'Ind', color: 'bg-pink-200/50', hexColor: '#fbcfe8', state: 'solution', type: 'indicator' },
  { id: 'methyl_orange', name: 'Methyl Orange', formula: 'Ind', color: 'bg-orange-500', hexColor: '#f97316', state: 'solution', type: 'indicator' },
  
  // Organic - Alkanes
  { id: 'methane', name: 'Methane', formula: 'CH₄', color: 'bg-transparent border-slate-300', state: 'gas', type: 'organic' },
  { id: 'ethane', name: 'Ethane', formula: 'C₂H₆', color: 'bg-transparent border-slate-300', state: 'gas', type: 'organic' },
  { id: 'propane', name: 'Propane', formula: 'C₃H₈', color: 'bg-transparent border-slate-300', state: 'gas', type: 'organic' },
  
  // Organic - Alkenes
  { id: 'ethene', name: 'Ethene', formula: 'C₂H₄', color: 'bg-transparent border-slate-300', state: 'gas', type: 'organic' },
  
  // Organic - Alcohols
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },
  
  // Organic - Acids
  { id: 'methanoic_acid', name: 'Methanoic Acid', formula: 'HCOOH', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },
  { id: 'ethanoic_acid', name: 'Ethanoic Acid', formula: 'CH₃COOH', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },
  { id: 'propanoic_acid', name: 'Propanoic Acid', formula: 'C₂H₅COOH', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },
  { id: 'butanoic_acid', name: 'Butanoic Acid', formula: 'C₃H₇COOH', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },

  // Organic - Halogenoalkanes
  { id: 'chloroethane', name: 'Chloroethane', formula: 'C₂H₅Cl', color: 'bg-transparent border-slate-300', state: 'liquid', type: 'organic' },

  // Reagents
  { id: 'bromine_water', name: 'Bromine Water', formula: 'Br₂(aq)', color: 'bg-orange-500/80', hexColor: '#fb923c', state: 'solution', type: 'other' },
  { id: 'kmno4', name: 'Acidified KMnO₄', formula: 'KMnO₄(aq)', color: 'bg-fuchsia-700/80', hexColor: '#a21caf', state: 'solution', type: 'other' },
];

export const KNOWN_REACTIONS: ReactionRule[] = [
  {
    id: 'acid_base_neut',
    reactants: ['hcl', 'naoh'],
    products: ['NaCl', 'H2O'],
    observation: 'Exothermic reaction. Temperature rises.',
    visual: { bubbles: false, solidDissolves: false, tempChange: 'exothermic' }
  },
  {
    id: 'endo_cooling',
    reactants: ['citric_acid', 'nahco3'],
    products: ['Na3C6H5O7', 'H2O', 'CO2'],
    observation: 'Endothermic reaction. Temperature drops significantly.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white', tempChange: 'endothermic' }
  },
  {
    id: 'acid_metal_mg',
    reactants: ['hcl', 'mg'],
    products: ['MgCl2', 'H2'],
    observation: 'Vigorous effervescence. Metal dissolves rapidly.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white', tempChange: 'exothermic' }
  },
  {
    id: 'acid_metal_zn',
    reactants: ['hcl', 'zn'],
    products: ['ZnCl2', 'H2'],
    observation: 'Steady effervescence. Metal dissolves.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white' }
  },
  {
    id: 'acid_carb',
    reactants: ['caco3', 'hcl'],
    products: ['CaCl2', 'CO2', 'H2O'],
    observation: 'Effervescence. White solid dissolves.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white' }
  },
  {
    id: 'displacement_cu_ag',
    reactants: ['agno3', 'cu'],
    products: ['Cu(NO3)2', 'Ag'],
    observation: 'Copper dissolves, solution turns blue. Grey crystals form on metal.',
    visual: { bubbles: false, solidDissolves: true, solutionColor: 'bg-blue-500/50', precipitateColor: 'bg-gray-300' }
  },
  {
    id: 'indicator_acid',
    reactants: ['hcl', 'methyl_orange'],
    products: [],
    observation: 'Solution turns red.',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-red-500' }
  },
  // Organic Reactions
  {
    id: 'organic_alkene_br',
    reactants: ['bromine_water', 'ethene'],
    products: ['1,2-dibromoethane'],
    observation: 'Bromine water decolorizes (Orange to Colorless). Addition reaction.',
    visual: { bubbles: true, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_alkane_br',
    reactants: ['bromine_water', 'ethane'],
    products: [],
    observation: 'No change in dark. Slowly decolorizes in UV light (Substitution).',
    visual: { bubbles: true, solidDissolves: false, solutionColor: 'bg-orange-500/80' }
  },
  {
    id: 'organic_methane_br',
    reactants: ['bromine_water', 'methane'],
    products: ['Bromomethane', 'HBr'],
    observation: 'No change in dark. Decolorizes in UV light (Substitution).',
    visual: { bubbles: true, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_propane_br',
    reactants: ['bromine_water', 'propane'],
    products: ['Bromopropane', 'HBr'],
    observation: 'No change in dark. Decolorizes in UV light (Substitution).',
    visual: { bubbles: true, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_alcohol_br',
    reactants: ['bromine_water', 'ethanol'],
    products: [],
    observation: 'No change. Solution remains orange.',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-orange-500/80' }
  },
  {
    id: 'organic_alkene_kmno4',
    reactants: ['ethene', 'kmno4'],
    products: ['Diol'],
    observation: 'Purple solution turns colorless (Oxidation).',
    visual: { bubbles: true, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_alcohol_kmno4',
    reactants: ['ethanol', 'kmno4'],
    products: ['Ethanoic Acid'],
    observation: 'Purple solution turns colorless on heating (Oxidation).',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-transparent', tempChange: 'exothermic' }
  },
  {
    id: 'organic_esterification',
    reactants: ['ethanol', 'ethanoic_acid'],
    products: ['Ethyl Ethanoate', 'Water'],
    observation: 'Sweet, fruity smell produced (Esterification). Requires heat/catalyst.',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_methanoic_ester',
    reactants: ['ethanol', 'methanoic_acid'],
    products: ['Ethyl Methanoate', 'Water'],
    observation: 'Sweet, fruity smell (Ethyl Methanoate).',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
   {
    id: 'organic_propanoic_ester',
    reactants: ['ethanol', 'propanoic_acid'],
    products: ['Ethyl Propanoate', 'Water'],
    observation: 'Sweet, fruity smell (Ethyl Propanoate).',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-transparent' }
  },
  {
    id: 'organic_acid_carbonate',
    reactants: ['ethanoic_acid', 'nahco3'],
    products: ['Sodium Ethanoate', 'CO2', 'H2O'],
    observation: 'Effervescence (Bubbles). Gas turns limewater milky.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white' }
  },
  {
    id: 'organic_methanoic_carbonate',
    reactants: ['methanoic_acid', 'nahco3'],
    products: ['Sodium Methanoate', 'CO2', 'H2O'],
    observation: 'Vigorous effervescence (Bubbles).',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white' }
  },
  {
    id: 'organic_alcohol_sodium',
    reactants: ['ethanol', 'sodium'],
    products: ['Sodium Ethoxide', 'H2'],
    observation: 'Effervescence. Metal dissolves. Hydrogen gas produced.',
    visual: { bubbles: true, solidDissolves: true, gasColor: 'bg-white' }
  },
  {
    id: 'organic_halogen_hydrolysis',
    reactants: ['chloroethane', 'naoh'],
    products: ['Ethanol', 'NaCl'],
    observation: 'Hydrolysis occurs on heating. Alcohol formed.',
    visual: { bubbles: false, solidDissolves: false, solutionColor: 'bg-transparent' }
  }
];

export const ORBITAL_TYPES = [
  { label: '1s', n: 1, l: 0, m: 0 },
  { label: '2s', n: 2, l: 0, m: 0 },
  { label: '2p_x', n: 2, l: 1, m: 1 },
  { label: '2p_y', n: 2, l: 1, m: -1 },
  { label: '2p_z', n: 2, l: 1, m: 0 },
  { label: '3d_z²', n: 3, l: 2, m: 0 },
];

export const FLAME_TEST_IONS: FlameTestIon[] = [
  { id: 'li', name: 'Lithium', formula: 'Li⁺', colorName: 'Red', colorClass: 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.8)]' },
  { id: 'na', name: 'Sodium', formula: 'Na⁺', colorName: 'Yellow-Orange', colorClass: 'bg-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.8)]' },
  { id: 'k', name: 'Potassium', formula: 'K⁺', colorName: 'Lilac', colorClass: 'bg-purple-400 shadow-[0_0_40px_rgba(192,132,252,0.8)]' },
  { id: 'ca', name: 'Calcium', formula: 'Ca²⁺', colorName: 'Brick Red', colorClass: 'bg-orange-700 shadow-[0_0_40px_rgba(194,65,12,0.8)]' },
  { id: 'cu', name: 'Copper', formula: 'Cu²⁺', colorName: 'Blue-Green', colorClass: 'bg-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.8)]' },
  { id: 'ba', name: 'Barium', formula: 'Ba²⁺', colorName: 'Apple Green', colorClass: 'bg-lime-400 shadow-[0_0_40px_rgba(163,230,53,0.8)]' },
];

export const ION_TESTS: Record<string, IonTestResult[]> = {
  'Cu2+': [
    { id: 'cu_naoh', reagent: 'NaOH', observation: 'Light blue precipitate formed.', precipitateColor: 'bg-cyan-500', solubleInExcess: false },
    { id: 'cu_nh3', reagent: 'NH3', observation: 'Light blue ppt, dissolves in excess to deep blue solution.', precipitateColor: 'bg-blue-700', solubleInExcess: true },
  ],
  'Fe2+': [
    { id: 'fe2_naoh', reagent: 'NaOH', observation: 'Green precipitate formed.', precipitateColor: 'bg-green-700', solubleInExcess: false },
    { id: 'fe2_nh3', reagent: 'NH3', observation: 'Green precipitate formed.', precipitateColor: 'bg-green-700', solubleInExcess: false },
  ],
  'Fe3+': [
    { id: 'fe3_naoh', reagent: 'NaOH', observation: 'Red-brown precipitate formed.', precipitateColor: 'bg-orange-800', solubleInExcess: false },
    { id: 'fe3_nh3', reagent: 'NH3', observation: 'Red-brown precipitate formed.', precipitateColor: 'bg-orange-800', solubleInExcess: false },
  ],
  'Cl-': [
    { id: 'cl_agno3', reagent: 'AgNO3', observation: 'White precipitate formed.', precipitateColor: 'bg-white', solubleInExcess: false },
  ],
  'Br-': [
    { id: 'br_agno3', reagent: 'AgNO3', observation: 'Cream precipitate formed.', precipitateColor: 'bg-yellow-100', solubleInExcess: false },
  ],
  'I-': [
    { id: 'i_agno3', reagent: 'AgNO3', observation: 'Yellow precipitate formed.', precipitateColor: 'bg-yellow-300', solubleInExcess: false },
  ],
  'SO42-': [
    { id: 'so4_bacl2', reagent: 'BaCl2', observation: 'White precipitate formed.', precipitateColor: 'bg-white', solubleInExcess: false },
  ],
  'CO32-': [
    { id: 'co3_acid', reagent: 'Acid', observation: 'Effervescence (bubbles). CO2 gas produced.', gasEvolved: 'CO2', precipitateColor: 'bg-transparent' },
  ]
};


import React from 'react';

interface Props {
  id: string;
  formula?: string;
  className?: string;
}

const MoleculeStructure: React.FC<Props> = ({ id, formula, className }) => {
  const atomStyle = "fill-slate-200 text-[12px] font-bold font-mono text-center dominant-baseline-middle text-anchor-middle";
  const bondStyle = "stroke-slate-400 stroke-[2px]";

  switch (id) {
      case 'methane':
          return (
              <svg viewBox="0 0 200 200" className={className}>
                  <text x="100" y="100" className={atomStyle}>C</text>
                  <line x1="100" y1="90" x2="100" y2="60" className={bondStyle} />
                  <text x="100" y="50" className={atomStyle}>H</text>
                  <line x1="100" y1="110" x2="100" y2="140" className={bondStyle} />
                  <text x="100" y="150" className={atomStyle}>H</text>
                  <line x1="90" y1="100" x2="60" y2="100" className={bondStyle} />
                  <text x="50" y="100" className={atomStyle}>H</text>
                  <line x1="110" y1="100" x2="140" y2="100" className={bondStyle} />
                  <text x="150" y="100" className={atomStyle}>H</text>
              </svg>
          );
      case 'ethane':
          return (
              <svg viewBox="0 0 200 200" className={className}>
                  <text x="80" y="100" className={atomStyle}>C</text>
                  <text x="120" y="100" className={atomStyle}>C</text>
                  <line x1="90" y1="100" x2="110" y2="100" className={bondStyle} />
                  {/* Left H's */}
                  <line x1="80" y1="90" x2="80" y2="60" className={bondStyle} /><text x="80" y="50" className={atomStyle}>H</text>
                  <line x1="80" y1="110" x2="80" y2="140" className={bondStyle} /><text x="80" y="150" className={atomStyle}>H</text>
                  <line x1="70" y1="100" x2="50" y2="100" className={bondStyle} /><text x="40" y="100" className={atomStyle}>H</text>
                  {/* Right H's */}
                  <line x1="120" y1="90" x2="120" y2="60" className={bondStyle} /><text x="120" y="50" className={atomStyle}>H</text>
                  <line x1="120" y1="110" x2="120" y2="140" className={bondStyle} /><text x="120" y="150" className={atomStyle}>H</text>
                  <line x1="130" y1="100" x2="150" y2="100" className={bondStyle} /><text x="160" y="100" className={atomStyle}>H</text>
              </svg>
          );
      case 'ethene':
           return (
              <svg viewBox="0 0 200 200" className={className}>
                  <text x="80" y="100" className={atomStyle}>C</text>
                  <text x="120" y="100" className={atomStyle}>C</text>
                  <line x1="90" y1="98" x2="110" y2="98" className={bondStyle} />
                  <line x1="90" y1="102" x2="110" y2="102" className={bondStyle} />
                  {/* H's angled */}
                  <line x1="75" y1="90" x2="60" y2="70" className={bondStyle} /><text x="55" y="65" className={atomStyle}>H</text>
                  <line x1="75" y1="110" x2="60" y2="130" className={bondStyle} /><text x="55" y="135" className={atomStyle}>H</text>
                  <line x1="125" y1="90" x2="140" y2="70" className={bondStyle} /><text x="145" y="65" className={atomStyle}>H</text>
                  <line x1="125" y1="110" x2="140" y2="130" className={bondStyle} /><text x="145" y="135" className={atomStyle}>H</text>
              </svg>
          );
      case 'ethanol':
          return (
              <svg viewBox="0 0 200 200" className={className}>
                  <g transform="translate(-10,0)">
                      <text x="60" y="100" className={atomStyle}>C</text>
                      <line x1="70" y1="100" x2="90" y2="100" className={bondStyle} />
                      <text x="100" y="100" className={atomStyle}>C</text>
                      <line x1="110" y1="100" x2="130" y2="100" className={bondStyle} />
                      <text x="140" y="100" className={atomStyle}>O</text>
                      <line x1="150" y1="100" x2="160" y2="100" className={bondStyle} />
                      <text x="170" y="100" className={atomStyle}>H</text>
                      {/* Hydrogens */}
                      <line x1="60" y1="90" x2="60" y2="70" className={bondStyle} /><text x="60" y="60" className={atomStyle}>H</text>
                      <line x1="60" y1="110" x2="60" y2="130" className={bondStyle} /><text x="60" y="140" className={atomStyle}>H</text>
                      <line x1="50" y1="100" x2="30" y2="100" className={bondStyle} /><text x="20" y="100" className={atomStyle}>H</text>
                      <line x1="100" y1="90" x2="100" y2="70" className={bondStyle} /><text x="100" y="60" className={atomStyle}>H</text>
                      <line x1="100" y1="110" x2="100" y2="130" className={bondStyle} /><text x="100" y="140" className={atomStyle}>H</text>
                  </g>
              </svg>
          );
       default:
          return (
            <svg viewBox="0 0 200 200" className={className}>
                <text x="100" y="100" className={atomStyle} fontSize="16">{formula || id}</text>
            </svg>
          );
  }
};

export default MoleculeStructure;

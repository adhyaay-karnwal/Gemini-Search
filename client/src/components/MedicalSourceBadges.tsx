import React from 'react';

// Define common medical sources with their names and optional icons/colors
const MEDICAL_SOURCES = {
  'sympalyze': { name: 'sympalyze' },
  'MedlinePlus': { name: 'MedlinePlus' },
  'Mayo Clinic': { name: 'Mayo Clinic' },
  'WebMD': { name: 'WebMD' },
  'Cleveland Clinic': { name: 'Cleveland Clinic' },
  'NIH': { name: 'NIH' },
  'CDC': { name: 'CDC' },
  'JAMA': { name: 'JAMA' },
  'BMJ': { name: 'BMJ' },
  'PubMed': { name: 'PubMed' },
  'Healthline': { name: 'Healthline' },
  'NHS': { name: 'NHS' },
  'NEJM': { name: 'NEJM' },
};

type MedicalSourceKey = keyof typeof MEDICAL_SOURCES;

interface MedicalSourceBadgesProps {
  sources: string[];
  className?: string;
}

export function MedicalSourceBadges({ sources, className = '' }: MedicalSourceBadgesProps) {
  if (!sources.length) return null;

  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      {sources.map((source, index) => {
        // Check if the source is in our predefined list
        const isKnownSource = source in MEDICAL_SOURCES;
        const displayName = isKnownSource 
          ? MEDICAL_SOURCES[source as MedicalSourceKey].name 
          : source;
        
        return (
          <div 
            key={`${source}-${index}`} 
            className="source-badge"
          >
            {displayName}
          </div>
        );
      })}
    </div>
  );
}

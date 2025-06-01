import React from 'react';
import { X } from 'lucide-react';

interface SelectedSymptomsProps {
  symptoms: string[];
  onRemove: (symptom: string) => void;
  className?: string;
}

export function SelectedSymptoms({ symptoms, onRemove, className = '' }: SelectedSymptomsProps) {
  if (!symptoms.length) return null;

  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      <div className="flex items-center mr-2 text-muted-foreground">
        <span className="text-sm">Selected Symptoms</span>
      </div>
      {symptoms.map((symptom) => (
        <div key={symptom} className="symptom-tag">
          <span>{symptom}</span>
          <button 
            onClick={() => onRemove(symptom)}
            aria-label={`Remove ${symptom}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

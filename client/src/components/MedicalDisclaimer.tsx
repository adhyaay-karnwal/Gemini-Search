import React from 'react';

interface MedicalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function MedicalDisclaimer({ 
  className = '', 
  compact = false 
}: MedicalDisclaimerProps) {
  const text = compact 
    ? "For informational purposes only. Not a substitute for professional medical advice."
    : "For informational purposes only. Not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.";

  return (
    <div className={`medical-disclaimer ${className}`}>
      <p className="text-center text-muted-foreground text-xs">
        {text}
      </p>
    </div>
  );
}

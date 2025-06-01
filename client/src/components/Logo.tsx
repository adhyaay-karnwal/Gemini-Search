import React from 'react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export function Logo({ className = '', animate = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h1 className={`text-4xl font-bold text-primary ${animate ? 'animate-pulse' : ''}`}>
        sympalyze
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Healthcare meets AI
      </p>
    </div>
  );
}

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { MedicalSearchInput } from '@/components/MedicalSearchInput';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export function Home() {
  const [, setLocation] = useLocation();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);

  const handleSearch = (query: string, symptoms: string[], image: File | null) => {
    if (query.trim()) {
      // Store symptoms and image in sessionStorage to persist across navigation
      if (symptoms.length > 0) {
        sessionStorage.setItem('selectedSymptoms', JSON.stringify(symptoms));
      }
      
      // Navigate to search page with query
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <ThemeToggle />
      <div className="w-full max-w-3xl px-4 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-6" />
        </div>
        
        <MedicalSearchInput
          onSearch={handleSearch}
          placeholder="Ask any medical question..."
          autoFocus
        />

        <div className="mt-16">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}

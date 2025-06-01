import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';

// Define symptom categories and items
const symptomCategories = {
  'General': [
    'Fever', 'Fatigue', 'Weakness', 'Loss of appetite', 
    'Weight loss', 'Weight gain', 'Chills', 'Night sweats'
  ],
  'Head & Neck': [
    'Headache', 'Dizziness', 'Sore throat', 'Neck pain',
    'Vision changes', 'Hearing loss', 'Ear pain', 'Nasal congestion'
  ],
  'Chest': [
    'Chest pain', 'Shortness of breath', 'Cough', 'Wheezing',
    'Heart palpitations', 'Coughing up blood'
  ],
  'Abdomen': [
    'Abdominal pain', 'Nausea', 'Vomiting', 'Diarrhea',
    'Constipation', 'Bloating', 'Blood in stool'
  ],
  'Skin': [
    'Rash', 'Itching', 'Bruising', 'Discoloration',
    'Swelling', 'Dryness', 'Changes in moles'
  ],
  'Musculoskeletal': [
    'Joint pain', 'Muscle pain', 'Back pain', 'Stiffness',
    'Swelling of joints', 'Limited range of motion'
  ],
  'Neurological': [
    'Numbness', 'Tingling', 'Seizures', 'Confusion',
    'Memory problems', 'Difficulty speaking', 'Balance problems'
  ]
};

interface SymptomSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymptoms: string[];
  onSelectSymptom: (symptom: string) => void;
  onRemoveSymptom: (symptom: string) => void;
}

export function SymptomSelector({
  isOpen,
  onClose,
  selectedSymptoms,
  onSelectSymptom,
  onRemoveSymptom
}: SymptomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Record<string, string[]>>(symptomCategories);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter symptoms based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(symptomCategories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, string[]> = {};

    Object.entries(symptomCategories).forEach(([category, symptoms]) => {
      const matchingSymptoms = symptoms.filter(symptom => 
        symptom.toLowerCase().includes(query)
      );
      
      if (matchingSymptoms.length > 0) {
        filtered[category] = matchingSymptoms;
      }
    });

    setFilteredCategories(filtered);
  }, [searchQuery]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle checkbox change
  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      onRemoveSymptom(symptom);
    } else {
      onSelectSymptom(symptom);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div 
        ref={modalRef}
        className="modal-content"
        aria-modal="true"
        role="dialog"
        aria-labelledby="symptom-selector-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="symptom-selector-title" className="text-xl font-semibold">Select Your Symptoms</h2>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-3">
              {selectedSymptoms.length} selected
            </span>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Symptom categories */}
        <div className="overflow-y-auto max-h-[50vh] pr-2">
          {Object.keys(filteredCategories).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No symptoms match your search</p>
          ) : (
            Object.entries(filteredCategories).map(([category, symptoms]) => (
              <div key={category} className="mb-6">
                <h3 className="font-medium mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {symptoms.map(symptom => (
                    <div 
                      key={symptom} 
                      className="flex items-center border border-border rounded-lg p-3 hover:bg-muted/30"
                    >
                      <input
                        type="checkbox"
                        id={`symptom-${symptom}`}
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label 
                        htmlFor={`symptom-${symptom}`}
                        className="ml-2 text-sm font-medium cursor-pointer flex-1"
                      >
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

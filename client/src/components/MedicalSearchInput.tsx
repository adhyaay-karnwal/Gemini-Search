import React, { useState, FormEvent } from 'react';
import { Search, Image, Stethoscope, Send, X } from 'lucide-react';
import { SymptomSelector } from './SymptomSelector';
import { ImageAttachment } from './ImageAttachment';
import { SelectedSymptoms } from './SelectedSymptoms';

interface MedicalSearchInputProps {
  onSearch: (query: string, symptoms: string[], image?: File | null) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function MedicalSearchInput({
  onSearch,
  placeholder = "Ask any medical question...",
  initialQuery = "",
  className = "",
  autoFocus = false,
  disabled = false,
}: MedicalSearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [showSymptomSelector, setShowSymptomSelector] = useState(false);
  const [showImageAttachment, setShowImageAttachment] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), selectedSymptoms, attachedImage);
    }
  };

  const handleSymptomSelect = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSymptomRemove = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleImageAttached = (file: File) => {
    setAttachedImage(file);
    setShowImageAttachment(false);
  };

  const handleImageRemoved = () => {
    setAttachedImage(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 text-lg rounded-full border border-gray-200 
                     focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none 
                     transition-all duration-300 shadow-sm 
                     group-hover:shadow-lg group-hover:border-gray-300
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white
                     dark:focus:border-primary dark:group-hover:border-gray-600
                     pr-32 truncate"
            disabled={disabled}
            autoFocus={autoFocus}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              type="button"
              onClick={() => setShowSymptomSelector(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-300 text-gray-500 dark:text-gray-400"
              aria-label="Select symptoms"
              disabled={disabled}
            >
              <Stethoscope className="w-5 h-5" />
            </button>
            
            <button 
              type="button"
              onClick={() => setShowImageAttachment(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-300 text-gray-500 dark:text-gray-400"
              aria-label="Attach image"
              disabled={disabled}
            >
              <Image className="w-5 h-5" />
            </button>
            
            <button 
              type="submit"
              disabled={!query.trim() || disabled}
              className="p-2 rounded-full bg-primary text-white
                       hover:bg-primary/90 transition-all duration-300 
                       hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100
                       disabled:hover:bg-primary"
              aria-label="Search"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Display selected symptoms and attached image */}
      <div className="mt-4 space-y-3">
        <SelectedSymptoms 
          symptoms={selectedSymptoms} 
          onRemove={handleSymptomRemove} 
        />
        
        {attachedImage && (
          <div className="mt-2">
            <div className="flex items-center mb-1">
              <Image className="w-4 h-4 mr-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Attached Image</span>
            </div>
            <div className="image-attachment max-w-[240px]">
              <img 
                src={URL.createObjectURL(attachedImage)} 
                alt="Attached medical image" 
                className="max-h-40" 
              />
              <button 
                onClick={handleImageRemoved} 
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SymptomSelector
        isOpen={showSymptomSelector}
        onClose={() => setShowSymptomSelector(false)}
        selectedSymptoms={selectedSymptoms}
        onSelectSymptom={handleSymptomSelect}
        onRemoveSymptom={handleSymptomRemove}
      />
      
      <ImageAttachment
        isOpen={showImageAttachment}
        onClose={() => setShowImageAttachment(false)}
        onImageAttached={handleImageAttached}
        attachedImage={attachedImage}
        onImageRemoved={handleImageRemoved}
      />
    </div>
  );
}

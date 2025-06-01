import React, { useState, FormEvent } from 'react';
import { Search, Image, Stethoscope, Send, X } from 'lucide-react';
import { SymptomSelector } from './SymptomSelector';
import { ImageAttachment } from './ImageAttachment';
import { SelectedSymptoms } from './SelectedSymptoms';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // State for hover animations (only on landing page)
  const [hoveredIcon, setHoveredIcon] = useState<'symptoms' | 'image' | null>(null);
  
  // Determine if we're on the landing page (using autoFocus as a signal)
  const isLandingPage = autoFocus;

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
            <div className="relative">
              {isLandingPage ? (
                <motion.div 
                  className="relative z-10"
                  onMouseEnter={() => setHoveredIcon('symptoms')}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <AnimatePresence>
                    {hoveredIcon === 'symptoms' ? (
                      <motion.button
                        type="button"
                        onClick={() => setShowSymptomSelector(true)}
                        className="pl-2 pr-3 py-2 rounded-full bg-primary/10 text-primary
                                flex items-center gap-2 transition-all duration-300"
                        initial={{ width: 40, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 40, opacity: 0 }}
                        disabled={disabled}
                      >
                        <Stethoscope className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">Select symptoms</span>
                      </motion.button>
                    ) : (
                      <motion.button 
                        type="button"
                        onClick={() => setShowSymptomSelector(true)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                                transition-all duration-300 text-gray-500 dark:text-gray-400"
                        aria-label="Select symptoms"
                        disabled={disabled}
                      >
                        <Stethoscope className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
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
              )}
            </div>
            
            <div className="relative">
              {isLandingPage ? (
                <motion.div 
                  className="relative z-10"
                  onMouseEnter={() => setHoveredIcon('image')}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <AnimatePresence>
                    {hoveredIcon === 'image' ? (
                      <motion.button
                        type="button"
                        onClick={() => setShowImageAttachment(true)}
                        className="pl-2 pr-3 py-2 rounded-full bg-primary/10 text-primary
                                flex items-center gap-2 transition-all duration-300"
                        initial={{ width: 40, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 40, opacity: 0 }}
                        disabled={disabled}
                      >
                        <Image className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">Upload a picture</span>
                      </motion.button>
                    ) : (
                      <motion.button 
                        type="button"
                        onClick={() => setShowImageAttachment(true)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                                transition-all duration-300 text-gray-500 dark:text-gray-400"
                        aria-label="Attach image"
                        disabled={disabled}
                      >
                        <Image className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
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
              )}
            </div>
            
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

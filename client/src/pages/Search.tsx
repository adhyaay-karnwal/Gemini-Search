import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { SearchResults } from '@/components/SearchResults';
import { FollowUpInput } from '@/components/FollowUpInput';
import { MedicalSearchInput } from '@/components/MedicalSearchInput';
import { SelectedSymptoms } from '@/components/SelectedSymptoms';
import { FollowUpQuestion } from '@/components/FollowUpQuestion';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { MedicalSourceBadges } from '@/components/MedicalSourceBadges';
import { X } from 'lucide-react';

// Function to search using the API
async function searchApi(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred while searching');
  }
  return response.json();
}

// Function to send follow-up questions
async function sendFollowUp(sessionId: string, query: string) {
  const response = await fetch('/api/follow-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      query,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred with your follow-up question');
  }
  return response.json();
}

export function Search() {
  const [, params] = useRoute('/search');
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [originalQuery, setOriginalQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [medicalSources, setMedicalSources] = useState<string[]>([
    'sympalyze', 'MedlinePlus', 'Mayo Clinic', 'WebMD', 'Cleveland Clinic'
  ]);

  // Extract query from URL on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const q = searchParams.get('q');
    
    if (q) {
      setQuery(q);
    } else {
      // Redirect to home if no query
      setLocation('/');
    }

    // Load selected symptoms from sessionStorage if available
    const storedSymptoms = sessionStorage.getItem('selectedSymptoms');
    if (storedSymptoms) {
      try {
        const symptoms = JSON.parse(storedSymptoms);
        setSelectedSymptoms(symptoms);
      } catch (error) {
        console.error('Error parsing stored symptoms:', error);
      }
    }
  }, [location, setLocation]);

  // Generate preview URL when image changes
  useEffect(() => {
    if (attachedImage) {
      const url = URL.createObjectURL(attachedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [attachedImage]);

  // Initial search query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['search', query, selectedSymptoms],
    queryFn: () => searchApi(query),
    enabled: !!query,
    staleTime: Infinity,
  });

  // Follow-up query
  const { 
    data: followUpData, 
    isLoading: isFollowUpLoading, 
    error: followUpError,
    refetch: refetchFollowUp 
  } = useQuery({
    queryKey: ['followUp', sessionId, followUpQuery],
    queryFn: () => sendFollowUp(sessionId!, followUpQuery),
    enabled: false,
    staleTime: Infinity,
  });

  // Update session ID when data is received
  useEffect(() => {
    if (data?.sessionId) {
      setSessionId(data.sessionId);
    }
  }, [data]);

  // Handle new search
  const handleSearch = (newQuery: string, symptoms: string[], image: File | null) => {
    // Reset follow-up state
    setIsFollowUp(false);
    setOriginalQuery('');
    setFollowUpQuery('');
    
    // Update symptoms and image
    setSelectedSymptoms(symptoms);
    setAttachedImage(image);
    
    // Store symptoms in sessionStorage
    if (symptoms.length > 0) {
      sessionStorage.setItem('selectedSymptoms', JSON.stringify(symptoms));
    } else {
      sessionStorage.removeItem('selectedSymptoms');
    }
    
    // Update URL and trigger search
    setLocation(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    setQuery(newQuery.trim());
    refetch();
  };

  // Handle follow-up question
  const handleFollowUp = (question: string) => {
    if (!sessionId) return;
    
    setIsFollowUp(true);
    setOriginalQuery(query);
    setFollowUpQuery(question);
    setQuery(question); // Update current query to follow-up
    refetchFollowUp();
  };

  // Handle symptom removal
  const handleRemoveSymptom = (symptom: string) => {
    const updatedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    setSelectedSymptoms(updatedSymptoms);
    
    // Update sessionStorage
    if (updatedSymptoms.length > 0) {
      sessionStorage.setItem('selectedSymptoms', JSON.stringify(updatedSymptoms));
    } else {
      sessionStorage.removeItem('selectedSymptoms');
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setAttachedImage(null);
    setPreviewUrl(null);
  };

  // Determine which data to display
  const displayData = isFollowUp && followUpData ? followUpData : data;
  const displayLoading = isFollowUp ? isFollowUpLoading : isLoading;
  const displayError = isFollowUp ? followUpError : error;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border py-3">
        <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <Logo className="text-xl" />
            </a>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        {/* Search input */}
        <div className="mb-8">
          <MedicalSearchInput
            onSearch={handleSearch}
            initialQuery={query}
            placeholder="Ask any medical question..."
          />
        </div>

        {/* Selected symptoms and attached image */}
        <div className="mb-6 space-y-3">
          <SelectedSymptoms 
            symptoms={selectedSymptoms} 
            onRemove={handleRemoveSymptom} 
          />
          
          {previewUrl && (
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <span className="text-sm text-muted-foreground">Attached Image</span>
              </div>
              <div className="image-attachment max-w-[240px]">
                <img 
                  src={previewUrl} 
                  alt="Attached medical image" 
                  className="max-h-40" 
                />
                <button 
                  onClick={handleRemoveImage} 
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Query display and results */}
        <div className="mb-6">
          {displayData && !displayLoading && (
            <div className="mb-4">
              <MedicalSourceBadges sources={medicalSources} />
            </div>
          )}

          <SearchResults
            query={query}
            results={displayData}
            isLoading={displayLoading}
            error={displayError as Error}
            isFollowUp={isFollowUp}
            originalQuery={originalQuery}
          />
        </div>

        {/* Follow-up question input */}
        {displayData && !displayLoading && !displayError && (
          <div className="mt-8 mb-6">
            <FollowUpQuestion
              onSubmit={handleFollowUp}
              disabled={isFollowUpLoading}
            />
          </div>
        )}

        {/* Medical disclaimer */}
        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </main>
    </div>
  );
}

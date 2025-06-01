import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { MedicalSearchInput } from '@/components/MedicalSearchInput';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useConversations } from '@/context/ConversationsProvider';

export function Home() {
  const [, setLocation] = useLocation();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const { createNewConversation } = useConversations();

  // Load symptoms from sessionStorage if available
  useEffect(() => {
    const storedSymptoms = sessionStorage.getItem('selectedSymptoms');
    if (storedSymptoms) {
      try {
        const symptoms = JSON.parse(storedSymptoms);
        setSelectedSymptoms(symptoms);
      } catch (error) {
        console.error('Error parsing stored symptoms:', error);
      }
    }
  }, []);

  const handleSearch = (query: string, symptoms: string[], image: File | null) => {
    if (query.trim()) {
      // Convert image to base64 if present
      if (image) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Create a new conversation with the query, symptoms, and image
          const imageBase64 = reader.result as string;
          const conversation = createNewConversation(query, symptoms, imageBase64);
          
          // Navigate to the search page with the conversation ID
          setLocation(`/search/${conversation.id}`);
        };
        reader.readAsDataURL(image);
      } else {
        // Create a new conversation with just the query and symptoms
        const conversation = createNewConversation(query, symptoms);
        
        // Navigate to the search page with the conversation ID
        setLocation(`/search/${conversation.id}`);
      }
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

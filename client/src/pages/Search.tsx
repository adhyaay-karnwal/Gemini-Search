import React, { useState, useEffect } from 'react';
import { useLocation, useRoute, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { ConversationView } from '@/components/ConversationView';
import { useConversations } from '@/context/ConversationsProvider';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { Source } from '@/lib/conversations';

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
  const [, params] = useRoute('/search/:id');
  const [isLegacyRoute, setIsLegacyRoute] = useState(false);
  const [location, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    state, 
    createNewConversation, 
    addMessage, 
    getActiveConversation, 
    setActiveConversation 
  } = useConversations();
  
  // Get conversation ID from URL
  const conversationId = params?.id || state.activeConversationId;
  
  // Check if we're using a legacy URL format (/search?q=)
  useEffect(() => {
    if (location.startsWith('/search?')) {
      setIsLegacyRoute(true);
      const searchParams = new URLSearchParams(location.split('?')[1]);
      const query = searchParams.get('q');
      
      if (query) {
        // Create a new conversation from the query parameter
        const newConversation = createNewConversation(query);
        
        // Redirect to the new URL format
        setLocation(`/search/${newConversation.id}`);
      } else {
        // No query, redirect to home
        setLocation('/');
      }
    } else {
      setIsLegacyRoute(false);
    }
  }, [location, setLocation, createNewConversation]);

  // Set active conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId, setActiveConversation]);

  // Get the active conversation
  const activeConversation = getActiveConversation();

  // If no active conversation and not in a legacy route, redirect to home
  useEffect(() => {
    if (!activeConversation && !isLegacyRoute && !params?.id) {
      setLocation('/');
    }
  }, [activeConversation, isLegacyRoute, params, setLocation]);

  // Initial search query
  const { refetch: searchRefetch } = useQuery({
    queryKey: ['search', activeConversation?.id],
    queryFn: async () => {
      if (!activeConversation) return null;
      
      // Get the first user message
      const firstUserMessage = activeConversation.messages.find(m => m.role === 'user');
      if (!firstUserMessage) return null;
      
      setIsLoading(true);
      try {
        // Call search API
        const result = await searchApi(firstUserMessage.content);
        
        // Store session ID for follow-ups
        if (result.sessionId) {
          setSessionId(result.sessionId);
        }
        
        // Add assistant response to conversation
        addMessage(
          activeConversation.id, 
          result.summary, 
          'assistant', 
          result.sources?.map((s: any) => ({ 
            title: s.title, 
            url: s.url, 
            snippet: s.snippet 
          }))
        );
        
        return result;
      } catch (error) {
        console.error('Search error:', error);
        // Add error message to conversation
        addMessage(
          activeConversation.id,
          `<p class="text-red-500">Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}</p>`,
          'assistant'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: false, // Don't run automatically
  });

  // Follow-up query
  const { refetch: followUpRefetch } = useQuery({
    queryKey: ['followUp', sessionId, activeConversation?.id],
    queryFn: async () => {
      if (!activeConversation || !sessionId) return null;
      
      // Get the last user message
      const lastUserMessage = [...activeConversation.messages]
        .reverse()
        .find(m => m.role === 'user');
        
      if (!lastUserMessage) return null;
      
      setIsLoading(true);
      try {
        // Call follow-up API
        const result = await sendFollowUp(sessionId, lastUserMessage.content);
        
        // Add assistant response to conversation
        addMessage(
          activeConversation.id, 
          result.summary, 
          'assistant', 
          result.sources?.map((s: any) => ({ 
            title: s.title, 
            url: s.url, 
            snippet: s.snippet 
          }))
        );
        
        return result;
      } catch (error) {
        console.error('Follow-up error:', error);
        // Add error message to conversation
        addMessage(
          activeConversation.id,
          `<p class="text-red-500">Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}</p>`,
          'assistant'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    enabled: false, // Don't run automatically
  });

  // Check if we need to fetch results (if conversation has only user messages)
  useEffect(() => {
    if (activeConversation) {
      const hasOnlyUserMessages = activeConversation.messages.every(m => m.role === 'user');
      const hasMultipleMessages = activeConversation.messages.length > 1;
      
      if (hasOnlyUserMessages && !isLoading) {
        // Initial search
        searchRefetch();
      } else if (hasMultipleMessages && !isLoading) {
        // Check if the last message is from the user and needs a response
        const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
        if (lastMessage.role === 'user') {
          // Follow-up
          followUpRefetch();
        }
      }
    }
  }, [activeConversation, isLoading, searchRefetch, followUpRefetch]);

  // Handle follow-up question
  const handleSendFollowUp = (question: string) => {
    if (!activeConversation) return;
    
    // Add user message to conversation
    addMessage(activeConversation.id, question, 'user');
  };

  // Loading or no conversation
  if (isLegacyRoute || !activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <Logo animate />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      {/* Main conversation view */}
      <div className="flex-1 overflow-hidden">
        <ConversationView
          conversationId={activeConversation.id}
          onSendFollowUp={handleSendFollowUp}
          isLoading={isLoading}
        />
      </div>
      
      {/* Footer with disclaimer */}
      <div className="p-4 border-t border-border">
        <MedicalDisclaimer compact />
      </div>
    </div>
  );
}

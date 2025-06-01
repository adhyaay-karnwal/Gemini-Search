import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  ConversationsState,
  Conversation,
  Message,
  Source,
  initConversationsState,
  saveConversationsState,
  createConversation,
  addMessageToConversation,
  updateConversationTitle,
  deleteConversation as deleteConversationUtil,
  setActiveConversation as setActiveConversationUtil
} from '@/lib/conversations';

// Define actions for the reducer
type ConversationsAction =
  | { type: 'INIT'; payload: ConversationsState }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; content: string; role: 'user' | 'assistant'; sources?: Source[] } }
  | { type: 'UPDATE_TITLE'; payload: { conversationId: string; title: string } };

// Define the context value type
interface ConversationsContextValue {
  state: ConversationsState;
  createNewConversation: (query: string, symptoms?: string[], imageAttachment?: string) => Conversation;
  addMessage: (conversationId: string, content: string, role: 'user' | 'assistant', sources?: Source[]) => void;
  updateTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  getActiveConversation: () => Conversation | undefined;
}

// Create the context
const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);

// Reducer function for managing state
function conversationsReducer(state: ConversationsState, action: ConversationsAction): ConversationsState {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    
    case 'SET_ACTIVE_CONVERSATION':
      return setActiveConversationUtil(state, action.payload);
    
    case 'ADD_CONVERSATION': {
      const newState = {
        ...state,
        conversations: [action.payload, ...state.conversations],
        activeConversationId: action.payload.id
      };
      saveConversationsState(newState);
      return newState;
    }
    
    case 'UPDATE_CONVERSATION': {
      const newState = {
        ...state,
        conversations: state.conversations.map(conversation => 
          conversation.id === action.payload.id ? action.payload : conversation
        )
      };
      saveConversationsState(newState);
      return newState;
    }
    
    case 'DELETE_CONVERSATION':
      return deleteConversationUtil(state, action.payload);
    
    case 'ADD_MESSAGE': {
      const { conversationId, content, role, sources } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      
      if (!conversation) return state;
      
      const updatedConversation = addMessageToConversation(conversation, content, role, sources);
      
      const newState = {
        ...state,
        conversations: state.conversations.map(c => 
          c.id === conversationId ? updatedConversation : c
        )
      };
      
      saveConversationsState(newState);
      return newState;
    }
    
    case 'UPDATE_TITLE': {
      const { conversationId, title } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      
      if (!conversation) return state;
      
      const updatedConversation = updateConversationTitle(conversation, title);
      
      const newState = {
        ...state,
        conversations: state.conversations.map(c => 
          c.id === conversationId ? updatedConversation : c
        )
      };
      
      saveConversationsState(newState);
      return newState;
    }
    
    default:
      return state;
  }
}

// Provider component
export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationsReducer, { conversations: [], activeConversationId: null });
  
  // Initialize state from localStorage on mount
  useEffect(() => {
    const initialState = initConversationsState();
    dispatch({ type: 'INIT', payload: initialState });
  }, []);
  
  // Create a new conversation
  const createNewConversation = (query: string, symptoms: string[] = [], imageAttachment?: string) => {
    const newConversation = createConversation(query, symptoms, imageAttachment);
    dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
    return newConversation;
  };
  
  // Add a message to a conversation
  const addMessage = (conversationId: string, content: string, role: 'user' | 'assistant', sources?: Source[]) => {
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { conversationId, content, role, sources } 
    });
  };
  
  // Update a conversation title
  const updateTitle = (conversationId: string, title: string) => {
    dispatch({ 
      type: 'UPDATE_TITLE', 
      payload: { conversationId, title } 
    });
  };
  
  // Delete a conversation
  const deleteConversation = (conversationId: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
  };
  
  // Set the active conversation
  const setActiveConversation = (conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
  };
  
  // Get the active conversation
  const getActiveConversation = () => {
    if (!state.activeConversationId) return undefined;
    return state.conversations.find(c => c.id === state.activeConversationId);
  };
  
  // Context value
  const value: ConversationsContextValue = {
    state,
    createNewConversation,
    addMessage,
    updateTitle,
    deleteConversation,
    setActiveConversation,
    getActiveConversation
  };
  
  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

// Custom hook for using the conversations context
export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}

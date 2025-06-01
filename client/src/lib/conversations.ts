import { v4 as uuidv4 } from 'uuid';

// Types for conversations and messages
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  sources?: Source[];
}

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  symptoms?: string[];
  imageAttachment?: string; // Base64 encoded image
}

export interface ConversationsState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

// Local storage key
const STORAGE_KEY = 'sympalyze-conversations';

// Initialize conversations state
export function initConversationsState(): ConversationsState {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error);
  }
  
  return {
    conversations: [],
    activeConversationId: null
  };
}

// Save conversations state to localStorage
export function saveConversationsState(state: ConversationsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save conversations to localStorage:', error);
  }
}

// Create a new conversation
export function createConversation(
  initialQuery: string,
  symptoms: string[] = [],
  imageAttachment?: string
): Conversation {
  const now = Date.now();
  return {
    id: uuidv4(),
    title: initialQuery.length > 60 
      ? `${initialQuery.substring(0, 57)}...` 
      : initialQuery,
    messages: [
      {
        id: uuidv4(),
        content: initialQuery,
        role: 'user',
        timestamp: now
      }
    ],
    createdAt: now,
    updatedAt: now,
    symptoms,
    imageAttachment
  };
}

// Add a message to a conversation
export function addMessageToConversation(
  conversation: Conversation,
  content: string,
  role: 'user' | 'assistant',
  sources?: Source[]
): Conversation {
  const now = Date.now();
  return {
    ...conversation,
    messages: [
      ...conversation.messages,
      {
        id: uuidv4(),
        content,
        role,
        timestamp: now,
        sources
      }
    ],
    updatedAt: now
  };
}

// Update conversation title
export function updateConversationTitle(
  conversation: Conversation,
  title: string
): Conversation {
  return {
    ...conversation,
    title,
    updatedAt: Date.now()
  };
}

// Get all conversations
export function getAllConversations(state: ConversationsState): Conversation[] {
  return state.conversations;
}

// Get a conversation by ID
export function getConversationById(
  state: ConversationsState,
  id: string
): Conversation | undefined {
  return state.conversations.find(conversation => conversation.id === id);
}

// Delete a conversation
export function deleteConversation(
  state: ConversationsState,
  id: string
): ConversationsState {
  const newState = {
    ...state,
    conversations: state.conversations.filter(conversation => conversation.id !== id)
  };
  
  // If the active conversation is being deleted, set activeConversationId to null
  if (state.activeConversationId === id) {
    newState.activeConversationId = null;
  }
  
  saveConversationsState(newState);
  return newState;
}

// Set active conversation
export function setActiveConversation(
  state: ConversationsState,
  id: string | null
): ConversationsState {
  const newState = {
    ...state,
    activeConversationId: id
  };
  
  saveConversationsState(newState);
  return newState;
}

// Update a conversation in the state
export function updateConversation(
  state: ConversationsState,
  updatedConversation: Conversation
): ConversationsState {
  const newState = {
    ...state,
    conversations: state.conversations.map(conversation => 
      conversation.id === updatedConversation.id ? updatedConversation : conversation
    )
  };
  
  saveConversationsState(newState);
  return newState;
}

// Add a new conversation to the state
export function addConversation(
  state: ConversationsState,
  conversation: Conversation
): ConversationsState {
  const newState = {
    ...state,
    conversations: [conversation, ...state.conversations],
    activeConversationId: conversation.id
  };
  
  saveConversationsState(newState);
  return newState;
}

// Get the last message from a conversation
export function getLastMessage(conversation: Conversation): Message | undefined {
  if (conversation.messages.length === 0) return undefined;
  return conversation.messages[conversation.messages.length - 1];
}

// Get the first user message (usually the initial query)
export function getFirstUserMessage(conversation: Conversation): Message | undefined {
  return conversation.messages.find(message => message.role === 'user');
}

// Format date for display
export function formatConversationDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

import React, { useRef, useEffect } from 'react';
import { useConversations } from '@/context/ConversationsProvider';
import { MedicalSourceBadges } from './MedicalSourceBadges';
import { FollowUpQuestion } from './FollowUpQuestion';
import { Message, Source } from '@/lib/conversations';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Logo } from './Logo';

interface ConversationViewProps {
  conversationId: string;
  onSendFollowUp: (question: string) => void;
  isLoading?: boolean;
}

export function ConversationView({ 
  conversationId, 
  onSendFollowUp,
  isLoading = false
}: ConversationViewProps) {
  const { state } = useConversations();
  const conversation = state.conversations.find(c => c.id === conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or when loading completes
  useEffect(() => {
    if (messagesEndRef.current && !isLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isLoading]);

  // If conversation not found
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  // Get the title (first user message)
  const title = conversation.messages.find(m => m.role === 'user')?.content || 'Medical Conversation';

  // Default medical sources for display
  const defaultSources = ['sympalyze', 'MedlinePlus', 'Mayo Clinic', 'WebMD', 'Cleveland Clinic'];

  // Render message based on role
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isLastMessage = index === conversation.messages.length - 1;
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.4 }}
        className={`mb-6 ${isUser ? '' : 'mt-8'}`}
      >
        {/* User message */}
        {isUser ? (
          <div className="flex justify-end mb-4">
            <div className="bg-primary/10 text-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
              <p>{message.content}</p>
            </div>
          </div>
        ) : (
          // Assistant message
          <div className="space-y-4">
            {/* Source badges */}
            <MedicalSourceBadges 
              sources={message.sources?.map(s => s.title) || defaultSources} 
              className="mb-2"
            />
            
            {/* Main content */}
            <Card className="overflow-hidden shadow-md border border-border">
              <div className="py-6 px-6">
                <div
                  className={cn(
                    "prose prose-slate max-w-none",
                    "dark:prose-invert",
                    "prose-headings:font-semibold prose-headings:mb-4 prose-headings:text-primary",
                    "prose-h2:text-xl prose-h2:mt-6 prose-h2:pb-2",
                    "prose-h3:text-lg prose-h3:mt-5",
                    "prose-p:text-base prose-p:leading-7 prose-p:my-3",
                    "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6",
                    "prose-li:my-1 prose-li:marker:text-primary",
                    "prose-strong:font-semibold prose-strong:text-foreground",
                    "prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80",
                    "prose-hr:my-6 prose-hr:border-border",
                    "prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground"
                  )}
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                  }}
                />
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Title area */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4 px-6">
        <h1 className="text-xl font-medium truncate">{title}</h1>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <>
            {/* Display all messages */}
            {conversation.messages.map((message, index) => renderMessage(message, index))}
            
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-6 animate-in fade-in-50 mt-8">
                <div className="flex justify-center mb-4">
                  <Logo animate className="w-12 h-12" />
                </div>
                <Card className="p-6 shadow-md border border-border">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              </div>
            )}
            
            {/* Invisible element for scrolling to bottom */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Follow-up input - floating at bottom */}
      <div className="sticky bottom-6 left-0 right-0 px-6 z-10">
        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border">
          <FollowUpQuestion
            onSubmit={onSendFollowUp}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

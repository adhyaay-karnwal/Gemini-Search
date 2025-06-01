import React, { useState, useEffect } from 'react';
import { useConversations } from '@/context/ConversationsProvider';
import { formatConversationDate } from '@/lib/conversations';
import { PlusCircle, ChevronLeft, ChevronRight, Trash2, MessageSquare } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ConversationSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const { state, deleteConversation, setActiveConversation } = useConversations();
  const [, setLocation] = useLocation();
  const [isSearchRoute] = useRoute('/search/:id');

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewConversation = () => {
    setLocation('/');
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    setLocation(`/search/${conversationId}`);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-10 h-full w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <button
                onClick={handleNewConversation}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-primary transition-colors"
                aria-label="New conversation"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {state.conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={40} className="mb-2 opacity-50" />
                  <p className="mb-2">No conversations yet</p>
                  <p className="text-sm">Start a new conversation by asking a medical question.</p>
                </div>
              ) : (
                <ul className="space-y-1 px-2">
                  {state.conversations.map((conversation) => (
                    <li 
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      onMouseEnter={() => setIsHovering(conversation.id)}
                      onMouseLeave={() => setIsHovering(null)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors relative",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        conversation.id === state.activeConversationId && 
                        "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">{conversation.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatConversationDate(conversation.updatedAt)}
                          </p>
                        </div>
                        <AnimatePresence>
                          {(isHovering === conversation.id || conversation.id === state.activeConversationId) && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                              aria-label="Delete conversation"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Sympalyze • Healthcare meets AI
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile - closes sidebar when clicked */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-[5]"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}

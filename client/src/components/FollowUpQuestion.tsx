import React, { useState, FormEvent } from 'react';
import { Send, Image, Stethoscope } from 'lucide-react';

interface FollowUpQuestionProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FollowUpQuestion({
  onSubmit,
  disabled = false,
  className = ''
}: FollowUpQuestionProps) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="follow-up-input pr-14"
            disabled={disabled}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              type="submit"
              disabled={!question.trim() || disabled}
              className="p-2 rounded-full bg-primary text-white
                       hover:bg-primary/90 transition-all duration-300 
                       hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100
                       disabled:hover:bg-primary"
              aria-label="Send follow-up question"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

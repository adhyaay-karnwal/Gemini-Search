import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SourceList } from '@/components/SourceList';
import { Logo } from '@/components/Logo';

interface SearchResultsProps {
  query: string;
  results: any;
  isLoading: boolean;
  error?: Error;
  isFollowUp?: boolean;
  originalQuery?: string;
}

export function SearchResults({ 
  query,
  results,
  isLoading,
  error,
  isFollowUp,
  originalQuery
}: SearchResultsProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'An error occurred while searching. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in-50">
        <div className="flex justify-center mb-8">
          <Logo animate className="w-16 h-16" />
        </div>
        <Card className="p-6 shadow-md border border-border">
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
        <div className="space-y-2">
          <Skeleton className="h-[40px] w-full rounded-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div ref={contentRef} className="space-y-6 animate-in fade-in-50">
      {/* Search Query Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        {isFollowUp && originalQuery && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-xs sm:text-sm text-muted-foreground/70">
              <span>Original search:</span>
              <span className="font-medium">"{originalQuery}"</span>
            </div>
            <div className="h-px bg-border w-full" />
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 text-sm sm:text-base text-muted-foreground">
          <span>{isFollowUp ? 'Follow-up question:' : ''}</span>
          <h1 className="text-lg sm:text-3xl text-foreground font-medium">{query}</h1>
        </div>
      </motion.div>

      {/* Sources Section */}
      {results.sources && results.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SourceList sources={results.sources} />
        </motion.div>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden shadow-md border border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="py-6 px-8"
        >
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
              __html: results.summary
            }}
          />
        </motion.div>
      </Card>
    </div>
  );
}

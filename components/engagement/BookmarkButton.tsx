'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  contentId: string;
  contentType: 'post' | 'project';
  initialBookmarked: boolean;
  className?: string;
  folder?: string;
}

export function BookmarkButton({
  contentId,
  contentType,
  initialBookmarked,
  className,
  folder,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (!session) {
      toast.error('Please sign in to bookmark content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/engagement/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          action: isBookmarked ? 'remove' : 'add',
          folder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark status');
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBookmark}
      disabled={isLoading}
      className={cn(className)}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 fill-current text-yellow-500" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}

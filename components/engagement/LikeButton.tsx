'use client';

import { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface LikeButtonProps {
  contentId: string;
  contentType: 'post' | 'comment' | 'project';
  initialLikes: number;
  initialLiked: boolean;
  className?: string;
}

export function LikeButton({
  contentId,
  contentType,
  initialLikes,
  initialLiked,
  className,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/engagement/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          action: isLiked ? 'unlike' : 'like',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount(data.likes);
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn('gap-2', className)}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <Heart className="h-4 w-4 fill-current text-red-500" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      <span>{likeCount}</span>
    </Button>
  );
}

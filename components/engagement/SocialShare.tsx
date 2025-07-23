'use client';

import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SocialShare({
  url,
  title,
  description = '',
  className,
  variant = 'ghost',
  size = 'sm',
}: SocialShareProps) {
  const shareText = `${title}${description ? ` - ${description}` : ''}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
      `${shareText}\n\nRead more: ${url}`
    )}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy text: ', err);
    }
  };

  const shareItems = [
    {
      name: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      action: () => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      action: () => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      action: () => window.open(shareLinks.linkedin, '_blank', 'noopener,noreferrer'),
    },
    {
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      action: () => window.location.href = shareLinks.email,
    },
    {
      name: 'Copy link',
      icon: <LinkIcon className="h-4 w-4" />,
      action: copyToClipboard,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {shareItems.map((item) => (
          <DropdownMenuItem
            key={item.name}
            onSelect={(e) => {
              e.preventDefault();
              item.action();
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, FileText, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SearchResultCardProps {
  result: {
    id: string;
    type: 'post' | 'project' | 'publication';
    title: string;
    description?: string | null;
    slug: string;
    createdAt: Date;
    featuredImage?: string | null;
    status?: string;
  };
}

const typeIcons = {
  post: FileText,
  project: BookOpen,
  publication: ExternalLink,
};

const typeLabels = {
  post: 'Blog Post',
  project: 'Project',
  publication: 'Publication',
};

const typeUrls = {
  post: '/blog',
  project: '/projects',
  publication: '/publications',
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const TypeIcon = typeIcons[result.type];
  const typeLabel = typeLabels[result.type];
  const url = `${typeUrls[result.type]}/${result.slug || result.id}`;
  
  return (
    <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                result.type === 'post' && 'bg-blue-50 text-blue-700 border-blue-200',
                result.type === 'project' && 'bg-green-50 text-green-700 border-green-200',
                result.type === 'publication' && 'bg-purple-50 text-purple-700 border-purple-200',
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {typeLabel}
            </Badge>
            {result.status && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  result.status === 'ACTIVE' && 'bg-green-50 text-green-700 border-green-200',
                  result.status === 'COMPLETED' && 'bg-blue-50 text-blue-700 border-blue-200',
                  result.status === 'PLANNED' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
                )}
              >
                {result.status}
              </Badge>
            )}
          </div>
          
          <Link href={url} className="group">
            <h3 className="text-lg font-semibold leading-tight group-hover:underline">
              {result.title}
            </h3>
          </Link>
          
          {result.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {result.description}
            </p>
          )}
          
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            <span>{format(new Date(result.createdAt), 'MMMM d, yyyy')}</span>
          </div>
        </div>
        
        {result.featuredImage && (
          <div className="hidden sm:block">
            <div 
              className="h-16 w-16 rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${result.featuredImage})` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

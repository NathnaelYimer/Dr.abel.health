import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Clock, BookOpen, Eye, Calendar, Clock3, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export async function ReadingHistory() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // In a real app, you would fetch this from your database
  // This is a mock implementation
  const readingHistory = [
    {
      id: '1',
      title: 'Understanding Mental Health in the Workplace',
      type: 'post',
      slug: 'understanding-mental-health-workplace',
      readAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      readTime: 8, // minutes
      progress: 100, // percentage
    },
    {
      id: '2',
      title: 'Annual Health Checkup Guidelines',
      type: 'publication',
      slug: 'annual-health-checkup-guidelines',
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      readTime: 15,
      progress: 75,
    },
    {
      id: '3',
      title: 'Nutrition and Wellness Program',
      type: 'project',
      slug: 'nutrition-wellness-program',
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      readTime: 5,
      progress: 30,
    },
  ];

  // In a real app, you would use this query:
  /*
  const readingHistory = await prisma.readingHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { readAt: 'desc' },
    take: 10,
    include: {
      post: {
        select: {
          title: true,
          slug: true,
        },
      },
      project: {
        select: {
          title: true,
          slug: true,
        },
      },
      publication: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });
  */

  if (readingHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No reading history yet</h3>
        <p className="text-muted-foreground mt-2">
          Your reading activity will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Recently Viewed</h3>
          <p className="text-sm text-muted-foreground">
            Your recently read and viewed content
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock3 className="h-4 w-4" />
          View All History
        </Button>
      </div>

      <div className="space-y-4">
        {readingHistory.map((item) => {
          const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
          const typeUrl = `/${item.type === 'post' ? 'blog' : item.type}s`;
          const fullUrl = `${typeUrl}/${item.slug}`;
          
          return (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          item.type === 'post' && 'bg-blue-50 text-blue-700 border-blue-200',
                          item.type === 'project' && 'bg-green-50 text-green-700 border-green-200',
                          item.type === 'publication' && 'bg-purple-50 text-purple-700 border-purple-200',
                        )}
                      >
                        {typeLabel}
                      </Badge>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.readAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <h4 className="font-medium">
                      <a 
                        href={fullUrl} 
                        className="hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </h4>
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{item.readTime} min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.progress}% viewed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-more-vertical"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full',
                      item.progress > 75 ? 'bg-green-500' : 
                      item.progress > 40 ? 'bg-blue-500' : 'bg-yellow-500'
                    )}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="gap-2">
          Load More
        </Button>
      </div>
    </div>
  );
}

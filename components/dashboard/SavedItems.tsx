import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Bookmark, Folder, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export async function SavedItems() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch user's bookmarks with related content
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          createdAt: true,
          featuredImage: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          createdAt: true,
          coverImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group bookmarks by folder
  const folders = bookmarks.reduce<Record<string, typeof bookmarks>>((acc, bookmark) => {
    const folder = bookmark.folder || 'Uncategorized';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(bookmark);
    return acc;
  }, {});

  // Get all unique folders
  const folderList = Object.keys(folders).sort();

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No saved items yet</h3>
        <p className="text-muted-foreground mt-2">
          Save posts, projects, and other content to access them later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your saved items..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Folder className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      <Tabs defaultValue={folderList[0]} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start">
            {folderList.map((folder) => (
              <TabsTrigger key={folder} value={folder} className="gap-2">
                <Folder className="h-4 w-4" />
                {folder}
                <Badge variant="secondary" className="ml-1">
                  {folders[folder].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {folderList.map((folder) => (
          <TabsContent key={folder} value={folder} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {folders[folder].map((bookmark) => {
                const content = (bookmark as any).post || (bookmark as any).project;
                if (!content) return null;

                return (
                  <Card key={bookmark.id} className="h-full flex flex-col">
                    {(content as any).featuredImage || (content as any).coverImage ? (
                      <div 
                        className="h-40 bg-cover bg-center rounded-t-lg"
                        style={{ 
                          backgroundImage: `url(${(content as any).featuredImage || (content as any).coverImage})` 
                        }}
                      />
                    ) : null}
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {content.title}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(bookmark.createdAt), 'MMM d, yyyy')}
                      </div>
                      {bookmark.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {bookmark.notes}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex justify-between items-center pt-0">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

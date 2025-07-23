import { Suspense } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Metadata } from 'next';
import { SearchResults } from './search-results';
import { SearchBar } from '@/components/search/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for posts, projects, and publications',
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; page?: string };
}) {
  const query = searchParams.q || '';
  const type = (searchParams.type as 'all' | 'posts' | 'projects' | 'publications') || 'all';
  const page = parseInt(searchParams.page || '1', 10);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
        <div className="max-w-2xl mx-auto">
          <SearchBar initialQuery={query} initialFilter={type} autoFocus />
        </div>
      </div>

      {query ? (
        <Suspense
          fallback={
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          }
        >
          <SearchResults query={query} type={type} page={page} />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <SearchIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">What are you looking for?</h3>
          <p className="text-muted-foreground mt-2">
            Search for posts, projects, or publications to find what you need.
          </p>
        </div>
      )}
    </div>
  );
}

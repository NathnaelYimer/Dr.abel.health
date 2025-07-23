import { notFound } from 'next/navigation';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { prisma } from '@/lib/db';

const RESULTS_PER_PAGE = 10;

interface SearchResultsProps {
  query: string;
  type: 'all' | 'posts' | 'projects' | 'publications';
  page: number;
}

export async function SearchResults({ query, type, page }: SearchResultsProps) {
  if (!query) return null;

  const searchQuery = `%${query}%`;
  const skip = (page - 1) * RESULTS_PER_PAGE;

  try {
    // Build the where clause based on the selected type
    const whereClause = {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ],
      ...(type === 'posts' && { published: true }),
      ...(type === 'projects' && { status: 'ACTIVE' }),
    };

    // Determine which models to search based on the selected type
    const modelsToSearch = 
      type === 'all' 
        ? ['Post', 'Project', 'Publication'] 
        : [type.charAt(0).toUpperCase() + type.slice(1)];

    // Fetch results from each model in parallel
    const resultsPromises = modelsToSearch.map(async (model) => {
      const modelResults = await (prisma as any)[model].findMany({
        where: {
          ...whereClause,
          ...(model === 'Post' && { published: true }),
          ...(model === 'Project' && { status: 'ACTIVE' }),
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          createdAt: true,
          ...(model === 'Post' && { featuredImage: true }),
          ...(model === 'Project' && { status: true, featuredImage: true }),
        },
        take: RESULTS_PER_PAGE,
        skip,
        orderBy: { createdAt: 'desc' },
      });

      return modelResults.map((result: any) => ({
        ...result,
        type: model.toLowerCase(),
      }));
    });

    // Get total count for pagination
    const countPromises = modelsToSearch.map(async (model) => {
      return (prisma as any)[model].count({
        where: {
          ...whereClause,
          ...(model === 'Post' && { published: true }),
          ...(model === 'Project' && { status: 'ACTIVE' }),
        },
      });
    });

    const [results, counts] = await Promise.all([
      Promise.all(resultsPromises),
      Promise.all(countPromises),
    ]);

    const allResults = results.flat();
    const totalResults = counts.reduce((sum, count) => sum + count, 0);
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

    if (allResults.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-2">
            We couldn't find any results for "{query}". Try different keywords.
          </p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 text-sm text-muted-foreground">
          Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{query}"
          {type !== 'all' && ` in ${type}`}
        </div>

        <div className="space-y-6">
          {allResults.map((result: any) => (
            <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious 
                      href={`/search?q=${encodeURIComponent(query)}${
                        type !== 'all' ? `&type=${type}` : ''
                      }&page=${page - 1}`} 
                    />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href={`/search?q=${encodeURIComponent(query)}${
                        type !== 'all' ? `&type=${type}` : ''
                      }&page=${pageNum}`}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext 
                      href={`/search?q=${encodeURIComponent(query)}${
                        type !== 'all' ? `&type=${type}` : ''
                      }&page=${page + 1}`} 
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Search error:', error);
    notFound();
  }
}

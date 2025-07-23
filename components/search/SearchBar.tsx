'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

type FilterType = 'all' | 'posts' | 'projects' | 'publications';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
  initialFilter?: FilterType;
  showFilters?: boolean;
  onSearch?: (query: string, filter: FilterType) => void;
}

export function SearchBar({
  className,
  autoFocus = false,
  initialQuery = '',
  initialFilter = 'all',
  showFilters = true,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get('type') as FilterType) || initialFilter
  );
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Update query when search params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const type = (searchParams.get('type') as FilterType) || 'all';
    setQuery(q);
    setFilter(type);
  }, [searchParams]);

  // Fetch search suggestions
  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, filter);
    } else {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filter !== 'all') params.set('type', filter);
      router.push(`/search?${params.toString()}`);
    }
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion, filter);
    } else {
      const params = new URLSearchParams();
      params.set('q', suggestion);
      if (filter !== 'all') params.set('type', filter);
      router.push(`/search?${params.toString()}`);
    }
    setSuggestions([]);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const toggleFilter = (newFilter: FilterType) => {
    setFilter(newFilter);
    setShowFilterDropdown(false);
    if (onSearch) {
      onSearch(query, newFilter);
    } else if (query) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (newFilter !== 'all') params.set('type', newFilter);
      router.push(`/search?${params.toString()}`);
    }
  };

  const filterLabels = {
    all: 'All',
    posts: 'Blog Posts',
    projects: 'Projects',
    publications: 'Publications',
  };

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search posts, projects, and more..."
            className="w-full pl-10 pr-10 h-12 rounded-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            autoFocus={autoFocus}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="relative mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="h-4 w-4" />
              <span>{filterLabels[filter]}</span>
            </Button>
            
            {showFilterDropdown && (
              <div className="absolute z-10 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
                {Object.entries(filterLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent',
                      filter === key && 'bg-accent font-medium'
                    )}
                    onClick={() => toggleFilter(key as FilterType)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {isFocused && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-accent"
                onMouseDown={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

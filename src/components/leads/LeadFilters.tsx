import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { LeadFilters as LeadFiltersType, LeadSort } from '@/hooks/useLeads';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
  sort: LeadSort;
  onSortChange: (sort: LeadSort) => void;
  cities: string[];
  categories: string[];
}

export function LeadFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  cities,
  categories,
}: LeadFiltersProps) {
  const hasFilters = filters.status || filters.city || filters.category;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, status: value === 'all' ? null : value as LeadFiltersType['status'] })
        }
      >
        <SelectTrigger className="w-[140px] bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="pitched">Pitched</SelectItem>
          <SelectItem value="converted">Converted</SelectItem>
        </SelectContent>
      </Select>

      {/* City Filter */}
      {cities.length > 0 && (
        <Select
          value={filters.city || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, city: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, category: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Sort */}
      <Select
        value={`${sort.field}-${sort.direction}`}
        onValueChange={(value) => {
          const [field, direction] = value.split('-') as [LeadSort['field'], LeadSort['direction']];
          onSortChange({ field, direction });
        }}
      >
        <SelectTrigger className="w-[160px] bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="created_at-desc">Newest First</SelectItem>
          <SelectItem value="created_at-asc">Oldest First</SelectItem>
          <SelectItem value="rating-desc">Highest Rated</SelectItem>
          <SelectItem value="rating-asc">Lowest Rated</SelectItem>
          <SelectItem value="business_name-asc">Name A-Z</SelectItem>
          <SelectItem value="business_name-desc">Name Z-A</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

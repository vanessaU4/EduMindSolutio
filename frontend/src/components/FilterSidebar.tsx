
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  setCategory,
  setMinRating,
  setSentiment,
  setPriceRange,
  setSearchQuery,
  resetFilters,
} from '../features/filters/filterSlice';
import { Filter, RotateCw, Search, Star } from 'lucide-react';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Button } from './ui/button';

const FilterSidebar = () => {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const filters = useAppSelector((state) => state.filters);

  const [search, setSearch] = useState(filters.searchQuery);

  useEffect(() => {
    const debounce = setTimeout(() => {
      dispatch(setSearchQuery(search));
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, dispatch]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())}>
          <RotateCw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>


        {/* Price Range Filter */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <Slider
                min={0}
                max={1000}
                step={10}
                value={filters.priceRange}
                onValueChange={(value) => dispatch(setPriceRange(value as [number, number]))}
                className="w-full"
            />
        </div>

        {/* Sentiment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment</label>
          <select
            value={filters.sentiment}
            onChange={(e) => dispatch(setSentiment(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive 😃</option>
            <option value="neutral">Neutral 😐</option>
            <option value="negative">Negative 😠</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
          <div className="flex justify-between gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={filters.minRating === rating ? 'default' : 'outline'}
                size="sm"
                onClick={() => dispatch(setMinRating(filters.minRating === rating ? 0 : rating))}
                className="flex-1"
              >
                {rating} <Star className="w-4 h-4 ml-1 fill-yellow-400 text-yellow-400" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;

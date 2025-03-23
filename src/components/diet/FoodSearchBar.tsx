
import React from 'react';

interface FoodSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

export function FoodSearchBar({ 
  searchQuery, 
  setSearchQuery 
}: FoodSearchBarProps) {
  return null;
}

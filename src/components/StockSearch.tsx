
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchStocks } from '@/services/marketService';
import { Stock } from '@/types/stock';
import { useDebounce } from '@/hooks/use-debounce';

const StockSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const fetchResults = async () => {
        setIsLoading(true);
        try {
          const data = await searchStocks(debouncedSearchQuery);
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Error searching stocks:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchResults();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (stockId: string) => {
    navigate(`/stock/${stockId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0].id);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stocks..."
          className="pl-8 w-[300px]"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
      </form>
      
      {showResults && (
        <div className="absolute mt-1 w-full bg-popover border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-sm">Searching...</div>
          ) : results.length > 0 ? (
            <div>
              {results.map((stock) => (
                <div
                  key={stock.id}
                  className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onClick={() => handleResultClick(stock.id)}
                >
                  <div>
                    <div className="font-medium">{stock.id}</div>
                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className={stock.change >= 0 ? 'gain-text' : 'loss-text'}>
                    ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() !== '' ? (
            <div className="p-2 text-center text-sm">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StockSearch;

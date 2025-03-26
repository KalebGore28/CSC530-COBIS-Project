import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import debounce from 'lodash.debounce';

interface SearchInputProps<T> {
  searchApi: (query: string) => Promise<T[]>;
  onSelect: (item: T) => void;
  placeholder?: string;
  debounceTime?: number;
  renderResult: (item: T) => React.ReactNode;
}

function SearchInput<T>({
  searchApi,
  onSelect,
  placeholder = "Search...",
  debounceTime = 300,
  renderResult,
}: SearchInputProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchResults = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      searchApi(searchQuery)
        .then((data) => {
          setResults(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Search error:', error);
          setResults([]);
          setIsLoading(false);
        });
    }, debounceTime),
    [searchApi, debounceTime]
  );

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(newQuery.length > 1);
  };

  const handleSelect = (result: T) => {
    onSelect(result);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onBlur={handleBlur}
        ref={inputRef}
        className="w-full pr-8"
      />
      {query.length > 0 && (
        <button
          onClick={() => {
            setQuery('');
            setIsOpen(false);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(result)}
              >
                {renderResult(result)}
              </div>
            ))
          ) : query.length >= 2 ? (
            <div className="p-2 text-gray-500">No results found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
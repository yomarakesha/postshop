import { useState, useEffect } from "react";

const useDebounceSearch = (searchValue: string, delay: number = 500) => {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchValue, delay]);

  return debouncedSearchValue;
};

export default useDebounceSearch;

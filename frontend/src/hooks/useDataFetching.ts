import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useDataFetching<T>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(
    async (
      fetchFn: () => Promise<T>,
      errorMessage: string = "Failed to fetch data"
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchFn();
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : errorMessage;
        setState((prev) => ({ ...prev, loading: false, error: errorMsg }));
        toast.error(errorMsg);
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    fetchData,
    setData: (data: T) => setState((prev) => ({ ...prev, data })),
    setError: (error: string) => setState((prev) => ({ ...prev, error })),
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}

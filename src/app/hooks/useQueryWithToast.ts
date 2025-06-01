// Inracker/src/app/hooks/useQueryWithToast.ts
import { useQuery } from '@tanstack/react-query';

interface UseQueryWithToastOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  successMessage: string;
  errorMessage: string;
}

export const useQueryWithToast = <T>(options: UseQueryWithToastOptions<T>) => {
  const { queryKey, queryFn, successMessage, errorMessage } = options;

  return useQuery<T, unknown, Error>({
    queryKey,
    queryFn,
    onError: (error: any) => {
      console.error(errorMessage, error);
      alert(errorMessage); // Replace with a better toast implementation
    },
    onSuccess: () => {
      alert(successMessage); // Replace with a better toast implementation
    },
  });
};

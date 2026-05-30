import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AxiosError } from 'axios';

export const useApi = <T,>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(url);
      return data;
    },
    ...options,
  });
};

export const useApiMutation = <T, V = any>(
  method: 'post' | 'put' | 'delete' | 'patch',
  url: string | ((data: V) => string),
  options?: UseMutationOptions<T, AxiosError, V>
) => {
  return useMutation<T, AxiosError, V>({
    mutationFn: async (data: V) => {
      const finalUrl = typeof url === 'function' ? url(data) : url;
      const { data: responseData } = await apiClient[method]<T>(finalUrl, data);
      return responseData;
    },
    ...options,
  });
};

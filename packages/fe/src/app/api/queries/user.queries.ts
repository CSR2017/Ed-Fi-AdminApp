import { GetUserDto, PostUserDto, PutUserDto } from '@ts-app-base-se/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { methods } from '../methods';

const baseUrl = '';

export const useUser = (id: number | string) =>
  useQuery({
    queryKey: [`user`, id],
    queryFn: () => methods.getOne(`${baseUrl}/users/${id}`, GetUserDto),
  });

export const useUsers = () =>
  useQuery({
    queryKey: [`users`],
    queryFn: () =>
      methods.getManyMap<GetUserDto>(`${baseUrl}/users`, GetUserDto),
  });

export const usePostUser = (user: PostUserDto) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, unknown, AxiosResponse<GetUserDto>, any>({
    mutationFn: () =>
      methods.post(`${baseUrl}/users`, PostUserDto, GetUserDto, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const usePutUser = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: PutUserDto) =>
      methods.put(`${baseUrl}/users/${user.id}`, PutUserDto, GetUserDto, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      callback && callback();
    },
  });
};

export const useDeleteUser = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: GetUserDto['id']) =>
      methods.delete(`${baseUrl}/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      callback && callback();
    },
  });
};

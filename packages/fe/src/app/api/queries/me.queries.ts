import { GetSessionDataDto, GetTenantDto, GetUserDto, PutUserDto } from '@edanalytics/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { useNavigate } from 'react-router';
import { methods } from '../methods';

const baseUrl = '';

export const useMe = () => {
  const navigate = useNavigate();
  return useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`],
    queryFn: () =>
      axios
        .get(`${baseUrl}/auth/me`, { withCredentials: true })
        .then((res) => {
          const me = plainToInstance(GetSessionDataDto, res.data);
          // if (me.roleId === null || me.roleId === undefined) {
          //   navigate('/no-role');
          // }
          return me;
        })
        .catch((err) => {
          if (err.response.status === 401) {
            return null;
          } else {
            throw err;
          }
        }),
  });
};
export const useMyTenants = () =>
  useQuery({
    staleTime: 30 * 1000,
    queryKey: [`me`, 'tenants'],
    queryFn: () => {
      return methods.getManyMap(`${baseUrl}/auth/my-tenants`, GetTenantDto);
    },
  });
export const usePutMe = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: PutUserDto) =>
      methods.put(`${baseUrl}/users/${user.id}`, PutUserDto, GetUserDto, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      callback && callback();
    },
  });
};

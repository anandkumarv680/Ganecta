import api from './axios';

export interface RegisterBody {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  Message: string;
  token: string;
}

export async function register(body: RegisterBody) {
  const { data } = await api.post<{ Message: string }>(
    '/api/auth/users/register',
    body,
  );
  return data;
}

export async function login(body: LoginBody) {
  const { data } = await api.post<LoginResponse>('/api/auth/users/login', body);
  return data;
}

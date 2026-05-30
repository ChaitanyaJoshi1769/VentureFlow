export const setToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const removeToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const setUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!getToken();
};

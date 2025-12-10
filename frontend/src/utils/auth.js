// small auth helpers
export const saveToken = (token) => {
  localStorage.setItem('jwt', token);
};

export const getToken = () => localStorage.getItem('jwt');

export const removeToken = () => localStorage.removeItem('jwt');

export const isLoggedIn = () => !!getToken();

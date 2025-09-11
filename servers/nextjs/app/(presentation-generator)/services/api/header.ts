export const getHeader = () => {
  // Get the auth token from localStorage if available
  let authToken = '';
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token') || '';
  }
  
  return {
    "Content-Type": "application/json",
    Accept: "application/json",  
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Authorization": authToken ? `Bearer ${authToken}` : 'default_user',
  };
};

export const getHeaderForFormData = () => {
  // Get the auth token from localStorage if available
  let authToken = '';
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token') || '';
  }
  
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization",
    "Authorization": authToken ? `Bearer ${authToken}` : 'default_user',
  };
};

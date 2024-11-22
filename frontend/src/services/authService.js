export const login = async (email, password) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  };
  
  export const register = async (email, password) => {
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  };
  
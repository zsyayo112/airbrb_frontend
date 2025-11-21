import { createContext, useState, useEffect } from 'react';

// create Context
export const AuthContext = createContext();

// create Provider components
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);


  //when util is loading, read token from localstorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('emial');

    if (savedToken) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
  }, []);


  // save login information
  const saveAuth = (newToken, newEmail) => {
    setToken(newToken);
    setEmail(newEmail);
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
  };

  // 5. clear login information
  const clearAuth = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
  };

  // 6. provide to all utils
  return (
    <AuthContext.Provider value={{ token, email, saveAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
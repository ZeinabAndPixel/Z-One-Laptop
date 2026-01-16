import React, { useState, useEffect } from 'react';
import { StorePage } from './components/StorePage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar persistencia al cargar
    const storedUser = localStorage.getItem('zone_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data");
        localStorage.removeItem('zone_user');
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('zone_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zone_user');
  };

  return (
    <StorePage 
      user={user} 
      onLoginSuccess={handleLogin}
      onLogout={handleLogout}
    />
  );
}

export default App;
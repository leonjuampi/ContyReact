import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define la estructura del objeto 'user' que tu backend devuelve
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: number;
  orgId: number | null;
  branchId: number | null;
  branchIds: number[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para obtener datos guardados
const getSavedAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    return { token, user: JSON.parse(user) as User, isAuthenticated: true };
  }
  return { token: null, user: null, isAuthenticated: false };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(getSavedAuth());
  const navigate = useNavigate();

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, user, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ token: null, user: null, isAuthenticated: false });
    navigate('/login');
  };

  // Opcional: Verificar el token con el backend al cargar (más seguro)
  // useEffect(() => {
  //   if (auth.token) {
  //     // Aquí podrías llamar a tu endpoint /api/auth/refresh
  //     // para validar el token. Si falla, llamas a logout().
  //   }
  // }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
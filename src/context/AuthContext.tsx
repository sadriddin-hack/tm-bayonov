import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  canManageFinance: boolean;
  canReceivePayments: boolean;
  canEditSettings: boolean;
  canMarkAttendance: boolean;
  canDeleteStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users mapped for instant demonstration
const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; user: User }> = {
  SUPER_ADMIN: {
    email: 'admin@tmbayonov.tj',
    pass: 'admin123',
    user: {
      id: 'usr-superadmin-01',
      name: 'Устод Баёнов',
      email: 'admin@tmbayonov.tj',
      role: 'SUPER_ADMIN',
      phone: '+992900000001',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
  ADMIN: {
    email: 'manager@tmbayonov.tj',
    pass: 'admin123',
    user: {
      id: 'usr-admin-02',
      name: 'Маъмури толор',
      email: 'manager@tmbayonov.tj',
      role: 'ADMIN',
      phone: '+992900000002',
      createdAt: '2026-01-05T00:00:00Z',
    },
  },
  RECEPTION: {
    email: 'reception@tmbayonov.tj',
    pass: 'reception123',
    user: {
      id: 'usr-reception-01',
      name: 'Мадинаи Ресепшн',
      email: 'reception@tmbayonov.tj',
      role: 'RECEPTION',
      phone: '+992900000003',
      createdAt: '2026-01-10T00:00:00Z',
    },
  },
  COACH: {
    email: 'coach@tmbayonov.tj',
    pass: 'coach123',
    user: {
      id: 'usr-coach-01',
      name: 'Мураббӣ Баёнов',
      email: 'coach@tmbayonov.tj',
      role: 'COACH',
      phone: '+992900000004',
      createdAt: '2026-01-10T00:00:00Z',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tm_bayonov_jwt'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tm_bayonov_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_CREDENTIALS.RECEPTION.user;
      }
    }
    // Default active user to RECEPTION so the gym desk experience is live immediately
    return DEMO_CREDENTIALS.RECEPTION.user;
  });

  const login = async (email: string, passwordPlain: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordPlain }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Хатогии воридшавӣ');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tm_bayonov_jwt', data.token);
    localStorage.setItem('tm_bayonov_user', JSON.stringify(data.user));
  };

  const quickDemoLogin = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    try {
      await login(creds.email, creds.pass);
    } catch {
      // Fallback in case of network issue
      setUser(creds.user);
      localStorage.setItem('tm_bayonov_user', JSON.stringify(creds.user));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tm_bayonov_jwt');
    localStorage.removeItem('tm_bayonov_user');
  };

  const role = user?.role;
  const canManageFinance = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const canReceivePayments = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'RECEPTION';
  const canEditSettings = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const canMarkAttendance = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'RECEPTION' || role === 'COACH';
  const canDeleteStudent = role === 'SUPER_ADMIN' || role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        quickDemoLogin,
        logout,
        canManageFinance,
        canReceivePayments,
        canEditSettings,
        canMarkAttendance,
        canDeleteStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

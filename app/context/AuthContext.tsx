'use client';

import React, { createContext, useContext, useState } from 'react';

export type TenantId = 'tenantA' | 'tenantB';
export type Role = 'admin' | 'staff';

export interface AuthContextType {
  tenantId: TenantId | null;
  role: Role | null;
  username: string | null;
  login: (tenantId: TenantId, role: Role, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<TenantId | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const login = (newTenantId: TenantId, newRole: Role, newUsername: string) => {
    setTenantId(newTenantId);
    setRole(newRole);
    setUsername(newUsername);
  };

  const logout = () => {
    setTenantId(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ tenantId, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 Firebase Auth: Iniciando listener de estado...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Usuario ya autenticado:', user.displayName, user.email);
      } else {
        console.log('❌ No hay usuario autenticado');
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando login con Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login exitoso:', result.user.email);
      
      // Validar dominio @summan.com
      if (!result.user.email?.endsWith('@summan.com')) {
        console.log('❌ Dominio no autorizado:', result.user.email);
        await signOut(auth);
        throw new Error('Solo usuarios de @summan.com pueden acceder');
      }

      console.log('✅ Usuario autorizado:', result.user.displayName, result.user.email);
      // El user se actualiza automáticamente por onAuthStateChanged

    } catch (error: any) {
      console.error('❌ Error en autenticación:', error);
      setUser(null);
      
      // Mejorar mensajes de error
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelado por el usuario');
      } else if (error?.code === 'auth/network-request-failed') {
        throw new Error('Error de red. Verifica tu conexión a internet.');
      } else if (error?.message?.includes('@summan.com')) {
        throw error; // Mantener mensaje personalizado de dominio
      } else {
        throw new Error(error?.message || 'Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
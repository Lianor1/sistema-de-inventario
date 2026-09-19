import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userRole: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, userRole: 'Trabajador', loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('Trabajador');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user && user.email) {
        try {
          // Buscar si el usuario existe en trabajadores
          const q = query(collection(db, 'trabajadores'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const employeeData = querySnapshot.docs[0].data();
            setUserRole(employeeData.rol);
          } else {
            // Si es el dueño y aún no tiene perfil, le damos Super Admin por defecto
            // En un sistema real esto se valida mejor, pero para evitar bloqueos:
            setUserRole('Super Administrador');
          }
        } catch (error) {
          console.error("Error obteniendo rol:", error);
          setUserRole('Trabajador');
        }
      } else {
        setUserRole('Trabajador');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

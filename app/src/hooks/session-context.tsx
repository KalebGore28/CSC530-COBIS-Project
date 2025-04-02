import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the Session interface (same as in your original code)
export interface Session {
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | undefined;
    department?: string;
		college?: string;
  };
  roles: { role_id: number; role_name: string }[] | [];
  permissions: { table_name: string; column_name: string }[] | [];
  mnumber: string | null;
  is_enabled: boolean;
}

// Define the context type
interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  logout: () => void;
  refetchSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

// SessionProvider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sessionData: Session = await response.json();
      setSession(sessionData);
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const logout = () => {
    setSession(null);
  };

  const refetchSession = async () => {
    console.log('Refetching session...');
    await fetchSession();
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, logout, refetchSession }}>
      {children}
    </SessionContext.Provider>
  );
};

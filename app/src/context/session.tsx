import { createContext, ReactNode, use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { signout, getSession } from '@/lib/auth-client';
import axios from 'axios';

export interface Session {
  session: Awaited<ReturnType<typeof getSession>>;
  info: UserInfo;
}

export type UserInfo = {
  roles: { role_id: number; role_name: string }[] | [];
  department: string | null;
  college: string | null;
  mnumber: string | null;
  isEnabled: boolean;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  logout: () => void;
  refetchSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Function to fetch the session
const fetchUserInfo = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await axios.get('/api/user/me', {
    withCredentials: true,
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch user info');
  }

  return response.data;
}

// SessionProvider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  const { data: sessionResult, refetch: refetchSessionData } = useQuery({
    queryKey: ['session'],
    queryFn: getSession
  });

  const {
    data: userInfo,
    isLoading,
    refetch: refetchUserInfo
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    enabled: !!sessionResult,
  });

  // Update session when data changes
  useEffect(() => {
    if (sessionResult && userInfo) {
      setSession({
        session: sessionResult,
        info: userInfo
      });
    } else {
      setSession(null);
    }
  }, [sessionResult, userInfo]);

  const logout = () => {
    signout();
    setSession(null);
  };

  const refetchSession = async () => {
    try {
      await refetchSessionData();
      if (sessionResult) {
        await refetchUserInfo();
      }
    } catch (error) {
      console.error('Error refetching session:', error);
      setSession(null);
    }
  };

  return (
    <SessionContext.Provider value={{
      session,
      isLoading,
      logout,
      refetchSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use the session context
export const useSession = () => {
  const context = use(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export default SessionContext;
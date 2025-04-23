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

  // Query 1: Fetches basic session
  const {
    data: sessionResult,
    isLoading: isLoadingSession,
    refetch: refetchSessionData
  } = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    // Adjust staleTime/gcTime as needed for session data
    staleTime: 5 * 60 * 1000, // e.g., 5 minutes
    gcTime: 10 * 60 * 1000,  // e.g., 10 minutes
  });

  // Query 2: Fetches user details
  const {
    data: userInfo,
    isLoading: isLoadingUserInfo, // Capture isLoading specifically for Query 2
    refetch: refetchUserInfo
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    enabled: !!sessionResult, // Still enable only when sessionResult exists
    // Adjust staleTime/gcTime as needed for user info
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Combine results when both queries have data
  useEffect(() => {
    // Only set the full session object if both parts are successfully loaded
    if (sessionResult && userInfo) {
      setSession({
        session: sessionResult,
        info: userInfo
      });
    } else if (!isLoadingSession && !isLoadingUserInfo) {
      // If neither query is loading anymore, and we don't have both results,
      // assume the user is not fully logged in or there was an error.
      setSession(null);
    }
    // Add isLoading flags to dependencies if logic relies on them finishing
  }, [sessionResult, userInfo, isLoadingSession, isLoadingUserInfo]);

  const logout = async () => {
    await signout();
    setSession(null); // Clear local state
  };

  const refetchSession = async () => {
    try {
      // Refetch session first
      await refetchSessionData();
      // Refetch user info - useQuery's enabled flag handles if sessionResult exists after refetch
      await refetchUserInfo();
    } catch (error) {
      console.error('Error refetching session:', error);
      setSession(null); // Clear session on error
    }
  };

  // *** Calculate Combined Loading State ***
  // The overall session is loading if the initial session OR the user info is loading.
  // Use isFetching as well if you want loading indicators during background refetches.
  // For initial load, isLoading is usually sufficient.
  const combinedIsLoading = isLoadingSession || isLoadingUserInfo;

  return (
    <SessionContext.Provider value={{
      session,
      isLoading: combinedIsLoading, // Provide the combined loading state
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
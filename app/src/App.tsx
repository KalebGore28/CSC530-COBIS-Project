import { useState } from 'react';
import { signinGoogle } from './lib/auth-client';
import { authClient } from "@/lib/auth-client";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define TypeScript interfaces for the session and user
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined | undefined;
}

interface Session {
  user: User;
}

function App() {
  // Type the session state as Session | null
  const [session, setSession] = useState<Session | null>(null);

  const handleSession = async () => {
    try {
      const { data: sessionData, error } = await authClient.getSession();
      if (error) {
        console.error(error);
      } else {
        // @ts-ignore
        setSession(sessionData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button onClick={signinGoogle}>Sign in with Google</Button>
        <Button onClick={handleSession}>Get Session</Button>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Card style={{ minWidth: '300px', maxWidth: '500px' }}>
          <CardHeader>
            <CardTitle>Session User</CardTitle>
          </CardHeader>
          <CardContent>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {session.user.image && (
                  <Avatar style={{ border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <AvatarImage src={session.user.image} alt={`${session.user.name}'s profile picture`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                )}
                <div style={{ minWidth: '200px', wordBreak: 'break-word' }}>
                  <p><strong>Name:</strong> {session.user.name}</p>
                  <p><strong>Email:</strong> {session.user.email}</p>
                  <p><strong>Email Verified:</strong> {session.user.emailVerified ? 'Yes' : 'No'}</p>
                  <p><strong>Created At:</strong> {session.user.createdAt.toLocaleDateString()}</p>
                  <p><strong>Updated At:</strong> {session.user.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <p>No session data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
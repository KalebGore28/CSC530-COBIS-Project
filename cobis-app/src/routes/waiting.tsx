import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from '@/context/session';

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute('/waiting')({
    component: RouteComponent,
})

function RouteComponent() {
    const { session, isLoading } = useSession();
    const navigate = useNavigate();

    if (isLoading) return null;
    if (!session) navigate({ to: '/login' });
    
    // Check if the user is authenticated and has an enabled account with roles
    if (session?.isEnabled && session.mnumber && session.roles.length > 0) navigate({ to: '/' });

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Account Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your account is being processed. Please wait for approval.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={async () => {
                        await authClient.signOut();
                        navigate({ to: '/login' });
                    }}>
                        Log Out
                    </Button>
                </CardFooter>
            </Card>
        </div >
    );
}
